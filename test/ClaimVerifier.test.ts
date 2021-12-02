import { Wallet } from "ethers";
import { ClaimsUser } from "@ew-did-registry/claims";
import { Keys } from "@ew-did-registry/keys";
import assert from "assert";
import { ClaimVerifier } from "../lib/ClaimVerifier";
import { Claim, IRoleDefinition } from "../lib/LoginStrategy.types";
import { ClaimData } from "./claim-creation/ClaimData";
import { ClaimsUserFactory } from "./claim-creation/ClaimsUserFactory";
import { mockDocument } from "./TestDidDocuments";

const keys = new Keys({
  privateKey:
    "de0aac51c154f9d467653ae882da9b77d0699b88d98f8bb4b03fd5e687b00824",
});

const keys2 = new Keys();

const claimsUser: ClaimsUser = ClaimsUserFactory.create(keys);
const secondClaimUser: ClaimsUser = ClaimsUserFactory.create(keys2);
const issuerDID = `did:ethr:${keys.getAddress()}`;
const secondDID = `did:ethr:${keys2.getAddress()}`;

let claims: Claim[];
let invalidClaims: Claim[];
let secondClaims: Claim[];
let claimsWithoutIssField: Claim[];

describe("ClaimVerifier", () => {
  beforeAll(async () => {
    const claimType = "user.roles.example1.apps.john.iam.ewc";
    const claimData: ClaimData = {
      claimType,
      claimTypeVersion: "",
      profile: "",
    };

    const claimToken = await claimsUser.createPublicClaim(claimData);
    const secondClaimToken = await secondClaimUser.createPublicClaim(claimData);

    const claim1: Claim = {
      claimType,
      issuedToken: claimToken,
      iss: issuerDID,
    };

    const claim2: Claim = {
      claimType,
      issuedToken: claimToken,
    };

    const claim3: Claim = {
      claimType,
      issuedToken: secondClaimToken,
      iss: secondDID,
    };

    const invalidClaim: Claim = {
      claimType,
      issuedToken: secondClaimToken,
      iss: issuerDID,
    };
    claimsWithoutIssField = [claim2];
    claims = [claim1];
    secondClaims = [claim3];
    invalidClaims = [invalidClaim];
  });

  it("should verify Role-type claim", async () => {
    const verifier = new ClaimVerifier(
      claims,
      getRoleDefinition(secondDID, "Role"),
      getUserClaims,
      getDidDocument
    );
    const verifiedRoles = await verifier.getVerifiedRoles();
    assert.strictEqual(verifiedRoles.length, 1);
  });

  it("should verify DID-type claim", async () => {
    const verifier = new ClaimVerifier(
      claims,
      getRoleDefinition(issuerDID, "DID"),
      getUserClaims,
      getDidDocument
    );
    const verifiedRoles = await verifier.getVerifiedRoles();
    assert.strictEqual(verifiedRoles.length, 1);
  });

  it("should verify DID-type claim without iss field", async () => {
    const verifier = new ClaimVerifier(
      claimsWithoutIssField,
      getRoleDefinition(issuerDID, "DID"),
      getUserClaims,
      getDidDocument
    );
    const verifiedRoles = await verifier.getVerifiedRoles();
    assert.strictEqual(verifiedRoles.length, 1);
  });

  it("should reject invalid DID-type claim", async () => {
    const verifier = new ClaimVerifier(
      invalidClaims,
      getRoleDefinition(secondDID, "DID"),
      getUserClaims,
      getDidDocument
    );
    const verifiedRoles = await verifier.getVerifiedRoles();
    assert.strictEqual(verifiedRoles.length, 0);
  });

  it("should filter out claim which does not match role definition issuer", async () => {
    const incorrectIssuerDID =
      "did:ethr:0x0xeBaD11b9b20Ec11F2FC44F99C21242f510B522b6";
    const verifier = new ClaimVerifier(
      claims,
      getRoleDefinition(incorrectIssuerDID, "DID"),
      getUserClaims,
      getDidDocument
    );
    const verifiedRoles = await verifier.getVerifiedRoles();
    assert.strictEqual(verifiedRoles.length, 0);
  });
});

const getRoleDefinition = (issuerDid: string, issuerType: string) => {
  const roleDef: IRoleDefinition = {
    roleName: "user",
    issuer: {
      issuerType,
      did: [issuerDid],
      roleName: "user.roles.example1.apps.john.iam.ewc",
    },
    fields: [
      {
        fieldType: "fieldType",
        label: "label",
        validation: "validation",
      },
    ],
    metadata: {},
    roleType: "",
    version: "",
  };
  return () => Promise.resolve(roleDef);
};

const getUserClaims: (did: string) => Promise<Claim[]> = (did: string) => {
  switch (did) {
    case issuerDID:
      return Promise.resolve(claims);
    case secondDID:
      return Promise.resolve(secondClaims);
    default:
      return Promise.resolve(new Array<Claim>());
  }
};

const getDidDocument = async () => {
  const identity = new Wallet(keys.privateKey);
  const didDocument = mockDocument(identity);

  return didDocument;
};
