export type AttachmentCategory = "product" | "technical";

export interface WorkOrderAttachment {
  id: string;
  file: File;
  previewUrl: string;
  category: AttachmentCategory;
}

export function createAttachment(
  file: File,
  category: AttachmentCategory,
): WorkOrderAttachment {
  return {
    id: crypto.randomUUID(),
    file,
    previewUrl: URL.createObjectURL(file),
    category,
  };
}

export function revokeAttachments(attachments: WorkOrderAttachment[]): void {
  attachments.forEach((attachment) => URL.revokeObjectURL(attachment.previewUrl));
}
