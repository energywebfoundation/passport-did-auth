import assert from "assert";
import { Wallet } from "ethers";
import ECKey from "ec-key";
import jsonwebtoken from "jsonwebtoken";
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

const payload = {
  claimType: "user.roles.example1.apps.john.iam.ewc",
  claimData: {
    blockNumber: 42,
    text: "In EWC we trust",
  },
};
const identity = Wallet.createRandom();
const DID = `did:${Methods.Erc1056}:${identity.address}`;

const createEIP191claim = async (signer?: Wallet | Keys) => {
  if (!signer) {
    signer = identity;
  }
  return new JWT(signer).sign({
    ...payload,
    iss: DID,
  });
};
const createES256claim = async (signer) =>
  jsonwebtoken.sign(payload, signer.privKey.toString("pem"), {
    algorithm: "ES256",
    noTimestamp: true,
    issuer: DID,
  });

describe("AuthTokenVerifier", () => {
  let verifier: AuthTokenVerifier;
  let claim: string;

  describe("Authenticate as identity", () => {
    it("should authenticate with empty document", async () => {
      claim = await createEIP191claim(identity);
      const document = mockDocument(identity, {
        withOwnerKey: false,
      });
      verifier = new AuthTokenVerifier(document);
      const did = await verifier.verify(claim);

      assert.strictEqual(did, document.id);
    });

    it("should not authenticate with other identity document", async () => {
      claim = await createEIP191claim(identity);
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
    let delegate;

    const delegateTests = () => {
      it("sigAuth delegate should be authenticated", async () => {
        const document = mockDocument(identity);
        document.publicKey.push({
          id: `did:${Methods.Erc1056}:${delegate.address}#${PubKeyType.SignatureAuthentication2018}`,
          type: PubKeyType.SignatureAuthentication2018,
          publicKeyHex: delegate.publicKey,
        } as IPublicKey);
        verifier = new AuthTokenVerifier(document);
        claim = await createClaim(delegate);
        const did = await verifier.verify(claim);

        assert.strictEqual(did, document.id);
      });

      it("authentication delegate should be authenticated", async () => {
        const document = mockDocument(identity);
        document.publicKey.push({
          id: `did:${Methods.Erc1056}:${delegate.address}#${PubKeyType.VerificationKey2018}`,
          type: PubKeyType.VerificationKey2018,
          publicKeyHex: delegate.publicKey,
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
        const document = mockDocument(identity);
        verifier = new AuthTokenVerifier(document);
        claim = await createClaim(delegate);
        const did = await verifier.verify(claim);

        assert.strictEqual(did, null);
      });
    };

    describe("With ethers.Signer", () => {
      beforeAll(() => {
        delegate = Wallet.createRandom();
        createClaim = createEIP191claim;
      });
      delegateTests();
    });

    describe("With Keys signer", () => {
      beforeAll(() => {
        delegate = new Keys();
        createClaim = createEIP191claim;
      });
      delegateTests();
    });

    describe("With P256 signer", () => {
      beforeAll(() => {
        createClaim = createES256claim;
        const privKey = ECKey.createECKey("prime256v1");
        const publicKey = `0x${privKey.publicCodePoint.toString("hex")}`;
        delegate = {
          privKey,
          publicKey,
          address: publicKey,
        };
      });

      delegateTests();
    });
  });
});
