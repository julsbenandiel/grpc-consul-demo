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

export interface BookDocument extends mongoose.Document {
  _id: mongoose.Types.ObjectId,
  title: string;
  author: string;
  name: string;
}

const schema: mongoose.Schema<BookDocument> = new mongoose.Schema({
  title: String,
  author: String,
  name: String
})

export const BookModel = mongoose.model<BookDocument>('book', schema)