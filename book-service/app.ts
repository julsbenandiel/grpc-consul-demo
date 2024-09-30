import express, { Request, Response } from 'express';
import { Book, connectToDb } from './database';
import colors from 'colors'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'node:path'

dotenv.config({ 
  path: path.resolve(__dirname, '../.env.local')
})

const app = express();
const port = 5002

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// health check
app.get('/health', async (_: Request, res: Response) => {
  res.status(200).json({ status: "[book-service] healthy" })
})

// Book API
app.get('/book', async (_: Request, res: Response) => {
  try {
    const books = await Book.find()

    res.status(200).json({
      count: books.length,
      books
    })
    
  } catch (error) {
    res.status(400).json(error)
  }
})

app.listen(port, async () => {
  connectToDb()
  console.log(colors.bgMagenta(` Book service running at http://localhost:${port} `));
});