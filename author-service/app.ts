import express, { Request, Response } from 'express';
import { Author, connectToDb } from './database';
import colors from 'colors'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'node:path'

dotenv.config({ 
  path: path.resolve(__dirname, '../.env.local')
})

const app = express();
const port = 6001

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// health check
app.get('/health', async (_: Request, res: Response) => {
  res.status(200).json({ status: "[author-service] healthy" })
})

// Author API
app.get('/author', async (_: Request, res: Response) => {
  try {
    const authors = await Author.find({})

    res.status(200).json({
      count: authors.length,
      authors
    })
    
  } catch (error) {
    res.status(400).json(error)
  }
})

app.listen(port, async () => {
  connectToDb()
  console.log(colors.bgBlue(` Author service running at http://localhost:${port} `));
});