import mongoose from "mongoose"

const MONGODB_URI = process.env.MONGODB_URI

const mongoUri = MONGODB_URI as string | undefined

type MongooseCache = {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

const globalWithCache = globalThis as typeof globalThis & {
  mongooseCache?: MongooseCache
}

let cached = globalWithCache.mongooseCache

if (!cached) {
  cached = { conn: null, promise: null }
  globalWithCache.mongooseCache = cached
}

async function connectToDatabase() {
  if (!mongoUri) {
    throw new Error(
      "Please define the MONGODB_URI environment variable inside .env.local"
    )
  }

  if (cached?.conn) {
    return cached.conn
  }

  if (!cached) {
    cached = { conn: null, promise: null }
    globalWithCache.mongooseCache = cached
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(mongoUri, {
      dbName: process.env.MONGODB_DB || "dj_requests",
    })
  }

  cached.conn = await cached.promise
  return cached.conn
}

export default connectToDatabase
