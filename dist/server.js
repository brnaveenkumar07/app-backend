"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
const app_config_service_1 = require("./config/app-config.service");
let appPromise = null;
async function createApp() {
    if (!appPromise) {
        appPromise = core_1.NestFactory.create(app_module_1.AppModule).then((app) => {
            const configService = app.get(app_config_service_1.AppConfigService);
            app.enableCors({
                origin: configService.corsOrigins.length ? configService.corsOrigins : true,
                credentials: true,
            });
            app.setGlobalPrefix(configService.apiPrefix);
            app.useGlobalPipes(new common_1.ValidationPipe({
                whitelist: true,
                transform: true,
                forbidNonWhitelisted: true,
            }));
            app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter());
            app.useGlobalInterceptors(new common_1.ClassSerializerInterceptor(app.get(core_1.Reflector)));
            return app;
        });
    }
    return appPromise;
}
