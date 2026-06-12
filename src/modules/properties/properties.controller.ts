import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { MemberRole, PhotoVisibility } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { CreatePropertyDto } from './dto/create-property.dto';
import { ListPropertiesQueryDto } from './dto/list-properties-query.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { UploadPropertyPhotosDto } from './dto/upload-property-photos.dto';
import { PaginatedPropertiesEntity } from './entities/paginated-properties.entity';
import { PropertyPhotoEntity } from './entities/property-photo.entity';
import { PropertyEntity } from './entities/property.entity';
import { propertyPhotoUploadOptions } from './property-photo-upload.options';
import { PropertiesService } from './properties.service';

@ApiTags('Properties')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('properties')
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Get()
  @Roles(MemberRole.OWNER)
  @ApiOperation({ summary: 'List current office properties with photos' })
  @ApiOkResponse({
    description: 'Properties returned successfully',
    type: PaginatedPropertiesEntity,
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  @ApiForbiddenResponse({ description: 'Only office owners can list here' })
  async findMany(
    @Query() query: ListPropertiesQueryDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<PaginatedPropertiesEntity> {
    return this.propertiesService.findMany(query, user);
  }

  @Get(':propertyId')
  @Roles(MemberRole.OWNER)
  @ApiOperation({ summary: 'Get one property with private details and photos' })
  @ApiOkResponse({
    description: 'Property returned successfully',
    type: PropertyEntity,
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  @ApiForbiddenResponse({ description: 'Only office owners can view here' })
  async findById(
    @Param('propertyId', new ParseUUIDPipe({ version: '4' }))
    propertyId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<PropertyEntity> {
    return this.propertiesService.findById(propertyId, user);
  }

  @Post()
  @Roles(MemberRole.OWNER)
  @ApiOperation({ summary: 'Create a property for the current office owner' })
  @ApiCreatedResponse({
    description: 'Property created successfully',
    type: PropertyEntity,
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  @ApiForbiddenResponse({ description: 'Only office owners can create here' })
  async create(
    @Body() createPropertyDto: CreatePropertyDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<PropertyEntity> {
    return this.propertiesService.create(createPropertyDto, user);
  }

  @Patch(':propertyId')
  @Roles(MemberRole.OWNER)
  @ApiOperation({ summary: 'Update one property in the current office' })
  @ApiOkResponse({
    description: 'Property updated successfully',
    type: PropertyEntity,
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  @ApiForbiddenResponse({ description: 'Only office owners can update here' })
  async update(
    @Param('propertyId', new ParseUUIDPipe({ version: '4' }))
    propertyId: string,
    @Body() updatePropertyDto: UpdatePropertyDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<PropertyEntity> {
    return this.propertiesService.update(propertyId, updatePropertyDto, user);
  }

  @Post(':propertyId/photos')
  @Roles(MemberRole.OWNER)
  @UseInterceptors(FilesInterceptor('photos', 10, propertyPhotoUploadOptions))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Upload photos for a property in the current office',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['photos'],
      properties: {
        photos: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
        visibility: {
          type: 'string',
          enum: Object.values(PhotoVisibility),
          default: PhotoVisibility.PUBLIC,
        },
        label: { type: 'string', example: 'Living room' },
        roomType: { type: 'string', example: 'living_room' },
        sortOrderStart: { type: 'number', example: 0 },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Property photos uploaded successfully',
    type: [PropertyPhotoEntity],
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  @ApiForbiddenResponse({ description: 'Only office owners can upload here' })
  async uploadPhotos(
    @Param('propertyId', new ParseUUIDPipe({ version: '4' }))
    propertyId: string,
    @Body() uploadPropertyPhotosDto: UploadPropertyPhotosDto,
    @UploadedFiles() files: Express.Multer.File[],
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<PropertyPhotoEntity[]> {
    return this.propertiesService.uploadPhotos(
      propertyId,
      uploadPropertyPhotosDto,
      files,
      user,
    );
  }
}
