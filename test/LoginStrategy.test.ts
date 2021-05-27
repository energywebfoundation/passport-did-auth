import assert from 'assert';
import { config } from 'dotenv';
import { Keys } from '@ew-did-registry/keys'
import { ClaimData } from './claim-creation/ClaimData';
import { ITokenPayload } from '../lib/LoginStrategy.types';
import { ClaimsUserFactory } from './claim-creation/ClaimsUserFactory';
import { LoginStrategy, LoginStrategyOptions } from '../lib/LoginStrategy';
import { ClaimsUser, ClaimsIssuer, ClaimsVerifier } from '@ew-did-registry/claims';
import { providers } from 'ethers';

config();

let claimToken: string;
let claimData: ClaimData;
let payload: ITokenPayload;
let claimsUser: ClaimsUser;
let loginProcess: LoginStrategy;
let unAuthenticatedPayload: ITokenPayload;

const initParams: LoginStrategyOptions = {
    jwtSecret: process.env.PRIVATE_PEM,
    jwtSignOptions: {
      algorithm: 'RS256',
    },
    name: 'login',
    rpcUrl: process.env.RPC_URL || 'https://volta-rpc.energyweb.org/',
    cacheServerUrl: process.env.CACHE_SERVER_URL || 'https://identitycache-dev.energyweb.org/',
    acceptedRoles: process.env.ACCEPTED_ROLES ? process.env.ACCEPTED_ROLES.split(',') : [],
    privateKey: process.env.PRIVATE_KEY,
  }

const provider = new providers.JsonRpcProvider(initParams.rpcUrl)
const issuerDID = 'did:ethr:0x72EFf9faB7876c4c1b6cAe426c121358431758F3'
const keys = new Keys({
    privateKey: process.env.PRIVATE_KEY,
  });
  const otherDID = `did:ethr:${keys.getAddress()}`

describe("Testing LoginStrategy", () => {
    
    beforeAll(async () => {
        claimData = {
            claimType: "user.roles.example1.apps.john.iam.ewc",
          }
        claimsUser = ClaimsUserFactory.create(keys)
        loginProcess = new LoginStrategy(initParams);
        claimToken = await claimsUser.createPublicClaim(claimData);
        payload = {
            claimData : {
                blockNumber: await provider.getBlockNumber() //TO-DO: Verify this parameter in specs 
            },
            iss: issuerDID,
            sub: otherDID
        }
        unAuthenticatedPayload = {
            claimData : {
                blockNumber: await provider.getBlockNumber() //TO-DO: Verify this parameter in specs 
            },
            iss: otherDID,
            sub: otherDID
        }
    })

    it("should verify DID authentication in DID document", async () => {
          const did = await loginProcess.verifyDidClaim(claimToken, payload)
       assert.strictEqual(did, issuerDID)
    })

    it("should reject the wrong DID issuer", async () => {
        const did = await loginProcess.verifyDidClaim(claimToken, unAuthenticatedPayload)
     assert.notDeepStrictEqual(did, issuerDID)
  })
})