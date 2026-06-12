import {
  FurnishingStatus,
  PropertyPurpose,
  PropertyStatus,
  PropertyType,
} from '@prisma/client';
import { PropertyPhotoEntity } from './property-photo.entity';

export class PropertyPrivateDetailsEntity {
  id: string;
  propertyId: string;
  officeId: string;
  ownerName: string | null;
  ownerPhone: string | null;
  ownerWhatsapp: string | null;
  exactAddress: string | null;
  privateLocationNote: string | null;
  minimumAcceptablePrice: string | null;
  commissionNote: string | null;
  legalNote: string | null;
  internalWarning: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class PropertyEntity {
  id: string;
  officeId: string;
  code: string | null;
  title: string;
  type: PropertyType;
  purpose: PropertyPurpose;
  status: PropertyStatus;
  country: string | null;
  city: string | null;
  area: string | null;
  neighborhood: string | null;
  publicLocationText: string | null;
  latitude: string | null;
  longitude: string | null;
  price: string | null;
  currency: string;
  isPriceNegotiable: boolean;
  sizeSqm: string | null;
  landSizeSqm: string | null;
  rooms: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  floor: number | null;
  totalFloors: number | null;
  buildingAgeYears: number | null;
  furnishing: FurnishingStatus;
  hasElevator: boolean | null;
  hasParking: boolean | null;
  hasBalcony: boolean | null;
  hasGarden: boolean | null;
  hasPool: boolean | null;
  hasHeating: boolean | null;
  hasCooling: boolean | null;
  descriptionPublic: string | null;
  notesInternal: string | null;
  availableFrom: Date | null;
  lastConfirmedAt: Date | null;
  createdById: string | null;
  updatedById: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  privateDetails: PropertyPrivateDetailsEntity | null;
  photos?: PropertyPhotoEntity[];
}
