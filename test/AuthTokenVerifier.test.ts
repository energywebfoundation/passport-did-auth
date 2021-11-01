import assert from "assert";
import { Wallet, utils } from "ethers";
import { JWT } from "@ew-did-registry/jwt";
import { AuthTokenVerifier } from "../lib/AuthTokenVerifier";
import { mockDocument } from "./TestDidDocuments";
import { Methods } from "@ew-did-registry/did";
import { Keys } from "@ew-did-registry/keys";
import {
  IAuthentication,
  IPublicKey,
  PubKeyType,
} from "@ew-did-registry/did-resolver-interface";

const { computePublicKey } = utils;

const payload = {
  claimType: "user.roles.example1.apps.john.iam.ewc",
  claimData: {
    blockNumber: 42,
    text: "In EWC we trust",
  },
};
const identity = Wallet.createRandom();

const createEthersClaim = async (delegate?: Wallet) => {
  if (!delegate) {
    delegate = identity;
  }
  const DID = `did:${Methods.Erc1056}:${identity.address}`;
  return new JWT(delegate).sign({
    ...payload,
    iss: DID,
  });
};
const createJwtClaim = async (delegate?: Wallet) => {
  if (!delegate) {
    delegate = identity;
  }
  const DID = `did:${Methods.Erc1056}:${identity.address}`;
  return new JWT(
    new Keys({ privateKey: delegate.privateKey.slice(2) })
  ).sign(payload, { issuer: DID });
};

describe("AuthTokenVerifier", () => {
  let verifier: AuthTokenVerifier;
  let claim: string;

  describe("Authenticate as identity", () => {
    it("should authenticate with empty document", async () => {
      claim = await createEthersClaim(identity);
      const document = mockDocument(identity, {
        withOwnerKey: false,
      });
      verifier = new AuthTokenVerifier(document);
      const did = await verifier.verify(claim);

      assert.strictEqual(did, document.id);
    });

    it("should not authenticate with other identity document", async () => {
      claim = await createEthersClaim(identity);
      const document = mockDocument(Wallet.createRandom(), {
        withOwnerKey: false,
      });
      verifier = new AuthTokenVerifier(document);
      const did = await verifier.verify(claim);

      assert.strictEqual(did, null);
    });
  });

  describe("Authenticate as delegate", () => {
    let createClaim;
    const delegateTests = () => {
      it("sigAuth delegate should be authenticated", async () => {
        const delegate = Wallet.createRandom();
        const document = mockDocument(identity);
        document.publicKey.push({
          id: `did:${Methods.Erc1056}:${delegate.address}#${PubKeyType.SignatureAuthentication2018}`,
          type: PubKeyType.SignatureAuthentication2018,
          publicKeyHex: computePublicKey(delegate.publicKey, true),
        } as IPublicKey);
        verifier = new AuthTokenVerifier(document);
        claim = await createClaim(delegate);
        const did = await verifier.verify(claim);

        assert.strictEqual(did, document.id);
      });

      it("authentication delegate should be authenticated", async () => {
        const delegate = Wallet.createRandom();
        const document = mockDocument(identity);
        document.publicKey.push({
          id: `did:${Methods.Erc1056}:${delegate.address}#${PubKeyType.VerificationKey2018}`,
          type: PubKeyType.VerificationKey2018,
          publicKeyHex: computePublicKey(delegate.publicKey, true),
        } as IPublicKey);
        document.authentication.push({
          publicKey: `did:${Methods.Erc1056}:${delegate.address}#delegate`,
        } as IAuthentication);
        verifier = new AuthTokenVerifier(document);
        claim = await createClaim(delegate);
        const did = await verifier.verify(claim);

        assert.strictEqual(did, document.id);
      });

      it("should reject authentication with mismatching DID doc", async () => {
        const delegate = Wallet.createRandom();
        const document = mockDocument(identity);
        verifier = new AuthTokenVerifier(document);
        claim = await createClaim(delegate);
        const did = await verifier.verify(claim);

        assert.strictEqual(did, null);
      });
    };

    describe("With Ethers signature", () => {
      beforeAll(() => {
        createClaim = createEthersClaim;
      });
      delegateTests();
    });

    describe("With Json web signature", () => {
      beforeAll(() => {
        createClaim = createJwtClaim;
      });
      delegateTests();
    });
  });
});
