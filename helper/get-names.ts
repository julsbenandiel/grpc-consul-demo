import dotenv from 'dotenv'
import { MongoClient } from 'mongodb'
import path from 'node:path'
import fs from 'node:fs'

dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const MONGO_URI = process.env.MONGO_URI as string

async function main() {
  const connection = new MongoClient(MONGO_URI)
  const client = await connection.connect()

  const books = await client
    .db("book-service")
    .collection("books")
    .find({ name: {$ne: null} })
    .toArray()

  const participants = books.map((book) => book.name)
  const data = participants.join('\n');
  
  fs.writeFile('names.txt', data, (err) => {
    if (err) {
      console.error('Error writing file:', err);
    } else {
      console.log('File written successfully');
    }
  });
}

main()

