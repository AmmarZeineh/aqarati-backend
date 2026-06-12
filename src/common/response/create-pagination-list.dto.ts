import { Type } from '@nestjs/common';
import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';

export function createPaginationDto<T>(itemType: Type<T>) {
  @ApiExtraModels(itemType)
  class PaginatedResponseDto {
    @ApiProperty()
    count: number;

    @ApiProperty({ isArray: true, type: () => itemType })
    data: T[];
  }

  Object.defineProperty(PaginatedResponseDto, 'name', {
    value: `Paginated${itemType.name}ResponseDto`,
  });

  return PaginatedResponseDto;
}
