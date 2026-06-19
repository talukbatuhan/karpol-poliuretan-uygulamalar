/**
 * FormData'dan yüklenen dosyaları okur.
 */
export function getUploadedFiles(formData: FormData, fieldName: string): File[] {
  return formData
    .getAll(fieldName)
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);
}
