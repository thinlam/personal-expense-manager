import { createApp } from "./app";
import { env } from "./config/env";
import { connectDatabase } from "./config/database";

async function bootstrap() {
  await connectDatabase();

  const app = createApp();
  app.listen(env.port, () => {
    // eslint-disable-next-line no-console
    console.log(`[API] Listening on http://localhost:${env.port}`);
  });
}

bootstrap().catch((e) => {
  // eslint-disable-next-line no-console
  console.error("[BOOTSTRAP FAILED]", e);
  process.exit(1);
});
