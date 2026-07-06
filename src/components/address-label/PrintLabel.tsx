"use client";

import { createPortal } from "react-dom";

interface LabelCardProps {
  sender: string;
  receiver: string;
}

function AddressBlock({ text }: { text: string }) {
  return (
    <div className="whitespace-pre-wrap text-[10pt] leading-snug text-black">
      {text}
    </div>
  );
}

function LabelCard({ sender, receiver }: LabelCardProps) {
  return (
    <div className="label-half flex h-full flex-col bg-white text-black">
      <div className="flex items-center gap-3 px-5 pt-5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.png"
          alt="Logo"
          className="h-12 w-auto object-contain"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/qr.png"
          alt="QR Kod"
          className="h-12 w-12 object-contain"
        />
      </div>

      <div className="mx-5 mt-4 border-t border-black" />

      <div className="flex-1 px-5 py-4">
        <p className="mb-2 text-[7pt] font-semibold uppercase tracking-widest text-slate-600">
          Gönderici
        </p>
        <AddressBlock text={sender} />
      </div>

      <div className="mx-5 border-t border-black" />

      <div className="flex-1 px-5 py-4 pb-6">
        <p className="mb-2 text-[7pt] font-semibold uppercase tracking-widest text-slate-600">
          Alıcı
        </p>
        <AddressBlock text={receiver} />
      </div>
    </div>
  );
}

interface PrintLabelProps {
  sender: string;
  receiver: string;
  duplicate: boolean;
  visible: boolean;
}

export function PrintLabel({
  sender,
  receiver,
  duplicate,
  visible,
}: PrintLabelProps) {
  if (!visible || typeof document === "undefined") return null;

  return createPortal(
    <div
      id="print-label"
      className={`print-sheet ${duplicate ? "print-sheet--duplicate" : ""}`}
      aria-hidden="true"
    >
      <LabelCard sender={sender} receiver={receiver} />
      {duplicate && <LabelCard sender={sender} receiver={receiver} />}
    </div>,
    document.body,
  );
}
