import express, { Request, Response } from 'express';
import colors from 'colors'
import axios from 'axios';
import cors from 'cors'
import _ from 'lodash'

const app = express();
const port = 6000

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/health', async (_: Request, res: Response) => {
  res.status(200).json({ status: "[backend] healthy" })
})

app.get('/books-with-author', async (req: Request, res: Response) => {
  try {
    const authorsQuery = await axios.get('http://localhost:6001/author')
    const booksQuery = await axios.get('http://localhost:6002/book')

    const authorMap = _.keyBy(authorsQuery.data.authors, 'email')

    const books = booksQuery.data.books.map((book: Book) => {
      const author = authorMap[book.author]
      return {
        ...book,
        author
      }
    })

    res.status(200).json({
      count: books.length,
      books
    })
  } catch (error) {
    res.status(400).json(error)
  }
});

app.listen(port, async () => {
  console.log(colors.bgYellow(` Backend running at http://localhost:${port} `));
});

type Book = {
  title: string
  author: string
}