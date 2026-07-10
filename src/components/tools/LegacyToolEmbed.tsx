"use client";

type LegacyToolEmbedProps = {
  title: string;
  src: string;
};

function withEmbedParam(src: string) {
  return src.includes("?") ? `${src}&embed=1` : `${src}?embed=1`;
}

/** Orijinal HTML — ?embed=1 ile site içi gömüm; standalone açılışta değişmez. */
export function LegacyToolEmbed({ title, src }: LegacyToolEmbedProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden touch-none">
      <iframe
        title={title}
        src={withEmbedParam(src)}
        className="block h-full min-h-0 w-full flex-1 border-0 bg-[#eef2f7] touch-none"
        allow="fullscreen"
      />
    </div>
  );
}
