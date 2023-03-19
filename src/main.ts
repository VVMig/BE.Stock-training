import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { NestFactory, Reflector } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app/modules/app.module';

const PORT = process.env.PORT || 8080;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const reflector = app.get(Reflector);
  const config = new DocumentBuilder()
    .setTitle('Traiding')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/v1', app, document);

  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.useGlobalInterceptors(new ClassSerializerInterceptor(reflector));

  app.enableCors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  });

  app.use(cookieParser());

  await app.listen(PORT);
}
bootstrap();
