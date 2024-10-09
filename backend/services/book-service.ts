import { APP_SERVICE, ServiceLocator } from "../../helper/consul"
import { BooksClient, GetBooksResponse } from "../generated/book"
import * as grpc from '@grpc/grpc-js'

class BookService {
  bookClient: BooksClient | null

  constructor() {
    this.initialize()
    this.bookClient = null
  }

  initialize() {
    ServiceLocator
      .getServiceConfig(APP_SERVICE.book_grpc)
      .then((config) => {
        const cred = grpc.credentials.createInsecure()
        const client = new BooksClient(`${config.Address}:${config.Port}`, cred)

        this.bookClient = client
      })
  }

  async getBooks(): Promise<GetBooksResponse> {
    return new Promise((resolve, reject) => {
      this.bookClient?.getAllBooks({}, (error, response) => {
        if (error)
          reject(error); 

        resolve(response)
      })
    })
  }
}

export const bookService = new BookService()
