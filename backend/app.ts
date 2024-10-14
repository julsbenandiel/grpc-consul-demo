import express, { Request, Response } from 'express';
import { APP_SERVICE, ServiceLocator } from '../helper/consul';
import { bookService, authorService } from './services'
import colors from 'colors';
import cors from 'cors';
import _ from 'lodash';

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
    const authorsQuery = await authorService.getAuthors()
    const booksQuery = await bookService.getBooks()

    const authorMap = _.keyBy(authorsQuery.authors, 'email')

    const books: any[] = booksQuery.books.map((book) => {
      const author = authorMap[book.author]
      return {
        id: book.Id,
        title: book.title,
        name: book.name,
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
  name: string
}