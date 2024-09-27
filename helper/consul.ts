import axios, { AxiosResponse } from 'axios'
import Consul from 'consul'

export enum APP_SERVICE {
  author = 'author-service',
  book = 'book-service'
}

export const consulClient = new Consul({ host: 'localhost', port: '8500' })

export async function discoverService(name: APP_SERVICE): Promise<Record<string, string | number>> {
  const serviceObj = await consulClient.agent.services() as Record<string, {[key: string]: string | number }>

  if (serviceObj[name]) {
    console.log(serviceObj[name])
    return serviceObj[name]
  } 

  throw new Error('Service not found.')
}

export async function makeHttpRequestFromService(
  service: Record<string, string | number>,
  method: string,
  path: string,
  data?: any
): Promise<AxiosResponse<any>> {
  const url = `http://${service.Address}:${service.Port}${path}`
  return axios({ 
    method,
    url,
    data
  })
}

export async function saveToServiceRegistry(payload: Partial<Consul.Agent.Service.RegisterOptions>): Promise<Error | null> {
  const options: Consul.Agent.Service.RegisterOptions = {
    name: payload.name as string,
    port: Number(payload.port),
    address: payload.address,
    check: {
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