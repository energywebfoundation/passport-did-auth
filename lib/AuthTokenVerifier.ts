
import { JWT } from '@ew-did-registry/jwt';
import { Keys } from '@ew-did-registry/keys';
import { IAuthentication, IDIDDocument, IPublicKey } from "@ew-did-registry/did-resolver-interface";

export class AuthTokenVerifier {
  private _jwt = new JWT(new Keys());
  constructor(private readonly _didDocument: IDIDDocument) {}

    /**
   * @description checks a token was signed by the issuer DID or a valid authentication delegate of the issuer
   *
   * @param token
   * @param issuerDID
   *
   * @returns {string} issuer DID or null
   */
    public async verify(token: string, issuerDID: string): Promise<string | null> {
        if (await this.isAuthorized(token))
            return issuerDID
        return null
    }

    private isAuthorized = async (claimedToken: string): Promise<boolean> => {
        //read publickey field in DID document
        const didPubKeys = this.didDocument.publicKey
        if (didPubKeys.length === 0) {
            return false
        }
        
        const keys = new Keys({ privateKey: this.privateKey })
        const jwtSigner = new JWT(keys)
        
        //get all authentication public keys
        const authenticationPubkeys = didPubKeys.filter(pubkey => {
            return this.isAuthenticationKey(pubkey, this.didDocument.authentication)
        })

        const validKeys = await this.filterValidKeys(authenticationPubkeys, async (pubKeyField) => {
            try {
                console.log(pubKeyField)
                const parts = pubKeyField["publicKeyHex"]?.split('x')
                const publickey = parts.length == 2 ? parts[1] : parts[0]
                console.log(publickey)
                const decodedClaim = await jwtSigner.verify(claimedToken, publickey);
                return decodedClaim !== undefined;
            }
            catch (error) {
                return false
            }
        })
        return validKeys.length !== 0
    }

    private filterValidKeys = async (authenticatedKey: IPublicKey[], verifSignature) => {
        const results = await Promise.all(authenticatedKey.map(verifSignature));

        return authenticatedKey.filter((_key, index) => results[index]);
    }

    /**
     * The authentication token should be signed by an "authentication" key of the DID (https://www.w3.org/TR/did-core/#authentication)
     * There are two ways to determine an authentication key.
     * 1. The publicKey's type is "sigAuth"
     * 2. The publicKey's id is in the authentication array of the DID document
     * @param publicKey The publicKey to test
     * @param documentAuthField The authentication array of the DID document
     * @returns whether or not the key is an authentication key
     */
    private isAuthenticationKey = (publicKey: IPublicKey, documentAuthField: (string | IAuthentication)[]) => {
        if (documentAuthField.length === 0 && publicKey !== undefined) {
            return this.isSigAuth(publicKey["type"])
        }
        const authenticationKeys = documentAuthField.map(auth => {
            return (this.areLinked(auth["publicKey"], publicKey["id"]))
        })
        return authenticationKeys.includes(true);
    }

    //used to check if publicKey field in authentication refers to the publicKey ID in publicKey field
    private areLinked = (authId: string, pubKeyID: string) => {
        if (authId === pubKeyID) {
            return true
        }
        if (authId.includes("#")) {
            return pubKeyID.split("#")[0] == authId.split("#")[0]
        }
        return false
    }

    private isSigAuth = (pubKeyType: string) => {
        const extractedType = pubKeyType.substring(pubKeyType.length - 7);
        return extractedType === "sigAuth"
    }
}
