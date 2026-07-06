import Link from "next/link";

import {
  formatShoppingDate,
  formatShoppingPrice,
  type ShoppingRecord,
} from "@/types/shopping-record";

interface ShoppingCardProps {
  record: ShoppingRecord;
}

export function ShoppingCard({ record }: ShoppingCardProps) {
  return (
    <Link
      href={`/e-alisveris/${record.id}`}
      className="flex min-h-[220px] flex-col border border-black bg-white text-left transition-shadow hover:shadow-[4px_4px_0_0_#0a1628]"
    >
      {record.coverFileUrl && (
        <div className="border-b border-black">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={record.coverFileUrl}
            alt=""
            className="aspect-video w-full object-cover"
          />
        </div>
      )}

      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 text-sm font-semibold uppercase tracking-wide text-charcoal">
          {record.productName}
        </h3>

        {record.store && (
          <p className="mt-2 text-sm text-slate-600">{record.store}</p>
        )}

        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          {record.category && (
            <span className="border border-black px-2 py-0.5 uppercase tracking-wide text-charcoal">
              {record.category}
            </span>
          )}
          <span className="font-medium text-navy">
            {formatShoppingPrice(record.price)}
          </span>
        </div>

        {record.notes && (
          <p className="mt-3 line-clamp-2 flex-1 text-sm text-slate-500">
            {record.notes}
          </p>
        )}

        <p className="mt-4 border-t border-black/10 pt-3 text-[10px] font-medium uppercase tracking-wide text-slate-500">
          {formatShoppingDate(record.purchaseDate)}
          {record.fileCount > 0 ? ` · ${record.fileCount} dosya` : ""}
        </p>
      </div>
    </Link>
  );
}
