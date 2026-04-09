import mongoose from "mongoose";

const cached = global.mongooseCache ?? {
  conn: null,
  promise: null
};

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export async function connectDB() {
  const mongodbUri = process.env.MONGODB_URI;

  if (!mongodbUri) {
    throw new Error("Missing MONGODB_URI environment variable");
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(mongodbUri, {
        bufferCommands: false,
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
        socketTimeoutMS: 45000
      })
      .catch((error) => {
        // Reset the cached promise so subsequent calls can retry
        cached.promise = null;
        throw error;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
