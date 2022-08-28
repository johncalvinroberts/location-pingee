import { NestFactory } from '@nestjs/core';
import { APIGatewayResult, APIGatewayEvent } from 'aws-lambda';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { LocationPingService } from './location-ping/location-ping.service';

export const handler = async (
  event: APIGatewayEvent,
): Promise<APIGatewayResult> => {
  const method = event.requestContext.http.method;
  const body: string = event.body;
  const query = event.rawQueryString;
  const appContext = await NestFactory.createApplicationContext(AppModule);
  appContext.useLogger(appContext.get(Logger));
  const pingHandlerService = appContext.get(LocationPingService);
  if (method === 'POST') {
    const res = await pingHandlerService.handlePing(body);
    return res;
  }

  if (method === 'GET') {
    const res = await pingHandlerService.handleList(query);
    return res;
  }
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useLogger(app.get(Logger));
  await app.listen(3000);
}

if (process.env.NEST_ENV === 'HTTP') {
  bootstrap();
}
