import { Methods } from "@ew-did-registry/did";
import {
  IDIDDocument,
  IPublicKey,
  KeyTags,
  PubKeyType,
} from "@ew-did-registry/did-resolver-interface";
import { Wallet, utils, BigNumber } from "ethers";

const { computePublicKey } = utils;

export const mockDocument = (
  identity: Wallet,
  { withOwnerKey = true }: { withOwnerKey?: boolean } = {}
): IDIDDocument => {
  const did = `did:${Methods.Erc1056}:volta:${identity.address}`;
  const doc: IDIDDocument = {
    "@context": "https://w3id.org/did/v1",
    id: did,
    publicKey: [],
    authentication: [],
    service: [],
  } as IDIDDocument;
  if (withOwnerKey) {
    doc.authentication.push({
      type: "owner",
      validity: BigNumber.from(47),
      publicKey: `${did}#owner`,
    });
    doc.publicKey.push({
      id: `${did}#${KeyTags.OWNER}`,
      type: PubKeyType.VerificationKey2018,
      controller: did,
      publicKeyHex: computePublicKey(identity.publicKey, true),
    } as IPublicKey);
  }
  return doc as IDIDDocument;
};
