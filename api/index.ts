import serverlessExpress from '@codegenie/serverless-express';
import { createApp } from '../src/server';

let cachedHandler: ReturnType<typeof serverlessExpress>;

async function getHandler() {
  if (!cachedHandler) {
    const app = await createApp();
    await app.init();
    const httpAdapter = app.getHttpAdapter();
    cachedHandler = serverlessExpress({
      app: httpAdapter.getInstance(),
    });
  }

  return cachedHandler;
}

export default async function handler(req: any, res: any) {
  const expressHandler = await getHandler();
  return expressHandler(req, res);
}
