import { JWT } from '@ew-did-registry/jwt';
import { Keys } from '@ew-did-registry/keys';
import { IAuthentication, IDIDDocument, IPublicKey } from "@ew-did-registry/did-resolver-interface";

export class AuthTokenVerifier {

    private readonly privateKey: string
    private readonly didDocument: IDIDDocument

    constructor(
        private readonly _privateKey: string,
        private readonly _didDocument: IDIDDocument
    ) {
        this.didDocument = _didDocument,
        this.privateKey = _privateKey
    }

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
        const didPubKey = this.didDocument.publicKey
        if (didPubKey.length === 0)
        return false
        
        const keys = new Keys({ privateKey: this.privateKey })
        const jwtSigner = new JWT(keys)
        
        //get all authentication public keys
        const authenticationPubkeys = this.didDocument.publicKey.filter(pubkey => {
            return this.isAuthenticated(pubkey, this.didDocument.authentication)
        })

        const validKeys = await this.filterValidKeys(authenticationPubkeys, async (pubKeyField) => {
            try {
                const publickey = pubKeyField["publicKeyHex"]?.split('x')[1]
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

    private isAuthenticated = (publicKey: IPublicKey, authFieldDocument: (string | IAuthentication)[]) => {
        if (authFieldDocument.length === 0 && publicKey !== undefined)
            return this.isSigAuth(publicKey["type"])
        const authenticationKeys = authFieldDocument.map(auth => {

            return (this.areLinked(auth["publicKey"], publicKey["id"]))
        })
        return authenticationKeys.includes(true);
    }

    //used to compare ids in DID Since the referenced pubkey id differs slighty from the auth reference Id
    private areLinked = (authId: string, pubKeyID: string) => {
        if (authId === pubKeyID)
            return true
        if (authId.includes("#")) {
            const [idRef, typeRef] = authId.split("#")
            return `${idRef}#key-${typeRef}` === pubKeyID
        }
        return false
    }

    private isSigAuth = (pubKeyType: string) => {
        const extractedType = pubKeyType.substring(pubKeyType.length - 7);
        return extractedType === "sigAuth"
    }
}
