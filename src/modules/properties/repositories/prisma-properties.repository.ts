import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ActivityAction, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/services/prisma.service';
import {
  CreatePropertyRepositoryInput,
  FindPropertyByIdRepositoryInput,
  ListPropertiesRepositoryInput,
  PropertiesRepository,
  UpdatePropertyRepositoryInput,
  UploadPropertyPhotosRepositoryInput,
} from './properties.repository';
import { PaginatedPropertiesEntity } from '../entities/paginated-properties.entity';
import { PropertyPhotoEntity } from '../entities/property-photo.entity';
import {
  PropertyEntity,
  PropertyPrivateDetailsEntity,
} from '../entities/property.entity';

const propertySelect = {
  id: true,
  officeId: true,
  code: true,
  title: true,
  type: true,
  purpose: true,
  status: true,
  country: true,
  city: true,
  area: true,
  neighborhood: true,
  publicLocationText: true,
  latitude: true,
  longitude: true,
  price: true,
  currency: true,
  isPriceNegotiable: true,
  sizeSqm: true,
  landSizeSqm: true,
  rooms: true,
  bedrooms: true,
  bathrooms: true,
  floor: true,
  totalFloors: true,
  buildingAgeYears: true,
  furnishing: true,
  hasElevator: true,
  hasParking: true,
  hasBalcony: true,
  hasGarden: true,
  hasPool: true,
  hasHeating: true,
  hasCooling: true,
  descriptionPublic: true,
  notesInternal: true,
  availableFrom: true,
  lastConfirmedAt: true,
  createdById: true,
  updatedById: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  privateDetails: {
    select: {
      id: true,
      propertyId: true,
      officeId: true,
      ownerName: true,
      ownerPhone: true,
      ownerWhatsapp: true,
      exactAddress: true,
      privateLocationNote: true,
      minimumAcceptablePrice: true,
      commissionNote: true,
      legalNote: true,
      internalWarning: true,
      createdAt: true,
      updatedAt: true,
    },
  },
} satisfies Prisma.PropertySelect;

type SelectedProperty = Prisma.PropertyGetPayload<{
  select: typeof propertySelect;
}>;

const propertyPhotoSelect = {
  id: true,
  propertyId: true,
  officeId: true,
  url: true,
  thumbnailUrl: true,
  storageKey: true,
  thumbnailStorageKey: true,
  label: true,
  roomType: true,
  sortOrder: true,
  visibility: true,
  width: true,
  height: true,
  sizeBytes: true,
  mimeType: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
} satisfies Prisma.PropertyPhotoSelect;

type SelectedPropertyPhoto = Prisma.PropertyPhotoGetPayload<{
  select: typeof propertyPhotoSelect;
}>;

const propertyWithPhotosSelect = {
  ...propertySelect,
  photos: {
    where: {
      deletedAt: null,
    },
    orderBy: {
      sortOrder: 'asc',
    },
    select: propertyPhotoSelect,
  },
} satisfies Prisma.PropertySelect;

type SelectedPropertyWithPhotos = Prisma.PropertyGetPayload<{
  select: typeof propertyWithPhotosSelect;
}>;

