import { Module } from '@nestjs/common';
import { PropertiesController } from './properties.controller';
import { PropertiesService } from './properties.service';
import { PrismaPropertiesRepository } from './repositories/prisma-properties.repository';
import { PROPERTIES_REPOSITORY } from './repositories/properties.repository';

@Module({
  controllers: [PropertiesController],
  providers: [
    PropertiesService,
    {
      provide: PROPERTIES_REPOSITORY,
      useClass: PrismaPropertiesRepository,
    },
  ],
})
export class PropertiesModule {}
