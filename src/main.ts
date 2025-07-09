import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import * as graphqlUpload from 'graphql-upload/graphqlUploadExpress.js';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  
  const frontendUrl = process.env.FRONTEND_URL;
  const port = process.env.PORT || 4000;
  
  app.enableCors({
    origin: frontendUrl ? [frontendUrl] : true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
  });
  
  app.use('/graphql', graphqlUpload({ 
    maxFileSize: 10000000, 
    maxFiles: 1,
  }));
  
  await app.listen(port);
  logger.log(`Application is running on port ${port}`);
}
bootstrap();