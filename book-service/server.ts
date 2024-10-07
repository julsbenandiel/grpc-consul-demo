import * as grpc from '@grpc/grpc-js';
import { BooksServer, BooksService, GetBooksResponse, HealthCheckResponse, HealthCheckResponse_ServingStatus } from './generated/book';
import { ServiceLocator } from '../helper/consul'
import { BookDocument, BookModel, connectToDb } from './database';
import colors from 'colors'
import dotenv from 'dotenv'
import path from 'node:path'

dotenv.config({ 
  path: path.resolve(__dirname, '../.env.local')
})

const bookServiceImpl: BooksServer = {
  healthCheck: (_, callback) => {
    const response = HealthCheckResponse.create({
      status: HealthCheckResponse_ServingStatus.SERVING
    })
    
    callback(null, response);
  },

  getAllBooks: async (_, callback) => {
    const books = await BookModel.find<BookDocument>({})

    const response = GetBooksResponse.create({
      count: books.length,
      books: books.map((book) => ({
        id: book._id.toString(),
        author: book.author,
        name: book.name,
        title: book.title
      }))
    })

    callback(null, response);
  }
};


const PORT = '5002';

// Create and start the gRPC server
const server = new grpc.Server();

server.addService(BooksService, bookServiceImpl);

server.bindAsync(`localhost:${PORT}`, grpc.ServerCredentials.createInsecure(), () => {

  ServiceLocator
    .saveToServiceRegistry({ name: 'author-grpc', address: 'localhost', port: Number(PORT) })
    .then(() => {
      connectToDb()
    })

  console.log(colors.bgMagenta(` [gRPC] Book service running on localhost:${PORT} `));
});
