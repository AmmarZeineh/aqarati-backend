import { CreatePropertyDto } from '../dto/create-property.dto';
import { ListPropertiesQueryDto } from '../dto/list-properties-query.dto';
import { UpdatePropertyDto } from '../dto/update-property.dto';
import { UploadPropertyPhotosDto } from '../dto/upload-property-photos.dto';
import { PaginatedPropertiesEntity } from '../entities/paginated-properties.entity';
import { PropertyPhotoEntity } from '../entities/property-photo.entity';
import { PropertyEntity } from '../entities/property.entity';

export const PROPERTIES_REPOSITORY = Symbol('PROPERTIES_REPOSITORY');

export interface CreatePropertyRepositoryInput {
  officeId: string;
  userId: string;
  dto: CreatePropertyDto;
}

export interface UploadedPropertyPhotoFile {
  url: string;
  storageKey: string;
  sizeBytes: number;
  mimeType: string;
}

export interface ListPropertiesRepositoryInput {
  officeId: string;
  query: ListPropertiesQueryDto;
}

export interface FindPropertyByIdRepositoryInput {
  officeId: string;
  propertyId: string;
}

export interface UpdatePropertyRepositoryInput {
  officeId: string;
  userId: string;
  propertyId: string;
  dto: UpdatePropertyDto;
}

export interface UploadPropertyPhotosRepositoryInput {
  officeId: string;
  userId: string;
  propertyId: string;
  dto: UploadPropertyPhotosDto;
  files: UploadedPropertyPhotoFile[];
}

export interface PropertiesRepository {
  create(input: CreatePropertyRepositoryInput): Promise<PropertyEntity>;
  findMany(
    input: ListPropertiesRepositoryInput,
  ): Promise<PaginatedPropertiesEntity>;
  findById(input: FindPropertyByIdRepositoryInput): Promise<PropertyEntity>;
  update(input: UpdatePropertyRepositoryInput): Promise<PropertyEntity>;
  uploadPhotos(
    input: UploadPropertyPhotosRepositoryInput,
  ): Promise<PropertyPhotoEntity[]>;
}
