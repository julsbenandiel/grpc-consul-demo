import * as mongoose from 'mongoose'
import { ConnectionStates } from 'mongoose'

export function connectToDb() {
  const connectionString = process.env.MONGO_URI
  
  mongoose.connect(`${connectionString}/book-service`)
    .then((res) => {
      const status = res.connection.readyState
      setTimeout(() => {
        console.log(`Book service mongo status: ${ConnectionStates[status].toUpperCase()}`)
      }, 500)
    })
}

interface BookDocument extends mongoose.Document {
  title: string;
  author: string;
  genre: string;
}

const schema: mongoose.Schema<BookDocument> = new mongoose.Schema({
  title: String,
  author: String,
  genre: String
})

export const Book = mongoose.model<BookDocument>('book', schema)