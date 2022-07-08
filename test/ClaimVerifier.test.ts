import { Wallet } from 'ethers';
import { Keys } from '@ew-did-registry/keys';
import assert from 'assert';
import { ClaimVerifier } from '../lib/ClaimVerifier';
import { IRoleDefinitionV2, OffchainClaim } from '../lib/LoginStrategy.types';
import { mockDocument } from './TestDidDocuments';

const keys = new Keys({
  privateKey:
    'de0aac51c154f9d467653ae882da9b77d0699b88d98f8bb4b03fd5e687b00824',
});

const keys2 = new Keys();

const userDID = `did:ethr:volta:${keys.getAddress()}`;
const user2DID = `did:ethr:volta:${keys2.getAddress()}`;

let userClaims: OffchainClaim[];
let invalidClaims: OffchainClaim[];
let user2Claims: OffchainClaim[];
let claimsWithoutIssField: OffchainClaim[];

const claimTypeVersion = 1;
const claimType1 = 'user.roles.example1.apps.john.iam.ewc';
const claimType2 = 'user2.roles.example1.apps.john.iam.ewc';

describe('ClaimVerifier', () => {
  beforeAll(async () => {
    const claim1: OffchainClaim = {
      claimType: claimType1,
      claimTypeVersion,
      iss: userDID,
    };

    const claim2: OffchainClaim = {
      claimType: claimType2,
      claimTypeVersion,
      iss: userDID,
    };

    const claim3: OffchainClaim = {
      claimType: claimType1,
      claimTypeVersion,
      iss: user2DID,
    };

    const invalidClaim: OffchainClaim = {
      claimType: claimType1,
      claimTypeVersion,
      iss: user2DID,
    };
    claimsWithoutIssField = [claim2];
    userClaims = [claim1, claim2];
    user2Claims = [claim3];
    invalidClaims = [invalidClaim];
  });

  it('should verify Role-type claim', async () => {
    const verifier = new ClaimVerifier(
      userClaims,
      getRoleDefinition(user2DID, 'Role'),
      getUserClaims,
      getDidDocument
    );
    const verifiedRoles = await verifier.getVerifiedRoles();
    assert.strictEqual(verifiedRoles.length, userClaims.length);
  });

  it('should verify DID-type claim', async () => {
    const verifier = new ClaimVerifier(
      userClaims,
      getRoleDefinition(userDID, 'DID'),
      getUserClaims,
      getDidDocument
    );
    const verifiedRoles = await verifier.getVerifiedRoles();
    assert.strictEqual(verifiedRoles.length, userClaims.length);
  });

  it('should verify DID-type claim without iss field', async () => {
    const verifier = new ClaimVerifier(
      claimsWithoutIssField,
      getRoleDefinition(userDID, 'DID'),
      getUserClaims,
      getDidDocument
    );
    const verifiedRoles = await verifier.getVerifiedRoles();
    assert.strictEqual(verifiedRoles.length, claimsWithoutIssField.length);
  });

  // TODO: Reenable once signature verification is fixed, see https://energyweb.atlassian.net/browse/PDA-23
  xit('should reject invalid DID-type claim', async () => {
    const verifier = new ClaimVerifier(
      invalidClaims,
      getRoleDefinition(user2DID, 'DID'),
      getUserClaims,
      getDidDocument
    );
    const verifiedRoles = await verifier.getVerifiedRoles();
    assert.strictEqual(verifiedRoles.length, 0);
  });

  it('should filter out claim which does not match role definition issuer', async () => {
    const incorrectIssuerDID =
      'did:ethr:volta:0x0xeBaD11b9b20Ec11F2FC44F99C21242f510B522b6';
    const verifier = new ClaimVerifier(
      userClaims,
      getRoleDefinition(incorrectIssuerDID, 'DID'),
      getUserClaims,
      getDidDocument
    );
    const verifiedRoles = await verifier.getVerifiedRoles();
    assert.strictEqual(verifiedRoles.length, 0);
  });
});

const getRoleDefinition = (issuerDid: string, issuerType: string) => {
  const roleDef: IRoleDefinitionV2 = {
    roleName: 'user',
    issuer: {
      issuerType,
      did: [issuerDid],
      roleName: 'user.roles.example1.apps.john.iam.ewc',
    },
    revoker: {
      revokerType: issuerType,
      did: [issuerDid],
      roleName: 'user.roles.example1.apps.john.iam.ewc',
    },
    issuerFields: [
      {
        fieldType: 'fieldType',
        label: 'label',
      },
    ],
    fields: [
      {
        fieldType: 'fieldType',
        label: 'label',
      },
    ],
    enrolmentPreconditions: [],
    metadata: {},
    roleType: '',
    version: claimTypeVersion,
  };
  return () => Promise.resolve(roleDef);
};

const getUserClaims: (did: string) => Promise<OffchainClaim[]> = (
  did: string
) => {
  switch (did) {
    case userDID:
      return Promise.resolve(userClaims);
    case user2DID:
      return Promise.resolve(user2Claims);
    default:
      return Promise.resolve(new Array<OffchainClaim>());
  }
};

const getDidDocument = async () => {
  const identity = new Wallet(keys.privateKey);
  const didDocument = mockDocument(identity);

  return didDocument;
};
