import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { canAccessApp, buildAccessProfile } from "@/lib/auth/access";
import { getActiveAppKey } from "@/lib/constants/app-links";

const PUBLIC_ROUTES = ["/login", "/auth/callback", "/adres-yazici", "/g"];

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isPublicRoute = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  if (!user && !isPublicRoute) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (user && pathname === "/login") {
    const redirectTo = request.nextUrl.searchParams.get("redirect") || "/";
    const homeUrl = request.nextUrl.clone();
    homeUrl.pathname = redirectTo;
    homeUrl.search = "";
    return NextResponse.redirect(homeUrl);
  }

  if (user && !isPublicRoute) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, email, full_name, role, allowed_apps, is_active")
      .eq("id", user.id)
      .maybeSingle();

    const access = buildAccessProfile({
      id: user.id,
      email: user.email ?? profile?.email,
      fullName: profile?.full_name,
      role: profile?.role,
      allowedApps: profile?.allowed_apps,
      isActive: profile?.is_active ?? true,
    });

    if (!access.isActive) {
      await supabase.auth.signOut();
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.searchParams.set("error", "inactive");
      return NextResponse.redirect(loginUrl);
    }

    const appKey = getActiveAppKey(pathname);
    if (appKey && !canAccessApp(access, appKey)) {
      const homeUrl = request.nextUrl.clone();
      homeUrl.pathname = "/";
      homeUrl.search = "";
      return NextResponse.redirect(homeUrl);
    }
  }

  return supabaseResponse;
}
