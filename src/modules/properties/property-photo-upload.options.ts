import { BadRequestException } from '@nestjs/common';
import type { Request } from 'express';
import { mkdirSync } from 'fs';
import { randomUUID } from 'crypto';
import { join } from 'path';
import { diskStorage } from 'multer';
import type { FileFilterCallback, StorageEngine } from 'multer';

const maxPhotoSizeInBytes = 8 * 1024 * 1024;
const uploadDirectory = join(process.cwd(), 'uploads', 'properties');
const imageExtensionsByMimeType = new Map<string, string>([
  ['image/jpeg', '.jpg'],
  ['image/png', '.png'],
  ['image/webp', '.webp'],
  ['image/heic', '.heic'],
  ['image/heif', '.heif'],
]);

const storage: StorageEngine = diskStorage({
  destination: (
    _request: Request,
    _file: Express.Multer.File,
    callback: (error: Error | null, destination: string) => void,
  ) => {
    mkdirSync(uploadDirectory, { recursive: true });
    callback(null, uploadDirectory);
  },
  filename: (
    _request: Request,
    file: Express.Multer.File,
    callback: (error: Error | null, filename: string) => void,
  ) => {
    const extension = imageExtensionsByMimeType.get(file.mimetype);
    callback(null, `${Date.now()}-${randomUUID()}${extension}`);
  },
});

export const propertyPhotoUploadOptions = {
  storage,
  limits: {
    files: 10,
    fileSize: maxPhotoSizeInBytes,
  },
  fileFilter: (
    _request: Request,
    file: Express.Multer.File,
    callback: FileFilterCallback,
  ) => {
    if (!imageExtensionsByMimeType.has(file.mimetype)) {
      callback(
        new BadRequestException(
          'Only JPEG, PNG, WebP, HEIC, and HEIF images are allowed',
        ),
      );
      return;
    }

    callback(null, true);
  },
};
