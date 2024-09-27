import express, { Request, Response } from 'express';
import { Author, connectToDb, seedData } from './database';
import colors from 'colors'

const app = express();
const port = 5001

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// health check
app.get('/health', async (_: Request, res: Response) => {
  res.status(200).json({ status: "healthy" })
})

// Author API
app.get('/author', async (_: Request, res: Response) => {
  try {
    
    const [count, authors] = await Promise.all([
      Author.countDocuments(),
      Author.find(),
    ])

    res.status(200).json({
      count,
      data: authors
    })
    
  } catch (error) {
    res.status(400).json(error)
  }
})

app.listen(port, async () => {
  connectToDb()
  console.log(colors.bgBlue(` Author service running at http://localhost:${port} `));
});