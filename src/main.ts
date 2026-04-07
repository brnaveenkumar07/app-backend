import { createApp } from './server';
import { AppConfigService } from './config/app-config.service';

async function bootstrap() {
  const app = await createApp();
  const configService = app.get(AppConfigService);
  await app.listen(configService.port, configService.host);
}

bootstrap();
