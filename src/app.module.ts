import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './modules/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { AgencyModule } from './modules/agency/agency.module';
import { UsersModule } from './modules/users/users.module';
import { PropertiesModule } from './modules/properties/properties.module';
import { ImagesModule } from './modules/images/images.module';
import { ShareModule } from './modules/share/share.module';
import { ClientsModule } from './modules/clients/clients.module';
import { InquiriesModule } from './modules/inquiries/inquiries.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    AuthModule,
    AgencyModule,
    UsersModule,
    PropertiesModule,
    ImagesModule,
    ShareModule,
    ClientsModule,
    InquiriesModule,
    SubscriptionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
