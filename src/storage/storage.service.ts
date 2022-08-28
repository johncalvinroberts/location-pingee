import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  ListObjectsCommand,
} from '@aws-sdk/client-s3';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Readable } from 'stream';
import { REGION, LOCATION_RECORD_BUCKET_NAME } from '../configuration';
import { LocationRecord } from '../types';

@Injectable()
export class StorageService {
  client: S3Client;
  bucketName: string;
  private readonly logger: Logger = new Logger(StorageService.name);
  constructor(private readonly configService: ConfigService) {
    this.client = new S3Client({ region: this.configService.get(REGION) });
    this.bucketName = this.configService.get(LOCATION_RECORD_BUCKET_NAME);
  }

  public async write(key: string, payload: LocationRecord) {
    try {
      const cmd = new PutObjectCommand({
        Key: key,
        Body: JSON.stringify(payload),
        Bucket: this.bucketName,
      });
      const res = await this.client.send(cmd);
      this.logger.log(res, 'Successfully written to storage');
      return res;
    } catch (error) {
      this.logger.error(error, 'failed to write to storage');
      throw error;
    }
  }

  public read(key: string): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        const cmd = new GetObjectCommand({ Key: key, Bucket: this.bucketName });
        // get the s3 object
        const res = await this.client.send(cmd);
        // create an array to put data in as it streams from Body
        const responseDataChunks = [];
        const stream = res.Body as Readable;
        stream.on('data', (chunk) => responseDataChunks.push(chunk));
        stream.once('error', (error) => reject(error));
        stream.once('end', () => resolve(responseDataChunks.join('')));
      } catch (error) {
        this.logger.error(error, 'failed to read from storage');
        reject(error);
      }
    });
  }

  public async list(cursor: string | null, MaxKeys?: number) {
    try {
      const cmd = new ListObjectsCommand({
        Bucket: this.bucketName,
        Marker: cursor,
        MaxKeys,
      });
      const res = await this.client.send(cmd);
      return res;
    } catch (error) {
      this.logger.error(error, 'failed to list objects from storage');
    }
  }
}
