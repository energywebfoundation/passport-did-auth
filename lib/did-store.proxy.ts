import { IDidStore } from "@ew-did-registry/did-store-interface";
import { CacheServerClient } from "./cacheServerClient";
import { DidStoreType } from 'iam-client-lib';

export class DidStoreProxy implements IDidStore {

  constructor(private _cacheClient: CacheServerClient, private type: DidStoreType = DidStoreType.S3) {
  }

  async save(claim: string): Promise<string> {
    return this._cacheClient.addStoreClaim(claim, this.type);
  }

  async get(uri: string): Promise<string> {
    return this._cacheClient.getStoreClaim(uri);
  }

  async delete(uri: string): Promise<boolean> {
    throw new Error("Method not implemented.");
  }
}