import { APP_SERVICE, ServiceLocator } from "../../helper/consul"
import { AuthorsClient, GetAllAuthorsResponse } from "../generated/author"
import * as grpc from '@grpc/grpc-js'

class AuthorService {
  authorClient: AuthorsClient | null

  constructor() {
    this.initialize()
    this.authorClient = null
  }

  initialize() {
    ServiceLocator
      .getServiceConfig(APP_SERVICE.author_grpc)
      .then((config) => {
        const cred = grpc.credentials.createInsecure()
        const client = new AuthorsClient(`${config.Address}:${config.Port}`, cred)

        this.authorClient = client
      })
  }

  async getAuthors(): Promise<GetAllAuthorsResponse> {
    return new Promise((resolve, reject) => {
      this.authorClient?.getAllAuthors({}, (error, response) => {
        if (error)
          reject(error); 

        resolve(response)
      })
    })
  }
}

export const authorService = new AuthorService()
