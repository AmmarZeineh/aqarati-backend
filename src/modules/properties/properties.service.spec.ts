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
import { PropertiesService } from './properties.service';
import { PROPERTIES_REPOSITORY } from './repositories/properties.repository';

describe('PropertiesService', () => {
  let service: PropertiesService;
  const propertiesRepository = {
    create: jest.fn(),
    findById: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    uploadPhotos: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PropertiesService,
        {
          provide: PROPERTIES_REPOSITORY,
          useValue: propertiesRepository,
        },
      ],
    }).compile();

    service = module.get<PropertiesService>(PropertiesService);
    propertiesRepository.create.mockReset();
    propertiesRepository.findById.mockReset();
    propertiesRepository.findMany.mockReset();
    propertiesRepository.update.mockReset();
    propertiesRepository.uploadPhotos.mockReset();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('creates a property scoped to the authenticated user office', async () => {
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

    propertiesRepository.create.mockResolvedValue(property);

    await expect(service.create(dto, user)).resolves.toEqual(property);
    expect(propertiesRepository.create).toHaveBeenCalledWith({
      officeId: user.officeId,
      userId: user.id,
      dto,
    });
  });

  it('lists properties scoped to the authenticated user office', async () => {
    const query: ListPropertiesQueryDto = { page: 1, limit: 20 };
    const user = createAuthenticatedUser();
    const result = createPaginatedPropertiesEntity();

    propertiesRepository.findMany.mockResolvedValue(result);

    await expect(service.findMany(query, user)).resolves.toEqual(result);
    expect(propertiesRepository.findMany).toHaveBeenCalledWith({
      officeId: user.officeId,
      query,
    });
  });

  it('gets one property scoped to the authenticated user office', async () => {
    const user = createAuthenticatedUser();
    const property = createPropertyEntity();

    propertiesRepository.findById.mockResolvedValue(property);

    await expect(service.findById('property-id', user)).resolves.toEqual(
      property,
    );
    expect(propertiesRepository.findById).toHaveBeenCalledWith({
      officeId: user.officeId,
      propertyId: 'property-id',
    });
  });

  it('updates a property scoped to the authenticated user office', async () => {
    const user = createAuthenticatedUser();
    const dto: UpdatePropertyDto = { title: 'Updated title' };
    const property = createPropertyEntity();

    propertiesRepository.update.mockResolvedValue(property);

    await expect(service.update('property-id', dto, user)).resolves.toEqual(
      property,
    );
    expect(propertiesRepository.update).toHaveBeenCalledWith({
      officeId: user.officeId,
      userId: user.id,
      propertyId: 'property-id',
      dto,
    });
  });

  it('uploads property photos with office-scoped metadata', async () => {
    const user = createAuthenticatedUser();
    const files = createUploadedFiles();
    const photos = [createPropertyPhotoEntity()];
    const dto = { label: 'Living room' };

    propertiesRepository.uploadPhotos.mockResolvedValue(photos);

    await expect(
      service.uploadPhotos('property-id', dto, files, user),
    ).resolves.toEqual(photos);
    expect(propertiesRepository.uploadPhotos).toHaveBeenCalledWith({
      officeId: user.officeId,
      userId: user.id,
      propertyId: 'property-id',
      dto,
      files: [
        {
          url: '/uploads/properties/photo.jpg',
          storageKey: 'properties/photo.jpg',
          sizeBytes: 12345,
          mimeType: 'image/jpeg',
        },
      ],
    });
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
    availableFrom: null,
    lastConfirmedAt: null,
    createdById: 'user-id',
    updatedById: 'user-id',
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    privateDetails: null,
  };
}
