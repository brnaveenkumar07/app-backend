import { ClassSerializerInterceptor, INestApplication, ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { AppConfigService } from './config/app-config.service';

let appPromise: Promise<INestApplication> | null = null;

export async function createApp() {
  if (!appPromise) {
    appPromise = NestFactory.create(AppModule).then((app) => {
      const configService = app.get(AppConfigService);

      app.enableCors({
        origin: configService.corsOrigins.length ? configService.corsOrigins : true,
        credentials: true,
      });
      app.setGlobalPrefix(configService.apiPrefix);
      app.useGlobalPipes(
        new ValidationPipe({
          whitelist: true,
          transform: true,
          forbidNonWhitelisted: true,
        }),
      );
      app.useGlobalFilters(new HttpExceptionFilter());
      app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

      return app;
    });
  }

  return appPromise;
}
