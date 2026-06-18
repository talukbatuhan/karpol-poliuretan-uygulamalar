"use client";

import { useRef } from "react";

import { sharpInputClassName } from "@/components/form/SharpField";
import {
  createAttachment,
  type AttachmentCategory,
  type WorkOrderAttachment,
} from "@/types/attachment";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_FILE_SIZE_MB = 10;

interface SharpImageUploadZoneProps {
  id: string;
  label: string;
  hint: string;
  category: AttachmentCategory;
  attachments: WorkOrderAttachment[];
  onChange: (attachments: WorkOrderAttachment[]) => void;
}

export function SharpImageUploadZone({
  id,
  label,
  hint,
  category,
  attachments,
  onChange,
}: SharpImageUploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const zoneAttachments = attachments.filter(
    (attachment) => attachment.category === category,
  );

  const addFiles = (fileList: FileList | null) => {
    if (!fileList) return;

    const validFiles: WorkOrderAttachment[] = [];

    Array.from(fileList).forEach((file) => {
      if (!ACCEPTED_TYPES.includes(file.type)) return;
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) return;
      validFiles.push(createAttachment(file, category));
    });

    if (validFiles.length > 0) {
      onChange([...attachments, ...validFiles]);
    }
  };

  const removeAttachment = (attachmentId: string) => {
    const target = attachments.find((item) => item.id === attachmentId);
    if (target) URL.revokeObjectURL(target.previewUrl);
    onChange(attachments.filter((item) => item.id !== attachmentId));
  };

  return (
    <div className="flex flex-col gap-2">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-600">
          {label}
        </p>
        <p className="mt-0.5 text-xs text-slate-500">{hint}</p>
      </div>

      <div
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          addFiles(event.dataTransfer.files);
        }}
        className={`${sharpInputClassName} flex min-h-[120px] cursor-pointer flex-col items-center justify-center border-dashed bg-slate-50 text-center hover:bg-slate-100`}
      >
        <span className="text-sm font-medium text-charcoal">Görsel yükle</span>
        <span className="mt-1 text-xs text-slate-500">
          Sürükle-bırak veya tıkla · JPG, PNG, WEBP, GIF · max {MAX_FILE_SIZE_MB}MB
        </span>
      </div>

      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        multiple
        className="sr-only"
        onChange={(event) => {
          addFiles(event.target.files);
          event.target.value = "";
        }}
      />

      {zoneAttachments.length > 0 && (
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {zoneAttachments.map((attachment) => (
            <li
              key={attachment.id}
              className="group relative border border-black bg-white"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={attachment.previewUrl}
                alt={attachment.file.name}
                className="aspect-square w-full object-cover"
              />
              <div className="border-t border-black bg-slate-50 px-2 py-1">
                <p className="truncate text-[10px] text-charcoal">
                  {attachment.file.name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => removeAttachment(attachment.id)}
                className="absolute right-1 top-1 border border-black bg-white px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-red-700 opacity-0 transition-opacity group-hover:opacity-100"
                aria-label={`${attachment.file.name} dosyasını kaldır`}
              >
                Kaldır
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
