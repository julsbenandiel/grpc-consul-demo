require('dotenv').config()

import express, { Request, Response } from 'express';

const app = express();
const port = process.env.PORT || 3000
const host = process.env.HOST || 'localhost'

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/book-with-author', async (req: Request, res: Response) => {
  
});

app.get('/author-with-books', async (req: Request, res: Response) => {
  
});

app.listen(port, async () => {
  console.log(`Backend running at http://${host}:${port}`);
});