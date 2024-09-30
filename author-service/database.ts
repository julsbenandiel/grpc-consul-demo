import * as mongoose from 'mongoose'
import { ConnectionStates } from 'mongoose'

export function connectToDb() {
  const connectionString = process.env.MONGO_URI
  
  mongoose.connect(`${connectionString}/author-service`)
    .then((res) => {
      const status = res.connection.readyState
      setTimeout(() => {
        console.log(`Author service mongo status: ${ConnectionStates[status].toUpperCase()}`)
      }, 500)
    })
}

interface AuthorDocument extends mongoose.Document {
  name: string;
  email: string;
}

const schema: mongoose.Schema<AuthorDocument> = new mongoose.Schema({
  name: String,
  email: String,
})

export const Author = mongoose.model<AuthorDocument>('author', schema)