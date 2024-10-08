import express, { Request, Response } from 'express';
import colors from 'colors'
import axios from 'axios';
import cors from 'cors'
import _ from 'lodash'

const app = express();
const port = 5000

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/health', async (_: Request, res: Response) => {
  res.status(200).json({ status: "[backend] healthy" })
})

app.get('/authors-with-books', async (req: Request, res: Response) => {
  try {
    const authorsQuery = await axios.get('http://localhost:5001/author')
    const booksQuery = await axios.get('http://localhost:5002/book')

    const authorMap = _.keyBy(authorsQuery.data.authors, 'email')

    const books = booksQuery.data.books.map((book: Book) => {
      const author = authorMap[book.author]
      return {
        ...book,
        author
      }
    })

    res.status(200).json(books)
  } catch (error) {
    res.status(200).json(error)
  }
});

app.listen(port, async () => {
  console.log(colors.bgYellow(` Backend running at http://localhost:${port} `));
});

type Book = {
  title: string
  author: string
}