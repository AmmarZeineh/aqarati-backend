import { PropertyEntity } from './property.entity';

export class PaginationMetaEntity {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export class PaginatedPropertiesEntity {
  data: PropertyEntity[];
  meta: PaginationMetaEntity;
}