@Injectable()
export class PrismaPropertiesRepository implements PropertiesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreatePropertyRepositoryInput): Promise<PropertyEntity> {
    try {
      const property = await this.prisma.$transaction(async (tx) => {
        const createdProperty = await tx.property.create({
          data: {
            officeId: input.officeId,
            code: input.dto.code,
            title: input.dto.title,
            type: input.dto.type,
            purpose: input.dto.purpose,
            status: input.dto.status,
            country: input.dto.country,
            city: input.dto.city,
            area: input.dto.area,
            neighborhood: input.dto.neighborhood,
            publicLocationText: input.dto.publicLocationText,
            latitude: input.dto.latitude,
            longitude: input.dto.longitude,
            price: input.dto.price,
            currency: input.dto.currency,
            isPriceNegotiable: input.dto.isPriceNegotiable,
            sizeSqm: input.dto.sizeSqm,
            landSizeSqm: input.dto.landSizeSqm,
            rooms: input.dto.rooms,
            bedrooms: input.dto.bedrooms,
            bathrooms: input.dto.bathrooms,
            floor: input.dto.floor,
            totalFloors: input.dto.totalFloors,
            buildingAgeYears: input.dto.buildingAgeYears,
            furnishing: input.dto.furnishing,
            hasElevator: input.dto.hasElevator,
            hasParking: input.dto.hasParking,
            hasBalcony: input.dto.hasBalcony,
            hasGarden: input.dto.hasGarden,
            hasPool: input.dto.hasPool,
            hasHeating: input.dto.hasHeating,
            hasCooling: input.dto.hasCooling,
            descriptionPublic: input.dto.descriptionPublic,
            notesInternal: input.dto.notesInternal,
            availableFrom: input.dto.availableFrom,
            createdById: input.userId,
            updatedById: input.userId,
            privateDetails: this.createPrivateDetails(input),
          },
          select: propertySelect,
        });

        await tx.activityLog.create({
          data: {
            officeId: input.officeId,
            userId: input.userId,
            action: ActivityAction.CREATE,
            entityType: 'Property',
            entityId: createdProperty.id,
            message: `Created property ${createdProperty.title}`,
          },
          select: { id: true },
        });

        return createdProperty;
      });

      return this.toEntity(property);
    } catch (error: unknown) {
      this.handlePrismaError(error);
      throw error;
    }
  }

  async findMany(
    input: ListPropertiesRepositoryInput,
  ): Promise<PaginatedPropertiesEntity> {
    const page = input.query.page ?? 1;
    const limit = input.query.limit ?? 20;
    const skip = (page - 1) * limit;
    const where = this.createPropertyWhere(input);

    const [data, total] = await this.prisma.$transaction([
      this.prisma.property.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: propertyWithPhotosSelect,
      }),
      this.prisma.property.count({ where }),
    ]);

    return {
      data: data.map((property) => this.toEntityWithPhotos(property)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(
    input: FindPropertyByIdRepositoryInput,
  ): Promise<PropertyEntity> {
    const property = await this.prisma.property.findFirst({
      where: {
        id: input.propertyId,
        officeId: input.officeId,
        deletedAt: null,
      },
      select: propertyWithPhotosSelect,
    });

    if (!property) {
      throw new NotFoundException('Property not found in this office');
    }

    return this.toEntityWithPhotos(property);
  }

  async update(input: UpdatePropertyRepositoryInput): Promise<PropertyEntity> {
    try {
      const property = await this.prisma.$transaction(async (tx) => {
        const existingProperty = await tx.property.findFirst({
          where: {
            id: input.propertyId,
            officeId: input.officeId,
            deletedAt: null,
          },
          select: {
            id: true,
            title: true,
          },
        });

        if (!existingProperty) {
          throw new NotFoundException('Property not found in this office');
        }

        const updatedProperty = await tx.property.update({
          where: { id: existingProperty.id },
          data: this.createPropertyUpdateData(input),
          select: propertyWithPhotosSelect,
        });

        await tx.activityLog.create({
          data: {
            officeId: input.officeId,
            userId: input.userId,
            action: ActivityAction.UPDATE,
            entityType: 'Property',
            entityId: updatedProperty.id,
            message: `Updated property ${updatedProperty.title}`,
            metadata: {
              previousTitle: existingProperty.title,
            },
          },
          select: { id: true },
        });

        return updatedProperty;
      });

      return this.toEntityWithPhotos(property);
    } catch (error: unknown) {
      this.handlePrismaError(error);
      throw error;
    }
  }

  async uploadPhotos(
    input: UploadPropertyPhotosRepositoryInput,
  ): Promise<PropertyPhotoEntity[]> {
    try {
      const photos = await this.prisma.$transaction(async (tx) => {
        const property = await tx.property.findFirst({
          where: {
            id: input.propertyId,
            officeId: input.officeId,
            deletedAt: null,
          },
          select: {
            id: true,
            title: true,
          },
        });

        if (!property) {
          throw new NotFoundException('Property not found in this office');
        }

        const sortOrderStart =
          input.dto.sortOrderStart ??
          (await this.nextPhotoSortOrder(tx, input));

        const createdPhotos: SelectedPropertyPhoto[] = [];

        for (const [index, file] of input.files.entries()) {
          const photo = await tx.propertyPhoto.create({
            data: {
              propertyId: input.propertyId,
              officeId: input.officeId,
              url: file.url,
              storageKey: file.storageKey,
              label: input.dto.label,
              roomType: input.dto.roomType,
              sortOrder: sortOrderStart + index,
              visibility: input.dto.visibility,
              sizeBytes: file.sizeBytes,
              mimeType: file.mimeType,
            },
            select: propertyPhotoSelect,
          });

          createdPhotos.push(photo);
        }

        await tx.activityLog.create({
          data: {
            officeId: input.officeId,
            userId: input.userId,
            action: ActivityAction.UPLOAD_PHOTO,
            entityType: 'Property',
            entityId: property.id,
            message: `Uploaded ${createdPhotos.length} property photo(s)`,
            metadata: {
              propertyTitle: property.title,
              photoIds: createdPhotos.map((photo) => photo.id),
            },
          },
          select: { id: true },
        });

        return createdPhotos;
      });

      return photos.map((photo) => this.toPhotoEntity(photo));
    } catch (error: unknown) {
      this.handlePrismaError(error);
      throw error;
    }
  }

  private createPrivateDetails(
    input: CreatePropertyRepositoryInput,
  ):
    | Prisma.PropertyPrivateDetailsCreateNestedOneWithoutPropertyInput
    | undefined {
    if (!input.dto.privateDetails) {
      return undefined;
    }

    return {
      create: {
        officeId: input.officeId,
        ownerName: input.dto.privateDetails.ownerName,
        ownerPhone: input.dto.privateDetails.ownerPhone,
        ownerWhatsapp: input.dto.privateDetails.ownerWhatsapp,
        exactAddress: input.dto.privateDetails.exactAddress,
        privateLocationNote: input.dto.privateDetails.privateLocationNote,
        minimumAcceptablePrice: input.dto.privateDetails.minimumAcceptablePrice,
        commissionNote: input.dto.privateDetails.commissionNote,
        legalNote: input.dto.privateDetails.legalNote,
        internalWarning: input.dto.privateDetails.internalWarning,
      },
    };
  }

  private createPropertyUpdateData(
    input: UpdatePropertyRepositoryInput,
  ): Prisma.PropertyUpdateInput {
    return {
      code: input.dto.code,
      title: input.dto.title,
      type: input.dto.type,
      purpose: input.dto.purpose,
      status: input.dto.status,
      country: input.dto.country,
      city: input.dto.city,
      area: input.dto.area,
      neighborhood: input.dto.neighborhood,
      publicLocationText: input.dto.publicLocationText,
      latitude: input.dto.latitude,
      longitude: input.dto.longitude,
      price: input.dto.price,
      currency: input.dto.currency,
      isPriceNegotiable: input.dto.isPriceNegotiable,
      sizeSqm: input.dto.sizeSqm,
      landSizeSqm: input.dto.landSizeSqm,
      rooms: input.dto.rooms,
      bedrooms: input.dto.bedrooms,
      bathrooms: input.dto.bathrooms,
      floor: input.dto.floor,
      totalFloors: input.dto.totalFloors,
      buildingAgeYears: input.dto.buildingAgeYears,
      furnishing: input.dto.furnishing,
      hasElevator: input.dto.hasElevator,
      hasParking: input.dto.hasParking,
      hasBalcony: input.dto.hasBalcony,
      hasGarden: input.dto.hasGarden,
      hasPool: input.dto.hasPool,
      hasHeating: input.dto.hasHeating,
      hasCooling: input.dto.hasCooling,
      descriptionPublic: input.dto.descriptionPublic,
      notesInternal: input.dto.notesInternal,
      availableFrom: input.dto.availableFrom,
      updatedBy: { connect: { id: input.userId } },
      privateDetails: this.createPrivateDetailsUpdate(input),
    };
  }

  private createPrivateDetailsUpdate(
    input: UpdatePropertyRepositoryInput,
  ):
    | Prisma.PropertyPrivateDetailsUpdateOneWithoutPropertyNestedInput
    | undefined {
    if (!input.dto.privateDetails) {
      return undefined;
    }

    const data = {
      ownerName: input.dto.privateDetails.ownerName,
      ownerPhone: input.dto.privateDetails.ownerPhone,
      ownerWhatsapp: input.dto.privateDetails.ownerWhatsapp,
      exactAddress: input.dto.privateDetails.exactAddress,
      privateLocationNote: input.dto.privateDetails.privateLocationNote,
      minimumAcceptablePrice: input.dto.privateDetails.minimumAcceptablePrice,
      commissionNote: input.dto.privateDetails.commissionNote,
      legalNote: input.dto.privateDetails.legalNote,
      internalWarning: input.dto.privateDetails.internalWarning,
    };

    if (!Object.values(data).some((value) => value !== undefined)) {
      return undefined;
    }

    return {
      upsert: {
        create: {
          officeId: input.officeId,
          ...data,
        },
        update: data,
      },
    };
  }

  private handlePrismaError(error: unknown): void {
    if (!(error instanceof Prisma.PrismaClientKnownRequestError)) {
      return;
    }

    switch (error.code) {
      case 'P2002':
        throw new ConflictException(
          'Property code already exists in this office',
        );
      case 'P2003':
        throw new BadRequestException('Invalid property relation');
      case 'P2025':
        throw new NotFoundException('Property record not found');
    }
  }

  private createPropertyWhere(
    input: ListPropertiesRepositoryInput,
  ): Prisma.PropertyWhereInput {
    const search = input.query.search;
    const where: Prisma.PropertyWhereInput = {
      officeId: input.officeId,
      deletedAt: null,
      status: input.query.status,
      type: input.query.type,
      purpose: input.query.purpose,
      city: input.query.city,
      area: input.query.area,
    };

    if (!search) {
      return where;
    }

    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { code: { contains: search, mode: 'insensitive' } },
      { city: { contains: search, mode: 'insensitive' } },
      { area: { contains: search, mode: 'insensitive' } },
      { neighborhood: { contains: search, mode: 'insensitive' } },
      { publicLocationText: { contains: search, mode: 'insensitive' } },
    ];

    return where;
  }

  private toEntity(property: SelectedProperty): PropertyEntity {
    return {
      ...property,
      latitude: this.decimalToString(property.latitude),
      longitude: this.decimalToString(property.longitude),
      price: this.decimalToString(property.price),
      sizeSqm: this.decimalToString(property.sizeSqm),
      landSizeSqm: this.decimalToString(property.landSizeSqm),
      privateDetails: property.privateDetails
        ? this.toPrivateDetailsEntity(property.privateDetails)
        : null,
    };
  }

  private toEntityWithPhotos(
    property: SelectedPropertyWithPhotos,
  ): PropertyEntity {
    return {
      ...this.toEntity(property),
      photos: property.photos.map((photo) => this.toPhotoEntity(photo)),
    };
  }

  private toPhotoEntity(photo: SelectedPropertyPhoto): PropertyPhotoEntity {
    return { ...photo };
  }

  private async nextPhotoSortOrder(
    tx: Prisma.TransactionClient,
    input: UploadPropertyPhotosRepositoryInput,
  ): Promise<number> {
    const sortOrder = await tx.propertyPhoto.aggregate({
      where: {
        propertyId: input.propertyId,
        officeId: input.officeId,
        deletedAt: null,
      },
      _max: {
        sortOrder: true,
      },
    });

    return (sortOrder._max.sortOrder ?? -1) + 1;
  }

  private toPrivateDetailsEntity(
    details: NonNullable<SelectedProperty['privateDetails']>,
  ): PropertyPrivateDetailsEntity {
    return {
      ...details,
      minimumAcceptablePrice: this.decimalToString(
        details.minimumAcceptablePrice,
      ),
    };
  }

  private decimalToString(value: Prisma.Decimal | null): string | null {
    return value?.toString() ?? null;
  }
}
