import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as graphqlUpload from 'graphql-upload/graphqlUploadExpress.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors({
    origin: true,
    credentials: true,
  });
  
  app.use('/graphql', graphqlUpload({ 
    maxFileSize: 10000000, 
    maxFiles: 1,
  }));
  
  await app.listen(4000);
}
bootstrap();