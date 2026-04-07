"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("./server");
const app_config_service_1 = require("./config/app-config.service");
async function bootstrap() {
    const app = await (0, server_1.createApp)();
    const configService = app.get(app_config_service_1.AppConfigService);
    await app.listen(configService.port, configService.host);
}
bootstrap();
