import assert from 'assert';
import { config } from 'dotenv';
import { Keys } from '@ew-did-registry/keys'
import { ClaimsUser } from '@ew-did-registry/claims';
import { ClaimData } from './claim-creation/ClaimData';
import { ITokenPayload } from '../lib/LoginStrategy.types';
import { ClaimsUserFactory } from './claim-creation/ClaimsUserFactory';
import { LoginStrategy, LoginStrategyOptions } from '../lib/LoginStrategy';
import { providers } from 'ethers';

config();

let firstClaimToken: string;
let claimData: ClaimData;
let payload: ITokenPayload;
let claimsUser: ClaimsUser;
let secondClaimToken: string;
let otherclaimsUser: ClaimsUser;
let loginProcess: LoginStrategy;
let secondPayload: ITokenPayload;

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
const keys = new Keys({
    privateKey: process.env.PRIVATE_KEY,
  });
  const secondKeys = new Keys({
    privateKey: process.env.PRIVATE_KEY_2,
  });
  const issuerDID = `did:ethr:${keys.getAddress()}`
  const secondDID = `did:ethr:${secondKeys.getAddress()}`

describe("Testing LoginStrategy", () => {
    
    beforeAll(async () => {
        claimData = {
            claimType: "user.roles.example1.apps.john.iam.ewc",
          }
        claimsUser = ClaimsUserFactory.create(keys)
        otherclaimsUser = ClaimsUserFactory.create(secondKeys)
        loginProcess = new LoginStrategy(initParams);
        firstClaimToken = await claimsUser.createPublicClaim(claimData);
        secondClaimToken = await otherclaimsUser.createPublicClaim(claimData);
        payload = {
            claimData : {
                blockNumber: await provider.getBlockNumber() //TO-DO: Verify this parameter in specs 
            },
            iss: issuerDID,
            sub: secondDID
        }
        secondPayload = {
            claimData : {
                blockNumber: await provider.getBlockNumber() //TO-DO: Verify this parameter in specs 
            },
            iss: secondDID,
            sub: secondDID
        }
    })

    it("should authenticate first DID with first Claim issuer", async () => {
          const did = await loginProcess.verifyDidClaim(firstClaimToken, payload)
          assert.strictEqual(did, issuerDID)
    })

    it("should reject the second DID authentication with first Claim issuer", async () => {
        const did = await loginProcess.verifyDidClaim(secondClaimToken, payload)
          assert.strictEqual(did, null)
    })

    it("should reject first DID with second Claim issuer", async () => {
      const did = await loginProcess.verifyDidClaim(firstClaimToken, secondPayload)
      assert.strictEqual(did, null)
    })

    it("should authenticate second DID with second Claim issuer", async () => {
      const did = await loginProcess.verifyDidClaim(secondClaimToken, secondPayload)
      assert.strictEqual(did, secondDID)
    })
})