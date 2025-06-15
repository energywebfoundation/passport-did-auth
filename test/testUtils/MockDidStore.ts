import { DidStore } from "@energyweb/vc-verification";

export class MockDidStore extends DidStore {
  private mockStorage: Record<string, string> = {};
  private cidCounter = 0;

  private _computeCid(data: string): string {
    // Simple mock CID generator
    return `cid-${this.cidCounter++}`;
  }

  async save(claim: string): Promise<string> {
    const cid = this._computeCid(claim);
    this.mockStorage[cid] = claim;
    return cid;
  }

  async get(uri: string): Promise<string> {
    if (!(uri in this.mockStorage)) {
      throw new Error(`ContentNotFound: ${uri}`);
    }
    return this.mockStorage[uri];
  }

  async delete(uri: string): Promise<boolean> {
    if (uri in this.mockStorage) {
      delete this.mockStorage[uri];
      return true;
    }
    return false;
  }
}
