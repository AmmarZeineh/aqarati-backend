import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  FurnishingStatus,
  PropertyPurpose,
  PropertyStatus,
  PropertyType,
} from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

const trimString = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

const trimUppercaseString = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim().toUpperCase() : value;

export class CreatePropertyPrivateDetailsDto {
  @ApiPropertyOptional({ example: 'Ahmad Saleh' })
  @Transform(trimString)
  @IsString()
  @IsOptional()
  @MaxLength(120)
  ownerName?: string;

  @ApiPropertyOptional({ example: '+963944000000' })
  @Transform(trimString)
  @IsString()
  @IsOptional()
  @MaxLength(40)
  ownerPhone?: string;

  @ApiPropertyOptional({ example: '+963944000000' })
  @Transform(trimString)
  @IsString()
  @IsOptional()
  @MaxLength(40)
  ownerWhatsapp?: string;

  @ApiPropertyOptional({ example: 'Mezzeh, near the main park' })
  @Transform(trimString)
  @IsString()
  @IsOptional()
  @MaxLength(500)
  exactAddress?: string;

  @ApiPropertyOptional({ example: 'Owner prefers visits after 5 PM.' })
  @Transform(trimString)
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  privateLocationNote?: string;

  @ApiPropertyOptional({ example: 145000 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  minimumAcceptablePrice?: number;

  @ApiPropertyOptional({ example: '2% seller commission.' })
  @Transform(trimString)
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  commissionNote?: string;

  @ApiPropertyOptional({ example: 'Green tabo, ready for transfer.' })
  @Transform(trimString)
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  legalNote?: string;

  @ApiPropertyOptional({ example: 'Do not publish exact address.' })
  @Transform(trimString)
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  internalWarning?: string;
}

export class CreatePropertyDto {
  @ApiPropertyOptional({ example: 'AP-102' })
  @Transform(trimString)
  @IsString()
  @IsOptional()
  @MaxLength(64)
  code?: string;

  @ApiProperty({ example: 'Furnished apartment in Mezzeh' })
  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  title: string;

  @ApiProperty({ enum: PropertyType, example: PropertyType.APARTMENT })
  @IsEnum(PropertyType)
  type: PropertyType;

  @ApiProperty({ enum: PropertyPurpose, example: PropertyPurpose.SALE })
  @IsEnum(PropertyPurpose)
  purpose: PropertyPurpose;

  @ApiPropertyOptional({
    enum: PropertyStatus,
    default: PropertyStatus.DRAFT,
    example: PropertyStatus.AVAILABLE,
  })
  @IsEnum(PropertyStatus)
  @IsOptional()
  status?: PropertyStatus;

  @ApiPropertyOptional({ example: 'Syria' })
  @Transform(trimString)
  @IsString()
  @IsOptional()
  @MaxLength(120)
  country?: string;

  @ApiPropertyOptional({ example: 'Damascus' })
  @Transform(trimString)
  @IsString()
  @IsOptional()
  @MaxLength(120)
  city?: string;

  @ApiPropertyOptional({ example: 'Mezzeh' })
  @Transform(trimString)
  @IsString()
  @IsOptional()
  @MaxLength(120)
  area?: string;

  @ApiPropertyOptional({ example: 'Western Villas' })
  @Transform(trimString)
  @IsString()
  @IsOptional()
  @MaxLength(120)
  neighborhood?: string;

  @ApiPropertyOptional({ example: 'Near the main park' })
  @Transform(trimString)
  @IsString()
  @IsOptional()
  @MaxLength(250)
  publicLocationText?: string;

  @ApiPropertyOptional({ example: 33.5138 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 7 })
  @Min(-90)
  @Max(90)
  @IsOptional()
  latitude?: number;

  @ApiPropertyOptional({ example: 36.2765 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 7 })
  @Min(-180)
  @Max(180)
  @IsOptional()
  longitude?: number;

  @ApiPropertyOptional({ example: 150000 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  price?: number;

  @ApiPropertyOptional({ default: 'USD', example: 'USD' })
  @Transform(trimUppercaseString)
  @IsString()
  @Length(3, 3)
  @IsOptional()
  currency?: string;

  @ApiPropertyOptional({ default: false, example: true })
  @IsBoolean()
  @IsOptional()
  isPriceNegotiable?: boolean;

  @ApiPropertyOptional({ example: 145 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  sizeSqm?: number;

  @ApiPropertyOptional({ example: 250 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  landSizeSqm?: number;

  @ApiPropertyOptional({ example: 4 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  rooms?: number;

  @ApiPropertyOptional({ example: 3 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  bedrooms?: number;

  @ApiPropertyOptional({ example: 2 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  bathrooms?: number;

  @ApiPropertyOptional({ example: 2 })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  floor?: number;

  @ApiPropertyOptional({ example: 8 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  totalFloors?: number;

  @ApiPropertyOptional({ example: 12 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  buildingAgeYears?: number;

  @ApiPropertyOptional({
    enum: FurnishingStatus,
    default: FurnishingStatus.UNKNOWN,
    example: FurnishingStatus.FURNISHED,
  })
  @IsEnum(FurnishingStatus)
  @IsOptional()
  furnishing?: FurnishingStatus;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  hasElevator?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  hasParking?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  hasBalcony?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  hasGarden?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  hasPool?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  hasHeating?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  hasCooling?: boolean;

  @ApiPropertyOptional({
    example: 'Bright apartment with an open living room and balcony.',
  })
  @Transform(trimString)
  @IsString()
  @IsOptional()
  @MaxLength(5000)
  descriptionPublic?: string;

  @ApiPropertyOptional({ example: 'Needs owner confirmation before sharing.' })
  @Transform(trimString)
  @IsString()
  @IsOptional()
  @MaxLength(5000)
  notesInternal?: string;

  @ApiPropertyOptional({ example: '2026-07-01T00:00:00.000Z' })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  availableFrom?: Date;

  @ApiPropertyOptional({ type: () => CreatePropertyPrivateDetailsDto })
  @ValidateNested()
  @Type(() => CreatePropertyPrivateDetailsDto)
  @IsOptional()
  privateDetails?: CreatePropertyPrivateDetailsDto;
}
