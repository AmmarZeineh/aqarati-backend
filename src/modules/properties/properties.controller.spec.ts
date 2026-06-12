import { Test, TestingModule } from '@nestjs/testing';
import {
  FurnishingStatus,
  MemberRole,
  PropertyPurpose,
  PropertyStatus,
  PropertyType,
} from '@prisma/client';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { CreatePropertyDto } from './dto/create-property.dto';
import { ListPropertiesQueryDto } from './dto/list-properties-query.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { PaginatedPropertiesEntity } from './entities/paginated-properties.entity';
import { PropertyEntity } from './entities/property.entity';
import { PropertiesController } from './properties.controller';
import { PropertiesService } from './properties.service';

describe('PropertiesController', () => {
  let controller: PropertiesController;
  const propertiesService = {
    create: jest.fn(),
    findById: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    uploadPhotos: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PropertiesController],
      providers: [
        {
          provide: PropertiesService,
          useValue: propertiesService,
        },
      ],
    }).compile();

    controller = module.get<PropertiesController>(PropertiesController);
    propertiesService.create.mockReset();
    propertiesService.findById.mockReset();
    propertiesService.findMany.mockReset();
    propertiesService.update.mockReset();
    propertiesService.uploadPhotos.mockReset();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('delegates property creation to the service', async () => {
    const dto: CreatePropertyDto = {
      title: 'Apartment in Mezzeh',
      type: PropertyType.APARTMENT,
      purpose: PropertyPurpose.SALE,
    };
    const user: AuthenticatedUser = {
      id: 'user-id',
      email: 'owner@example.com',
      fullName: 'Office Owner',
      membershipId: 'membership-id',
      officeId: 'office-id',
      role: MemberRole.OWNER,
    };
    const property = createPropertyEntity();

    propertiesService.create.mockResolvedValue(property);

    await expect(controller.create(dto, user)).resolves.toEqual(property);
    expect(propertiesService.create).toHaveBeenCalledWith(dto, user);
  });

  it('delegates property listing to the service', async () => {
    const user = createAuthenticatedUser();
    const query: ListPropertiesQueryDto = { page: 1, limit: 20 };
    const result = createPaginatedPropertiesEntity();

    propertiesService.findMany.mockResolvedValue(result);

    await expect(controller.findMany(query, user)).resolves.toEqual(result);
    expect(propertiesService.findMany).toHaveBeenCalledWith(query, user);
  });

  it('delegates single property lookup to the service', async () => {
    const user = createAuthenticatedUser();
    const property = createPropertyEntity();

    propertiesService.findById.mockResolvedValue(property);

    await expect(controller.findById('property-id', user)).resolves.toEqual(
      property,
    );
    expect(propertiesService.findById).toHaveBeenCalledWith(
      'property-id',
      user,
    );
  });

  it('delegates property updates to the service', async () => {
    const user = createAuthenticatedUser();
    const dto: UpdatePropertyDto = { title: 'Updated title' };
    const property = createPropertyEntity();

    propertiesService.update.mockResolvedValue(property);

    await expect(controller.update('property-id', dto, user)).resolves.toEqual(
      property,
    );
    expect(propertiesService.update).toHaveBeenCalledWith(
      'property-id',
      dto,
      user,
    );
  });

  it('delegates photo uploads to the service', async () => {
    const user = createAuthenticatedUser();
    const files = createUploadedFiles();
    const dto = { label: 'Living room' };
    const photos = [createPropertyPhotoEntity()];

    propertiesService.uploadPhotos.mockResolvedValue(photos);

    await expect(
      controller.uploadPhotos('property-id', dto, files, user),
    ).resolves.toEqual(photos);
    expect(propertiesService.uploadPhotos).toHaveBeenCalledWith(
      'property-id',
      dto,
      files,
      user,
    );
  });
});

function createAuthenticatedUser(): AuthenticatedUser {
  return {
    id: 'user-id',
    email: 'owner@example.com',
    fullName: 'Office Owner',
    membershipId: 'membership-id',
    officeId: 'office-id',
    role: MemberRole.OWNER,
  };
}

function createUploadedFiles(): Express.Multer.File[] {
  return [
    {
      fieldname: 'photos',
      originalname: 'photo.jpg',
      encoding: '7bit',
      mimetype: 'image/jpeg',
      size: 12345,
      destination: '/tmp',
      filename: 'photo.jpg',
      path: '/tmp/photo.jpg',
      buffer: Buffer.from(''),
      stream: undefined,
    } as unknown as Express.Multer.File,
  ];
}

function createPropertyPhotoEntity() {
  const now = new Date();

  return {
    id: 'photo-id',
    propertyId: 'property-id',
    officeId: 'office-id',
    url: '/uploads/properties/photo.jpg',
    thumbnailUrl: null,
    storageKey: 'properties/photo.jpg',
    thumbnailStorageKey: null,
    label: 'Living room',
    roomType: null,
    sortOrder: 0,
    visibility: 'PUBLIC',
    width: null,
    height: null,
    sizeBytes: 12345,
    mimeType: 'image/jpeg',
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  };
}

function createPaginatedPropertiesEntity(): PaginatedPropertiesEntity {
  return {
    data: [createPropertyEntity()],
    meta: {
      page: 1,
      limit: 20,
      total: 1,
      totalPages: 1,
    },
  };
}

function createPropertyEntity(): PropertyEntity {
  const now = new Date();

  return {
    id: 'property-id',
    officeId: 'office-id',
    code: null,
    title: 'Apartment in Mezzeh',
    type: PropertyType.APARTMENT,
    purpose: PropertyPurpose.SALE,
    status: PropertyStatus.DRAFT,
    country: null,
    city: null,
    area: null,
    neighborhood: null,
    publicLocationText: null,
    latitude: null,
    longitude: null,
    price: null,
    currency: 'USD',
    isPriceNegotiable: false,
    sizeSqm: null,
    landSizeSqm: null,
    rooms: null,
    bedrooms: null,
    bathrooms: null,
    floor: null,
    totalFloors: null,
    buildingAgeYears: null,
    furnishing: FurnishingStatus.UNKNOWN,
    hasElevator: null,
    hasParking: null,
    hasBalcony: null,
    hasGarden: null,
    hasPool: null,
    hasHeating: null,
    hasCooling: null,
    descriptionPublic: null,
    notesInternal: null,
    lastConfirmedAt: null,
    availableFrom: null,
    createdById: 'user-id',
    updatedById: 'user-id',
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    privateDetails: null,
  };
}
