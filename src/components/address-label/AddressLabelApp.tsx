"use client";

import { useEffect, useState } from "react";

import { PrintLabel } from "@/components/address-label/PrintLabel";
import { RecordsPanel } from "@/components/address-label/RecordsPanel";
import { sharpInputClassName } from "@/components/form/SharpField";
import {
  DEFAULT_SENDER,
  SENDER_STORAGE_KEY,
} from "@/lib/constants/default-sender";
import { saveAddressLabel } from "@/lib/services/address-label-service";

interface PrintSnapshot {
  sender: string;
  receiver: string;
  duplicate: boolean;
}

function getStoredSender(): string {
  if (typeof window === "undefined") return DEFAULT_SENDER;
  return localStorage.getItem(SENDER_STORAGE_KEY) ?? DEFAULT_SENDER;
}

function waitForPrintRender(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setTimeout(resolve, 150);
      });
    });
  });
}

export function AddressLabelApp() {
  const [companyTitle, setCompanyTitle] = useState("");
  const [sender, setSender] = useState(DEFAULT_SENDER);
  const [receiver, setReceiver] = useState("");
  const [backupPrint, setBackupPrint] = useState(false);
  const [recordsOpen, setRecordsOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [printing, setPrinting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [senderSaved, setSenderSaved] = useState(false);
  const [printSnapshot, setPrintSnapshot] = useState<PrintSnapshot | null>(
    null,
  );

  useEffect(() => {
    setSender(getStoredSender());
  }, []);

  useEffect(() => {
    const handleAfterPrint = () => setPrintSnapshot(null);
    window.addEventListener("afterprint", handleAfterPrint);
    return () => window.removeEventListener("afterprint", handleAfterPrint);
  }, []);

  const handleSelectRecord = (record: {
    company_title: string;
    sender: string;
    receiver: string;
  }) => {
    setCompanyTitle(record.company_title);
    setSender(record.sender);
    setReceiver(record.receiver);
    setRecordsOpen(false);
    setError(null);
  };

  const handleSaveSender = () => {
    localStorage.setItem(SENDER_STORAGE_KEY, sender);
    setSenderSaved(true);
    setTimeout(() => setSenderSaved(false), 2000);
  };

  const handleSaveAddress = async () => {
    const trimmedCompany = companyTitle.trim();
    const trimmedSender = sender.trim();
    const trimmedReceiver = receiver.trim();

    if (!trimmedCompany) {
      setError("Kayıt için firma başlığı zorunludur.");
      return;
    }
    if (!trimmedSender) {
      setError("Kayıt için gönderici adresi zorunludur.");
      return;
    }
    if (!trimmedReceiver) {
      setError("Kayıt için alıcı adresi zorunludur.");
      return;
    }

    setError(null);
    setSaving(true);
    setSaveSuccess(false);

    try {
      await saveAddressLabel({
        companyTitle: trimmedCompany,
        sender: trimmedSender,
        receiver: trimmedReceiver,
      });
      setRefreshKey((key) => key + 1);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Adres kaydedilemedi.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = async () => {
    const trimmedSender = sender.trim();
    const trimmedReceiver = receiver.trim();

    if (!trimmedSender) {
      setError("Gönderici adresi zorunludur.");
      return;
    }
    if (!trimmedReceiver) {
      setError("Alıcı adresi zorunludur.");
      return;
    }

    setError(null);
    setPrinting(true);

    try {
      setPrintSnapshot({
        sender: trimmedSender,
        receiver: trimmedReceiver,
        duplicate: backupPrint,
      });

      await waitForPrintRender();
      window.print();
    } catch (err) {
      setPrintSnapshot(null);
      setError(
        err instanceof Error ? err.message : "Yazdırma başarısız.",
      );
    } finally {
      setPrinting(false);
    }
  };

  return (
    <>
      <div className="no-print flex min-h-0 flex-1 flex-col lg:flex-row">
        <div className="hidden w-72 shrink-0 lg:block">
          <RecordsPanel onSelect={handleSelectRecord} refreshKey={refreshKey} />
        </div>

        {recordsOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <button
              type="button"
              aria-label="Kayıtları kapat"
              className="absolute inset-0 bg-black/40"
              onClick={() => setRecordsOpen(false)}
            />
            <div className="absolute inset-y-0 left-0 w-80 max-w-[85vw] shadow-xl">
              <RecordsPanel
                onSelect={handleSelectRecord}
                refreshKey={refreshKey}
              />
            </div>
          </div>
        )}

        <main className="flex flex-1 flex-col">
          <div className="mx-auto w-full max-w-xl flex-1 px-4 py-6 md:px-8 md:py-8">
            <div className="mb-4 flex justify-end lg:hidden">
              <button
                type="button"
                onClick={() => setRecordsOpen(true)}
                className="border border-black bg-white px-3 py-2 text-xs font-medium uppercase tracking-wide text-charcoal hover:bg-slate-100"
              >
                Kayıtlar
              </button>
            </div>

            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="company-title"
                  className="text-xs font-medium uppercase tracking-wide text-slate-600"
                >
                  Firma Başlığı
                </label>
                <input
                  id="company-title"
                  type="text"
                  value={companyTitle}
                  onChange={(e) => setCompanyTitle(e.target.value)}
                  placeholder="ABC MAKİNA"
                  className={sharpInputClassName}
                />
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between gap-2">
                  <label
                    htmlFor="sender"
                    className="text-xs font-medium uppercase tracking-wide text-slate-600"
                  >
                    Gönderici
                  </label>
                  <button
                    type="button"
                    onClick={handleSaveSender}
                    className="text-xs font-medium text-navy hover:underline"
                  >
                    {senderSaved ? "Kaydedildi" : "Varsayılan olarak kaydet"}
                  </button>
                </div>
                <textarea
                  id="sender"
                  value={sender}
                  onChange={(e) => setSender(e.target.value)}
                  rows={5}
                  className={`${sharpInputClassName} resize-y`}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label
                  htmlFor="receiver"
                  className="text-xs font-medium uppercase tracking-wide text-slate-600"
                >
                  Alıcı
                </label>
                <textarea
                  id="receiver"
                  value={receiver}
                  onChange={(e) => setReceiver(e.target.value)}
                  rows={5}
                  placeholder="Alıcı firma ve adres bilgileri"
                  className={`${sharpInputClassName} resize-y`}
                />
              </div>

              <label className="flex cursor-pointer items-center gap-2 text-sm text-charcoal">
                <input
                  type="checkbox"
                  checked={backupPrint}
                  onChange={(e) => setBackupPrint(e.target.checked)}
                  className="h-4 w-4 border border-black accent-navy"
                />
                Yedek yazdır (A4 yatay — sağ yarıya kopya ekle)
              </label>

              {saveSuccess && (
                <p className="border-l-2 border-green-700 pl-2 text-sm text-green-700">
                  Adres kaydedildi.
                </p>
              )}

              {error && (
                <p
                  className="border-l-2 border-red-700 pl-2 text-sm text-red-700"
                  role="alert"
                >
                  {error}
                </p>
              )}

              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={() => void handleSaveAddress()}
                  disabled={saving}
                  className="w-full border border-black bg-white px-4 py-3 text-sm font-semibold uppercase tracking-wide text-charcoal hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-1"
                >
                  {saving ? "Kaydediliyor..." : "Adresi Kaydet"}
                </button>
                <button
                  type="button"
                  onClick={() => void handlePrint()}
                  disabled={printing}
                  className="w-full bg-navy px-4 py-3 text-sm font-semibold uppercase tracking-wide text-white hover:bg-navy-light disabled:cursor-not-allowed disabled:opacity-60 sm:flex-1"
                >
                  {printing ? "Yazdırılıyor..." : "Yazdır"}
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      <PrintLabel
        sender={printSnapshot?.sender ?? ""}
        receiver={printSnapshot?.receiver ?? ""}
        duplicate={printSnapshot?.duplicate ?? false}
        visible={printSnapshot !== null}
      />
    </>
  );
}
