import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios'
import base64url from 'base64url'
import { Signer, Wallet } from 'ethers'
import { JsonRpcProvider } from 'ethers/providers'
import { arrayify, keccak256 } from 'ethers/utils'
import { Claim, IRole } from './LoginStrategy.types'

export class CacheServerClient {
  private signer: Signer
  private httpClient: AxiosInstance
  private provider: JsonRpcProvider
  private failedRequests: Array<(token: string) => void> = []
  private isAlreadyFetchingAccessToken: boolean = false
  constructor({
    url,
    privateKey,
    provider,
  }: {
    url: string
    privateKey: string
    provider: JsonRpcProvider
  }) {
    this.signer = new Wallet(privateKey, provider)
    this.provider = provider
    this.httpClient = axios.create({ baseURL: url })
    this.httpClient.interceptors.response.use(function (
      response: AxiosResponse
    ) {
      return response
    },
    this.handleUnauthorized)
  }

  async login() {
    const [address, blockNumber] = await Promise.all([
      this.signer.getAddress(),
      this.provider.getBlockNumber(),
    ])

    const {
      encodedHeader,
      encodedPayload,
    } = this.createLoginTokenHeadersAndPayload({ address, blockNumber })
    const msg = `0x${Buffer.from(`${encodedHeader}.${encodedPayload}`).toString(
      'hex'
    )}`
    const sig = await this.signer.signMessage(msg)
    const encodedSignature = base64url(sig)
    const claim = `${encodedHeader}.${encodedPayload}.${encodedSignature}`
    const { data } = await this.httpClient.post<{ token: string }>('/login', {
      claim,
    })
    this.httpClient.defaults.headers.common[
      'Authorization'
    ] = `Bearer ${data.token}`
    console.log('DID Login Strategy is now logged into cache server')
    return data.token
  }

  handleSuccessfulReLogin(token: string) {
    this.failedRequests = this.failedRequests.filter((callback) =>
      callback(token)
    )
  }

  addFailedRequest(callback: (token: string) => void) {
    this.failedRequests.push(callback)
  }

  handleUnauthorized = async (error: AxiosError) => {
    const { config, response } = error
    const originalRequest = config
    if (
      response &&
      response.status === 401 &&
      config &&
      config.url.indexOf('/login') === -1
    ) {
      try {
        const retryOriginalRequest = new Promise((resolve) => {
          this.addFailedRequest((token) => {
            originalRequest.headers.Authorization = 'Bearer ' + token
            resolve(axios(originalRequest))
          })
        })
        if (!this.isAlreadyFetchingAccessToken) {
          this.isAlreadyFetchingAccessToken = true
          const token = await this.login()
          this.isAlreadyFetchingAccessToken = false
          this.handleSuccessfulReLogin(token)
        }
        return retryOriginalRequest
      } catch (err) {
        throw err
      }
    }
    return Promise.reject(error)
  }

  createLoginTokenHeadersAndPayload({
    address,
    blockNumber,
  }: {
    address: string
    blockNumber: number
  }) {
    const header = {
      alg: 'ES256',
      typ: 'JWT',
    }

    const encodedHeader = base64url(JSON.stringify(header))

    const payload = {
      iss: `did:ethr:${address}`,
      claimData: {
        blockNumber,
      },
    }

    const encodedPayload = base64url(JSON.stringify(payload))
    return { encodedHeader, encodedPayload }
  }

  async getRoleDefinition({ namespace }: { namespace: string }) {
    const { data } = await this.httpClient.get<IRole>(`/role/${namespace}`)
    return data.definition
  }

  async getUserAcceptedClaims({ did }: { did: string }) {
    const { data } = await this.httpClient.get<{ claim: Claim[] }>(
      `/claim/requester/${did}?accepted=true`
    )
    return data.claim
  }

  async getDidsWithAcceptedRole(role: string) {
    const { data } = await this.httpClient.get<string[]>(
      `/claim/did/${role}?accepted=true`
    )
    return data
  }
}
