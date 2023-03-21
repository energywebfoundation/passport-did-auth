import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import base64url from 'base64url';
import { Signer, Wallet, providers } from 'ethers';
import { IRole } from './LoginStrategy.types';
import { Policy } from 'cockatiel';
import { inspect } from 'util';
import {
  IDIDDocument,
  IServiceEndpoint,
} from '@ew-did-registry/did-resolver-interface';
import { IRoleDefinitionV2 } from '@energyweb/credential-governance';
import { Logger } from './Logger';
import { Agent as HttpAgent } from 'http';
import { Agent as HttpsAgent } from 'https';
import { SiweMessage } from 'siwe';

export class CacheServerClient {
  private readonly signer: Signer;
  private readonly httpClient: AxiosInstance;
  private failedRequests: Array<(token: string) => void> = [];
  private isAlreadyFetchingAccessToken = false;
  private _isAvailable = false;
  private readonly url: string;

  public readonly address: string;
  public chainName?: string;

  public get isAvailable(): boolean {
    return this._isAvailable;
  }

  constructor({
    url,
    privateKey,
    provider,
  }: {
    url: string;
    privateKey: string;
    provider: providers.Provider;
  }) {
    const wallet = new Wallet(privateKey, provider);
    this.address = wallet.address;
    this.signer = wallet;
    this.httpClient = axios.create({
      baseURL: url,
      httpAgent: new HttpAgent({ keepAlive: true }),
      httpsAgent: new HttpsAgent({ keepAlive: true }),
    });
    this.httpClient.interceptors.response.use(function (
      response: AxiosResponse
    ) {
      return response;
    },
    this.handleUnauthorized);
    this.url = url;
  }

  async login(): Promise<string> {
    const retry = Policy.handleAll().retry().attempts(10).delay(2000);
    retry.onFailure(({ reason }) => {
      Logger.warn(
        `DID login strategy was not able to login to cache server due to ${JSON.stringify(
          inspect(reason),
          null,
          4
        )}`
      );
    });

    retry.onSuccess(({ duration }) => {
      Logger.info(
        `DID Login Strategy is now logged into cache server after ${duration.toFixed()}ms`
      );
    });
    const token = await retry.execute(async () => {
      const {
        data: { nonce },
      } = await this.httpClient.post<{ nonce: string }>('/login/siwe/initiate');
      const uri = new URL('/v1/login/siwe/verify', new URL(this.url).origin)
        .href;
      const message = new SiweMessage({
        nonce,
        domain: new URL(this.url).host,
        address: await this.signer.getAddress(),
        uri,
        version: '1',
        chainId: await this.signer.getChainId(),
      }).prepareMessage();

      const signature = await this.signer.signMessage(message);

      const { data } = await this.httpClient.post<{ token: string }>(
        '/login/siwe/verify',
        {
          message,
          signature,
        }
      );
      this.httpClient.defaults.headers.common[
        'Authorization'
      ] = `Bearer ${data.token}`;
      this._isAvailable = true;
      return data.token;
    });
    return token;
  }

  handleSuccessfulReLogin(token: string): void {
    this.failedRequests = this.failedRequests.filter((callback) =>
      callback(token)
    );
  }

  addFailedRequest(callback: (token: string) => void): void {
    this.failedRequests.push(callback);
  }

  handleUnauthorized = async (error: AxiosError): Promise<unknown> => {
    const { config, response } = error;
    const originalRequest = config;
    if (
      response &&
      response.status === 401 &&
      config &&
      config.url?.indexOf('/login') === -1
    ) {
      this._isAvailable = false;
      const retryOriginalRequest = new Promise((resolve) => {
        this.addFailedRequest((token) => {
          originalRequest?.headers?.Authorization
            ? (originalRequest.headers.Authorization = 'Bearer ' + token)
            : null;
          resolve(axios(originalRequest));
        });
      });
      if (!this.isAlreadyFetchingAccessToken) {
        this.isAlreadyFetchingAccessToken = true;
        const token = await this.login();
        this.isAlreadyFetchingAccessToken = false;
        this.handleSuccessfulReLogin(token);
      }
      return retryOriginalRequest;
    }
    return Promise.reject(error);
  };

  createLoginTokenHeadersAndPayload({
    address,
    blockNumber,
    chainName,
  }: {
    address: string;
    blockNumber: number;
    chainName: string;
  }): { encodedHeader: string; encodedPayload: string } {
    const header = {
      alg: 'ES256',
      typ: 'JWT',
    };

    const encodedHeader = base64url(JSON.stringify(header));

    const payload = {
      iss: `did:ethr:${chainName}:${address}`,
      claimData: {
        blockNumber,
      },
    };

    const encodedPayload = base64url(JSON.stringify(payload));
    return { encodedHeader, encodedPayload };
  }

  async getRoleDefinition({
    namespace,
  }: {
    namespace: string;
  }): Promise<IRoleDefinitionV2> {
    const { data } = await this.httpClient.get<IRole>(`/role/${namespace}`);
    return data.definition;
  }

  async getRoleCredentials(did: string): Promise<IServiceEndpoint[]> {
    const { data } = await this.httpClient.get<{ service: IServiceEndpoint[] }>(
      `/DID/${did}?includeClaims=true`
    );
    return data.service;
  }

  async getDidsWithAcceptedRole(role: string): Promise<string[]> {
    const { data } = await this.httpClient.get<string[]>(
      `/claim/did/${role}?accepted=true`
    );
    return data;
  }

  async getDidDocument(did: string): Promise<IDIDDocument> {
    const { data } = await this.httpClient.get<IDIDDocument>(
      `/DID/${did}?includeClaims=true`
    );
    return data;
  }
}
