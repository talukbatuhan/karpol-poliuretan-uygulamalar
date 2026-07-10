import type { DesignStudioLabels } from "@/components/design-studio/DesignStudioShell";

/** Sabit TR etiketler — next-intl gerekmez. */
export const silimDesignStudioLabels: DesignStudioLabels = {
  panelTitle: "Birincil parametreler",
  derivedTitle: "Türetilmiş ölçüler (salt okunur)",
  view2d: "2D teknik resim",
  view3d: "3D önizleme",
  workerError: "3D motor hatası",
  params: {
    disCap: "Dış çap",
    merkezCapi: "Delik merkez çapı",
    icCap: "İç çap",
    delikCapi: "Delik çapı",
    delikAdeti: "Delik adedi",
    kalinlik: "Kalınlık",
    shoreSertlik: "Shore sertlik",
    color: "Renk",
    marka: "Marka",
  },
  derived: {
    outerRadius: "Dış yarıçap",
    pcdRadius: "PCD yarıçapı",
    holeCount: "Delik sayısı",
  },
  groups: {
    dimensions: "Ölçüler",
    holes: "Delikler",
    material: "Malzeme",
    meta: "Resim bilgisi",
  },
  errors: {
    "errors.icGeDis": "İç çap dış çaptan küçük olmalı.",
    "errors.merkezGeDis": "Delik merkez çapı dış çaptan küçük olmalı.",
    "errors.merkezLeIc": "Delik merkez çapı iç çaptan büyük olmalı.",
    "errors.delikTooLarge": "Delik çapı gövdeye sığmıyor.",
    "errors.dimsPositive": "Tüm ölçüler pozitif olmalı.",
  },
  export: {
    exportPng: "PNG",
    exportPdf: "PDF",
    exportStep: "STEP",
    exportDxf: "DXF",
    exportBlocked: "Dışa aktarmadan önce doğrulama hatalarını düzeltin",
  },
};
