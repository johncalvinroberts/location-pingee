import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LocationPingService } from './location-ping/location-ping.service';
import { LocationPingModule } from './location-ping/location-ping.module';
import { StorageService } from './storage/storage.service';
import { StorageModule } from './storage/storage.module';
import config from './configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
    }),
    LocationPingModule,
    LoggerModule.forRoot(),
    StorageModule,
  ],
  controllers: [],
  providers: [LocationPingService, ConfigService, StorageService],
})
export class AppModule {}
