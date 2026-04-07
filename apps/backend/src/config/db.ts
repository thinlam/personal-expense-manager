import mongoose from "mongoose";

function maskMongoUri(uri: string) {
  return uri.replace(/\/\/([^:]+):([^@]+)@/, "//$1:****@");
}

export async function connectDB(uri: string) {
  mongoose.set("strictQuery", true);
  try {
    await mongoose.connect(uri);
    console.log("✅ MongoDB connected");
  } catch (error: any) {
    if (error?.code === 8000 || /authentication failed/i.test(error?.message ?? "")) {
      const masked = maskMongoUri(uri);
      throw new Error(
        `MongoDB authentication failed for URI: ${masked}. Check username/password, auth database, and whether the Atlas user has access to this cluster.`
      );
    }
    throw error;
  }
}
