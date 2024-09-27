import * as mongoose from 'mongoose'
import { ConnectionStates } from 'mongoose'
import colors from 'colors'

export function connectToDb() {
  const dbName: string = 'open-mic-author-service' 
  mongoose.connect(`mongodb://127.0.0.1:27017/${dbName}`)
    .then((res) => {
      const status = res.connection.readyState
      console.log(colors.bgBlue(` Author service mongo status: ${ConnectionStates[status].toUpperCase()} `))
    })
}

interface AuthorDocument extends mongoose.Document {
  name: string;
  email: string;
  address: string;
}

const schema: mongoose.Schema<AuthorDocument> = new mongoose.Schema({
  name: String,
  email: String,
  address: String
})

export const Author = mongoose.model<AuthorDocument>('author', schema)

export async function seedData() {
  await Author.insertMany([
    {
      name: 'Michael Scofield',
      email: 'michael.scofield@foxriver.com',
      address: 'Toledo, Ohio'
    },
    {
      name: 'Fernando Sucre',
      email: 'fernando.sucre@foxriver.com',
      address: 'Puerto Rico'
    },
    {
      name: 'Lincold "Linc" Burrows',
      email: 'lincoln.burrows@foxriver.com',
      address: 'Toledo, Ohio'
    },
    {
      name: 'Brad Bellick',
      email: 'brad.bellick@foxriver.com',
      address: 'Joliet, Illinois'
    },
    {
      name: 'Theodore "T-Bag" Bagwell',
      email: 'tbag@foxriver.com',
      address: 'Alabama'
    },
    {
      name: 'Alexander "Alex" Mahone',
      email: 'alex.mahine@fbi.com',
      address: 'Oswego, Illinois'
    },
    {
      name: 'John Abruzzi',
      email: 'john.abruzzi@fbi.com',
      address: 'Chicago, Illinois'
    },
  ])
}