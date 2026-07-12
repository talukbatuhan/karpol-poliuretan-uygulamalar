"use client";

import { useCallback, useEffect, useState } from "react";

import { sharpInputClassName } from "@/components/form/SharpField";
import { APP_LINKS, type ManagedAppKey } from "@/lib/constants/app-links";
import type { ManagedUserRecord, UserRole } from "@/types/user-access";

interface FormState {
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
  allowedApps: ManagedAppKey[];
  isActive: boolean;
}

const EMPTY_FORM: FormState = {
  email: "",
  password: "",
  fullName: "",
  role: "viewer",
  allowedApps: [],
  isActive: true,
};

function toggleApp(
  apps: ManagedAppKey[],
  key: ManagedAppKey,
): ManagedAppKey[] {
  return apps.includes(key)
    ? apps.filter((item) => item !== key)
    : [...apps, key];
}

export function UsersModule() {
  const [users, setUsers] = useState<ManagedUserRecord[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(true);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/kullanicilar");
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Kullanıcılar yüklenemedi");
        setUsers([]);
        return;
      }

      setUsers(data.users ?? []);
    } catch {
      setError("Kullanıcılar yüklenemedi");
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const handleCreateNew = () => {
    setIsCreating(true);
    setSelectedId(null);
    setForm(EMPTY_FORM);
    setSuccess(null);
    setError(null);
  };

  const handleSelect = (user: ManagedUserRecord) => {
    setIsCreating(false);
    setSelectedId(user.id);
    setForm({
      email: user.email ?? "",
      password: "",
      fullName: user.fullName ?? "",
      role: user.isAdmin ? "admin" : "viewer",
      allowedApps: user.allowedApps,
      isActive: user.isActive,
    });
    setSuccess(null);
    setError(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      if (isCreating) {
        const response = await fetch("/api/kullanicilar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: form.email,
            password: form.password,
            fullName: form.fullName,
            role: form.role,
            allowedApps: form.role === "admin" ? [] : form.allowedApps,
            isActive: form.isActive,
          }),
        });
        const data = await response.json();

        if (!response.ok) {
          setError(data.error ?? "Kullanıcı oluşturulamadı");
          return;
        }

        setSuccess("Kullanıcı oluşturuldu");
        await loadUsers();
        handleSelect(data.user);
        return;
      }

      if (!selectedId) return;

      const response = await fetch(`/api/kullanicilar/${selectedId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.fullName,
          role: form.role,
          allowedApps: form.role === "admin" ? [] : form.allowedApps,
          isActive: form.isActive,
          password: form.password || undefined,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Kullanıcı güncellenemedi");
        return;
      }

      setSuccess("Kullanıcı güncellendi");
      await loadUsers();
      handleSelect(data.user);
    } catch {
      setError("Sunucuya bağlanılamadı");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedId) return;

    const confirmed = window.confirm(
      "Bu kullanıcıyı silmek istediğinize emin misiniz?",
    );
    if (!confirmed) return;

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/kullanicilar/${selectedId}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Kullanıcı silinemedi");
        return;
      }

      setSuccess("Kullanıcı silindi");
      handleCreateNew();
      await loadUsers();
    } catch {
      setError("Kullanıcı silinemedi");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(280px,2fr)_minmax(360px,3fr)] lg:items-start">
      <div className="border border-black bg-white">
        <div className="flex items-center justify-between gap-3 border-b border-black px-4 py-4">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-charcoal">
            Kullanıcılar
          </h2>
          <button
            type="button"
            onClick={handleCreateNew}
            className="border border-black bg-navy px-3 py-1.5 text-xs font-medium uppercase tracking-wide text-white hover:bg-navy-light"
          >
            + Yeni
          </button>
        </div>

        <div className="max-h-[70vh] overflow-auto">
          {isLoading ? (
            <p className="p-4 text-sm text-slate-500">Yükleniyor...</p>
          ) : users.length === 0 ? (
            <p className="p-4 text-sm text-slate-500">Henüz kullanıcı yok.</p>
          ) : (
            <ul>
              {users.map((user) => (
                <li key={user.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(user)}
                    className={`flex w-full flex-col items-start border-b border-slate-200 px-4 py-3 text-left hover:bg-slate-50 ${
                      selectedId === user.id ? "bg-slate-100" : ""
                    }`}
                  >
                    <span className="text-sm font-medium text-charcoal">
                      {user.email ?? "—"}
                    </span>
                    <span className="mt-1 text-xs text-slate-500">
                      {user.isAdmin ? "Admin" : "Kullanıcı"}
                      {" · "}
                      {user.isActive ? "Aktif" : "Pasif"}
                      {" · "}
                      {user.isAdmin
                        ? "Tüm uygulamalar"
                        : `${user.allowedApps.length} uygulama`}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="border border-black bg-white">
        <div className="border-b border-black px-4 py-4 md:px-6">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-charcoal">
            {isCreating ? "Yeni Kullanıcı" : "Kullanıcıyı Düzenle"}
          </h2>
        </div>

        <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4 p-4 md:p-6">
          {error && (
            <p className="border border-red-700 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
              {error}
            </p>
          )}
          {success && (
            <p className="border border-navy bg-slate-100 px-3 py-2 text-sm text-navy" role="status">
              {success}
            </p>
          )}

          <label className="block">
            <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
              E-posta
            </span>
            <input
              type="email"
              required
              disabled={!isCreating}
              value={form.email}
              onChange={(event) =>
                setForm((current) => ({ ...current, email: event.target.value }))
              }
              className={`${sharpInputClassName} disabled:bg-slate-50`}
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
              Ad Soyad
            </span>
            <input
              type="text"
              value={form.fullName}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  fullName: event.target.value,
                }))
              }
              className={sharpInputClassName}
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
              {isCreating ? "Şifre" : "Yeni Şifre (opsiyonel)"}
            </span>
            <input
              type="password"
              required={isCreating}
              minLength={6}
              value={form.password}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  password: event.target.value,
                }))
              }
              className={sharpInputClassName}
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
              Rol
            </span>
            <select
              value={form.role}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  role: event.target.value as UserRole,
                }))
              }
              className={sharpInputClassName}
            >
              <option value="viewer">Kullanıcı</option>
              <option value="admin">Admin</option>
            </select>
          </label>

          <label className="flex items-center gap-2 text-sm text-charcoal">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  isActive: event.target.checked,
                }))
              }
              className="h-4 w-4 border border-black accent-navy"
            />
            Hesap aktif
          </label>

          {form.role !== "admin" && (
            <fieldset>
              <legend className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                Uygulama Erişimleri
              </legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {APP_LINKS.map((app) => (
                  <label
                    key={app.key}
                    className="flex items-center gap-2 border border-slate-200 px-3 py-2 text-sm text-charcoal"
                  >
                    <input
                      type="checkbox"
                      checked={form.allowedApps.includes(app.key as ManagedAppKey)}
                      onChange={() =>
                        setForm((current) => ({
                          ...current,
                          allowedApps: toggleApp(
                            current.allowedApps,
                            app.key as ManagedAppKey,
                          ),
                        }))
                      }
                      className="h-4 w-4 border border-black accent-navy"
                    />
                    {app.label}
                  </label>
                ))}
              </div>
            </fieldset>
          )}

          {form.role === "admin" && (
            <p className="text-sm text-slate-500">
              Admin hesapları tüm uygulamalara ve kullanıcı yönetimine erişir.
            </p>
          )}

          <div className="flex flex-col gap-3 border-t border-black pt-4 sm:flex-row">
            <button
              type="submit"
              disabled={isSaving}
              className="border border-black bg-navy px-4 py-3 text-sm font-medium uppercase tracking-wide text-white hover:bg-navy-light disabled:opacity-50"
            >
              {isSaving
                ? "Kaydediliyor..."
                : isCreating
                  ? "Kullanıcı Oluştur"
                  : "Güncelle"}
            </button>

            {!isCreating && (
              <button
                type="button"
                disabled={isSaving}
                onClick={() => void handleDelete()}
                className="border border-red-700 bg-white px-4 py-3 text-sm font-medium uppercase tracking-wide text-red-700 hover:bg-red-50 disabled:opacity-50"
              >
                Sil
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
