import { PhotoVisibility } from '@prisma/client';

export class PropertyPhotoEntity {
  id: string;
  propertyId: string;
  officeId: string;
  url: string;
  thumbnailUrl: string | null;
  storageKey: string | null;
  thumbnailStorageKey: string | null;
  label: string | null;
  roomType: string | null;
  sortOrder: number;
  visibility: PhotoVisibility;
  width: number | null;
  height: number | null;
  sizeBytes: number | null;
  mimeType: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
