import * as grpc from '@grpc/grpc-js';
import { BooksServer, BooksService, HealthCheckResponse_ServingStatus } from './generated/book';
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
    callback(null, { status: HealthCheckResponse_ServingStatus.SERVING });
  },

  getAllBooks: async (_, callback) => {
    const books = await BookModel.find<BookDocument>({})

    callback(null, {
      count: books.length,
      books: books.map((book) => ({
        id: book._id.toString(),
        author: book.author,
        name: book.name,
        title: book.title
      }))
    });
  }
};

// Create and start the gRPC server
const server = new grpc.Server();

server.addService(BooksService, bookServiceImpl);

const PORT = '50051';
const HOST = '0.0.0.0'

server.bindAsync(`${HOST}:${PORT}`, grpc.ServerCredentials.createInsecure(), async () => {
  ServiceLocator.saveToServiceRegistry({
    name: 'author-grpc',
    address: HOST,
    port: Number(PORT),
  })

  connectToDb()

  console.log(colors.bgMagenta(` gRPC server running on ${HOST}:${PORT} `));
});
