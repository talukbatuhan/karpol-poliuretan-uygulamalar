"use client";

import { useRef } from "react";

import { sharpInputClassName } from "@/components/form/SharpField";
import {
  createPendingFile,
  type PendingShoppingFile,
  type ShoppingRecordFile,
} from "@/types/shopping-record";

const ACCEPTED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
];
const MAX_FILE_SIZE_MB = 10;

interface ShoppingFileUploadProps {
  pendingFiles: PendingShoppingFile[];
  existingFiles: ShoppingRecordFile[];
  removedFileIds: string[];
  onPendingChange: (files: PendingShoppingFile[]) => void;
  onRemoveExisting: (fileId: string) => void;
  onRestoreExisting: (fileId: string) => void;
}

export function ShoppingFileUpload({
  pendingFiles,
  existingFiles,
  removedFileIds,
  onPendingChange,
  onRemoveExisting,
  onRestoreExisting,
}: ShoppingFileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = (fileList: FileList | null) => {
    if (!fileList) return;

    const validFiles: PendingShoppingFile[] = [];

    Array.from(fileList).forEach((file) => {
      if (!ACCEPTED_TYPES.includes(file.type)) return;
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) return;
      validFiles.push(createPendingFile(file));
    });

    if (validFiles.length > 0) {
      onPendingChange([...pendingFiles, ...validFiles]);
    }
  };

  const removePending = (id: string) => {
    const target = pendingFiles.find((file) => file.id === id);
    if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
    onPendingChange(pendingFiles.filter((file) => file.id !== id));
  };

  const visibleExisting = existingFiles.filter(
    (file) => !removedFileIds.includes(file.id),
  );

  return (
    <div className="flex flex-col gap-2">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-600">
          Dosyalar
        </p>
        <p className="mt-0.5 text-xs text-slate-500">
          PDF, JPG, PNG, WEBP · max {MAX_FILE_SIZE_MB}MB
        </p>
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
        className={`${sharpInputClassName} flex min-h-[100px] cursor-pointer flex-col items-center justify-center border-dashed bg-slate-50 text-center hover:bg-slate-100`}
      >
        <span className="text-sm font-medium text-charcoal">Dosya ekle</span>
        <span className="mt-1 text-xs text-slate-500">
          Sürükle-bırak veya tıkla
        </span>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        multiple
        className="sr-only"
        onChange={(event) => {
          addFiles(event.target.files);
          event.target.value = "";
        }}
      />

      {(visibleExisting.length > 0 || pendingFiles.length > 0) && (
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {visibleExisting.map((file) => (
            <li
              key={file.id}
              className="flex items-center justify-between border border-black bg-white px-3 py-2"
            >
              <div className="min-w-0">
                <p className="truncate text-sm text-charcoal">{file.fileName}</p>
                <p className="text-[10px] uppercase tracking-wide text-slate-500">
                  Mevcut dosya
                </p>
              </div>
              <button
                type="button"
                onClick={() => onRemoveExisting(file.id)}
                className="ml-2 shrink-0 text-xs font-medium uppercase tracking-wide text-red-700"
              >
                Kaldır
              </button>
            </li>
          ))}

          {removedFileIds.map((fileId) => {
            const file = existingFiles.find((item) => item.id === fileId);
            if (!file) return null;

            return (
              <li
                key={fileId}
                className="flex items-center justify-between border border-dashed border-slate-400 bg-slate-50 px-3 py-2 opacity-70"
              >
                <p className="truncate text-sm text-slate-600">{file.fileName}</p>
                <button
                  type="button"
                  onClick={() => onRestoreExisting(fileId)}
                  className="ml-2 shrink-0 text-xs font-medium uppercase tracking-wide text-navy"
                >
                  Geri al
                </button>
              </li>
            );
          })}

          {pendingFiles.map((file) => (
            <li
              key={file.id}
              className="group relative border border-black bg-white"
            >
              {file.previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={file.previewUrl}
                  alt={file.file.name}
                  className="aspect-video w-full object-cover"
                />
              ) : (
                <div className="flex aspect-video items-center justify-center bg-slate-100 text-xs font-medium uppercase tracking-wide text-slate-600">
                  PDF
                </div>
              )}
              <div className="border-t border-black px-2 py-1">
                <p className="truncate text-[10px] text-charcoal">
                  {file.file.name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => removePending(file.id)}
                className="absolute right-1 top-1 border border-black bg-white px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-red-700"
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
