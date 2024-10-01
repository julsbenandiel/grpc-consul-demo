import express, { Request, Response } from 'express';
import colors from 'colors';
import cors from 'cors';
import _ from 'lodash';
import { APP_SERVICE, ServiceLocator } from '../helper/consul';
import { BooksClient } from './generated/book';
import * as grpc from '@grpc/grpc-js'
import { BookService } from './grpc_services/book';

const app = express();
const port = 5000

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/health', async (_: Request, res: Response) => {
  res.status(200).json({ status: "[backend] healthy" })
})

app.get('/services', async (_: Request, res: Response) => {
  const services = await ServiceLocator.getRegisteredServices()
  res.status(200).json(services)
})

app.get('/authors-with-books', async (req: Request, res: Response) => {
  try {
    const authorService = new ServiceLocator(APP_SERVICE.author)
    const bookService = new BookService()

    const authorsQuery = await authorService.get('/author')

    const booksQuery = await bookService.getAllBooks()

    const authorMap = _.keyBy(authorsQuery.authors, 'email')

    const books: any[] = booksQuery.books.map((book: Book) => {
      const author = authorMap[book.author]
      return {
        ...book,
        author
      }
    })

    res.status(200).json(books)
    
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