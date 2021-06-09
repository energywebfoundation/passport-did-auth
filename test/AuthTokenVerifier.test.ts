import assert from 'assert';
import { config } from 'dotenv';
import { JWT } from '@ew-did-registry/jwt';
import { Keys } from '@ew-did-registry/keys'
import { ClaimData } from './claim-creation/ClaimData';
import { AuthTokenVerifier } from '../lib/AuthTokenVerifier';
import {firstDocument, secondDocument} from './TestDidDocuments';

config();

let firstClaimToken: string;
let claimData: ClaimData;
let secondClaimToken: string;
let firstSigner : JWT;
let secondSigner : JWT;
let firstPayload;
let secondPayload;
let tokenAuthenticationVerifier: AuthTokenVerifier


const firstKeys = new Keys({
  privateKey: process.env.PRIVATE_KEY
});

const secondKeys = new Keys({
  privateKey: process.env.PRIVATE_KEY_2
});
const issuerDID = `did:ethr:${firstKeys.getAddress()}`
const secondDID = `did:ethr:${secondKeys.getAddress()}`

describe("Testing LoginStrategy", () => {

  beforeAll(async () => {
    claimData = {
      claimType: "user.roles.example1.apps.john.iam.ewc",
    }
    
    firstPayload = {
      claimType: "user.roles.example1.apps.john.iam.ewc",
      claimData: {
        blockNumber: 42,
        text: 'In EWC we trust'
      },
      iss: issuerDID,
      sub: secondDID
    }

    secondPayload = {
      claimType: "user.roles.example1.apps.john.iam.ewc",
      claimData: {
        blockNumber: 42,
        text: 'In EWC we trust'
      },
      iss: secondDID,
      sub: secondDID
    }

    firstSigner = new JWT(firstKeys);
    secondSigner = new JWT(secondKeys)
    firstClaimToken = await firstSigner.sign(firstPayload, { algorithm: 'ES256' });
    secondClaimToken = await secondSigner.sign(secondPayload, { algorithm: 'ES256' });
  })

  it("Checks if basic signing verification works", async () => {
    const testSignature = await secondSigner.sign('Initial signed content', { algorithm: 'ES256' })
    const secondPubKey = '0312c03a2ff680b9ab94a46d9f52b0cb934f15365f96dd3eae75661b0756318fd3'
    const decoded = await secondSigner.verify(testSignature, secondPubKey)
    
    assert.strictEqual(decoded, 'Initial signed content')

  })

  it("should authenticate first DID with first Claim issuer", async () => {
    
    tokenAuthenticationVerifier = new AuthTokenVerifier(firstKeys.privateKey, firstDocument);
    const did = await tokenAuthenticationVerifier.verify(firstClaimToken, firstPayload.iss)

    assert.strictEqual(did, issuerDID)
  })

  it("should reject the second DID authentication with first Claim issuer", async () => {
    
    tokenAuthenticationVerifier = new AuthTokenVerifier(firstKeys.privateKey, firstDocument);
    const did = await tokenAuthenticationVerifier.verify(secondClaimToken, firstPayload.iss)

    assert.strictEqual(did, null)
  })

  it("should reject first DID with second Claim issuer", async () => {
    tokenAuthenticationVerifier = new AuthTokenVerifier(secondKeys.privateKey, secondDocument);
    const did = await tokenAuthenticationVerifier.verify(firstClaimToken, secondPayload.iss)
    
    assert.strictEqual(did, null)
  })

  it("should authenticate second DID with second Claim issuer", async () => {
    
    tokenAuthenticationVerifier = new AuthTokenVerifier(secondKeys.privateKey, secondDocument);
    const did = await tokenAuthenticationVerifier.verify(secondClaimToken, secondPayload.iss)
    
    assert.strictEqual(did, secondDID)
  })
})