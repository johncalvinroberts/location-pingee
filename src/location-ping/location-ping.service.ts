import { Injectable, Logger } from '@nestjs/common';
import { StorageService } from 'src/storage/storage.service';
import { LocationRecord } from 'src/types';

@Injectable()
export class LocationPingService {
  logger = new Logger(LocationPingService.name);
  constructor(private readonly storageService: StorageService) {}

  private respond(success: boolean, data?: unknown) {
    return { success, data };
  }

  async handlePing(body: string) {
    try {
      if (!body) {
        return this.respond(false);
      }
      const coordinates = JSON.parse(body);
      if (!coordinates.x || !coordinates.y) {
        return this.respond(false);
      }
      const timestamp = new Date();
      const payload: LocationRecord = { ...coordinates, timestamp };
      const key = timestamp.toISOString();
      await this.storageService.write(key, payload);
      this.logger.log('Done handling ping. Good job.');
      return this.respond(true);
    } catch (error) {
      this.logger.error(error);
      return this.respond(false);
    }
  }

  async handleList(rawQueryString: string) {
    const params = new URLSearchParams(rawQueryString);
    const cursor = params.get('cursor');
    const maxKeys = params.get('count') ? parseInt(params.get('count')) : 100;
    if (isNaN(maxKeys)) {
      return this.respond(true);
    }
    const res = await this.storageService.list(cursor, maxKeys);
    const data = await Promise.all(
      res.Contents?.map(async (item) =>
        JSON.parse(await this.storageService.read(item.Key)),
      ),
    );
    return this.respond(true, data);
  }
}
