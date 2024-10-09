import axios, { AxiosRequestConfig, Method } from 'axios'
import Consul from 'consul'

const consulClient = new Consul({ host: 'localhost', port: '8500' })
export class ServiceLocator {
  private client: Consul.Consul
  private name: string

  constructor(name: string) {
    this.client = consulClient
    this.name = name
  }

  async get(path: string) {
    return this.getHttpClient({ url: path })
  }

  async post(path: string, body: any = {}) {
    return this.getHttpClient({ url: path, method: 'POST', data: body })
  }

  async put(path: string, body: any = {}) {
    return this.getHttpClient({ url: path, method: 'PUT', data: body })
  }

  async delete(path: string) {
    return this.getHttpClient({ url: path, method: 'DELETE' })
  }

  private async getHttpClient(params: AxiosRequestConfig) {
    try {
      const service = await this.getService()
      const res = await axios({
        ...params,
        url: `http://${service.Address}:${service.Port}${params.url}`
      })

      return res.data

    } catch (error) {
      console.log(error)
    }
  }

  public async getService(): Promise<ServiceNode> {
    const services = await this.client.agent.services() as Record<string, ServiceNode>
    const service = services[this.name]

    if (!service)
      throw new Error('Service not found')

    return service
  }

  static async getServiceConfig(name: APP_SERVICE): Promise<ServiceNode> {
    const services = await consulClient.agent.services() as Record<string, ServiceNode>
    const service = services[name]

    if (!service)
      throw new Error(`Service: ${service}: not found`)

    return service
  }

  static async getRegisteredServices() {
    try {
      const services = await consulClient.agent.services()
      return services
    } catch (error) {
      console.log(error)
    }
  }

  static async saveToServiceRegistry(payload: Partial<Consul.Agent.Service.RegisterOptions>): Promise<Error | null> {
    const options: Consul.Agent.Service.RegisterOptions = {
      name: payload.name as string,
      port: Number(payload.port),
      address: payload.address,
      check: payload.check ? payload.check : {
        http: `http://host.docker.internal:${payload.port}/health`, // Add health check endpoint
        interval: '30s',
      },
    }
  
    try {
      await consulClient.agent.service.register(options)
      return null
  
    } catch (error) {
      console.log(error)
      throw new Error("Cannot register service")
    }
  }
}

export enum APP_SERVICE {
  author = 'author',
  book = 'book',
  author_grpc = 'author-grpc',
  book_grpc = 'book-grpc'
}

export type RequestParams = {
  method: Method
  path: String
}

export type ServiceNode = {
  ID: string,
  Service: string,
  Tags: null,
  Address: string,
  Port: number,
  EnableTagOverride: boolean,
  CreateIndex: number,
  ModifyIndex: number
}