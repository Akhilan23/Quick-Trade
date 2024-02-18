import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { configure as serverlessExpress } from '@vendia/serverless-express';
import { Context, Handler } from 'aws-lambda';
import express from 'express';
import { VersioningType } from '@nestjs/common';
import { AppModule } from './app.module';

let cachedServer: Handler;

const enableCors = (nestApp: any) => {
  if (!process.env.WHITELIST_DOMAIN) process.env.WHITELIST_DOMAIN = '*';
  const WHITELIST_DOMAIN = process.env.WHITELIST_DOMAIN.split(',');
  const config = {
    allowedHeaders:
      'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, Observe',
    methods: 'GET,PUT,POST,DELETE,UPDATE,OPTIONS',
    credentials: true,
  };
  if (WHITELIST_DOMAIN.length) {
    if (WHITELIST_DOMAIN.includes('*')) {
      nestApp.enableCors();
    } else {
      nestApp.enableCors({
        origin(origin, callback) {
          if (WHITELIST_DOMAIN.indexOf(origin) !== -1) {
            callback(null, true);
          } else {
            callback(new Error('Not allowed by CORS'));
          }
        },
        ...config,
      });
    }
  }
};

async function bootstrap() {
  if (!cachedServer) {
    const expressApp = express();
    const nestApp = await NestFactory.create(
      AppModule,
      new ExpressAdapter(expressApp),
    );
    enableCors(nestApp);
    nestApp.enableVersioning({ type: VersioningType.URI });
    await nestApp.init();
    cachedServer = serverlessExpress({ app: expressApp });
  }
  return cachedServer;
}

export const handler = async (event: any, context: Context, callback: any) => {
  const server = await bootstrap();
  return server(event, context, callback);
};
