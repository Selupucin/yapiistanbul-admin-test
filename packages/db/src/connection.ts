import mongoose from "mongoose";

type CachedMongoose = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  var __mongooseCache: CachedMongoose | undefined;
}

const cached: CachedMongoose = global.__mongooseCache ?? {
  conn: null,
  promise: null,
};

global.__mongooseCache = cached;

export async function connectToDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not defined.");
  }

  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, {
      dbName: process.env.MONGODB_DB || "yapi_istanbul",
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
