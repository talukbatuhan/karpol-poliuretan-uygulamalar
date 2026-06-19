import type { ContaRecord } from "@/types/conta";

/** Test aşaması — Supabase entegrasyonunda sıra DB'den alınır */
let contaSequence = 0;

export function peekNextContaCode(existing: ContaRecord[] = []): string {
  const maxFromRecords = existing.reduce((max, record) => {
    const match = record.contaCode.match(/^CT-(\d+)$/);
    if (!match) return max;
    return Math.max(max, Number.parseInt(match[1], 10));
  }, 0);

  const next = Math.max(contaSequence, maxFromRecords) + 1;
  return `CT-${String(next).padStart(4, "0")}`;
}

export function generateContaCode(existing: ContaRecord[] = []): string {
  const code = peekNextContaCode(existing);
  const match = code.match(/^CT-(\d+)$/);
  if (match) {
    contaSequence = Number.parseInt(match[1], 10);
  }
  return code;
}

export function createContaRecord(
  data: Omit<ContaRecord, "id" | "createdAt" | "updatedAt">,
): ContaRecord {
  const timestamp = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    ...data,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}
