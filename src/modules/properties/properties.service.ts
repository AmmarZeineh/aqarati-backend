import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { unlink } from 'fs/promises';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { CreatePropertyDto } from './dto/create-property.dto';
import { ListPropertiesQueryDto } from './dto/list-properties-query.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { UploadPropertyPhotosDto } from './dto/upload-property-photos.dto';
import { PaginatedPropertiesEntity } from './entities/paginated-properties.entity';
import { PropertyPhotoEntity } from './entities/property-photo.entity';
import { PropertyEntity } from './entities/property.entity';
import { PROPERTIES_REPOSITORY } from './repositories/properties.repository';
import type { PropertiesRepository } from './repositories/properties.repository';

@Injectable()
export class PropertiesService {
  constructor(
    @Inject(PROPERTIES_REPOSITORY)
    private readonly propertiesRepository: PropertiesRepository,
  ) {}

  async create(
    dto: CreatePropertyDto,
    user: AuthenticatedUser,
  ): Promise<PropertyEntity> {
    return this.propertiesRepository.create({
      officeId: user.officeId,
      userId: user.id,
      dto,
    });
  }

  async findMany(
    query: ListPropertiesQueryDto,
    user: AuthenticatedUser,
  ): Promise<PaginatedPropertiesEntity> {
    return this.propertiesRepository.findMany({
      officeId: user.officeId,
      query,
    });
  }

  async findById(
    propertyId: string,
    user: AuthenticatedUser,
  ): Promise<PropertyEntity> {
    return this.propertiesRepository.findById({
      officeId: user.officeId,
      propertyId,
    });
  }

  async update(
    propertyId: string,
    dto: UpdatePropertyDto,
    user: AuthenticatedUser,
  ): Promise<PropertyEntity> {
    return this.propertiesRepository.update({
      officeId: user.officeId,
      userId: user.id,
      propertyId,
      dto,
    });
  }

  async uploadPhotos(
    propertyId: string,
    dto: UploadPropertyPhotosDto,
    files: Express.Multer.File[],
    user: AuthenticatedUser,
  ): Promise<PropertyPhotoEntity[]> {
    if (!files?.length) {
      throw new BadRequestException('At least one photo is required');
    }

    try {
      return await this.propertiesRepository.uploadPhotos({
        officeId: user.officeId,
        userId: user.id,
        propertyId,
        dto,
        files: files.map((file) => ({
          url: `/uploads/properties/${file.filename}`,
          storageKey: `properties/${file.filename}`,
          sizeBytes: file.size,
          mimeType: file.mimetype,
        })),
      });
    } catch (error: unknown) {
      await this.removeUploadedFiles(files);
      throw error;
    }
  }

  private async removeUploadedFiles(
    files: Express.Multer.File[],
  ): Promise<void> {
    await Promise.allSettled(files.map((file) => unlink(file.path)));
  }
}
