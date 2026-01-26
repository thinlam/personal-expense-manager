import { createApp } from "./app";
import { connectDB } from "./config/db";
import { env } from "./config/env";
import "dotenv/config";

async function main() {
  await connectDB(env.MONGODB_URI);

  const app = createApp();
  app.listen(env.PORT, () => {
    console.log(`✅ API: http://localhost:${env.PORT}/api/health`);
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
