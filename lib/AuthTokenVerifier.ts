import { JWT } from "@ew-did-registry/jwt";
import { Keys } from "@ew-did-registry/keys";
import {
  IAuthentication,
  IDIDDocument,
  IPublicKey,
  PubKeyType,
} from "@ew-did-registry/did-resolver-interface";
import { utils } from "ethers";
import base64url from "base64url";

const { arrayify, recoverAddress, keccak256, hashMessage } = utils;

export class AuthTokenVerifier {
  private _jwt = new JWT(new Keys());
  constructor(private readonly _didDocument: IDIDDocument) {}

  /**
   * @description checks a token was signed by the issuer DID or a valid authentication delegate of the issuer
   *
   * @param token
   *
   * @returns {string} Authenticated identity DID
   */
  public async verify(token: string): Promise<string | null> {
    if ((await this.isIdentity(token)) || (await this.isDelegate(token))) {
      return this._didDocument.id;
    }
    return null;
  }

  /**
   * @description Determines if a token was signed with an Ethereum signature by the address referenced by the id of the DID Document
   * Note that JWT-compliant signatures can't be used to recover an ethereum 
   */
  private async isIdentity(token: string) {
    const [encodedHeader, encodedPayload, encodedSignature] = token.split(".");
    const msg = `0x${Buffer.from(`${encodedHeader}.${encodedPayload}`).toString(
      "hex"
    )}`;
    const signature = base64url.decode(encodedSignature);
    const hash = arrayify(keccak256(msg));
    const claimedAddress = this._didDocument.id.split(":")[2];
    try {
      if (claimedAddress === recoverAddress(hash, signature)) {
        return true;
      }
    } catch (_) {}
    const digest = arrayify(hashMessage(hash));
    try {
      if (claimedAddress === recoverAddress(digest, signature)) {
        return true;
      }
    } catch (_) {}
    return false;
  }

  private async isDelegate(token: string) {
    const didPubKeys = this._didDocument.publicKey;
    if (didPubKeys.length === 0) {
      return false;
    }

    const authenticationPubkeys = didPubKeys.filter((pubkey) => {
      return this.isAuthenticationKey(pubkey, this._didDocument.authentication);
    });
    const validKeys = await this.filterValidKeys(
      authenticationPubkeys,
      async (pubKeyField) => {
        try {
          const parts = pubKeyField["publicKeyHex"]?.split("x");
          const publickey = parts.length == 2 ? parts[1] : parts[0];
          const decodedClaim = await this._jwt.verify(token, publickey);

          return decodedClaim !== undefined;
        } catch (error) {
          return false;
        }
      }
    );
    return validKeys.length !== 0;
  }

  private filterValidKeys = async (
    authenticatedKey: IPublicKey[],
    verifSignature
  ) => {
    const results = await Promise.all(authenticatedKey.map(verifSignature));

    return authenticatedKey.filter((_key, index) => results[index]);
  };

  /**
   * The authentication token should be signed by an "authentication" key of the DID (https://www.w3.org/TR/did-core/#authentication)
   * There are two ways to determine an authentication key.
   * 1. The publicKey's type is "sigAuth"
   * 2. The publicKey's id is in the authentication array of the DID document
   * @param publicKey The publicKey to test
   * @param documentAuthField The authentication array of the DID document
   * @returns whether or not the key is an authentication key
   */
  private isAuthenticationKey = (
    publicKey: IPublicKey,
    documentAuthField: (string | IAuthentication)[]
  ) => {
    if (this.isSigAuth(publicKey.type)) {
      return true;
    }
    if (documentAuthField.length === 0) {
      return false;
    }
    const authenticationKeys = documentAuthField.map((auth) => {
      return this.areLinked(auth["publicKey"], publicKey["id"]);
    });
    return authenticationKeys.includes(true);
  };

  //used to check if publicKey field in authentication refers to the publicKey ID in publicKey field
  private areLinked = (authId: string, pubKeyID: string) => {
    if (authId === pubKeyID) {
      return true;
    }
    if (authId.includes("#")) {
      return pubKeyID.split("#")[0] == authId.split("#")[0];
    }
    return false;
  };

  private isSigAuth = (pubKeyType: string) => {
    return pubKeyType.endsWith(PubKeyType.SignatureAuthentication2018);
  };
}
