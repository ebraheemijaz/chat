// lib/mongodb.js
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error("Please add your Mongo URI to .env");
}

let client;
let clientPromise;

if (process.env.NODE_ENV === "development") {
  // Use a global variable so it doesn't get re-initialized on hot reload
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

export default clientPromise;
