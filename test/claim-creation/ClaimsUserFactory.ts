import {
  VoltaAddress1056,
  ethrReg,
  Operator,
  IdentityOwner,
  EwPrivateKeySigner,
} from '@ew-did-registry/did-ethr-resolver';
import { ClaimsUser, } from "@ew-did-registry/claims";
import {
  IOperator,
  RegistrySettings,
  ProviderSettings,
  ProviderTypes
} from "@ew-did-registry/did-resolver-interface";
import { Methods } from '@ew-did-registry/did';
import { DIDDocumentFull } from '@ew-did-registry/did-document';
import { DidStore } from '@ew-did-registry/did-ipfs-store';
import { Keys } from '@ew-did-registry/keys';

const { abi: abi1056 } = ethrReg;

const registrySettings: RegistrySettings = {
  abi: abi1056,
  address: VoltaAddress1056,
  method: Methods.Erc1056,
};

const providerSettings: ProviderSettings = {
  type: ProviderTypes.HTTP,
};

const didStore = new DidStore("http://not-used.org");

export class ClaimsUserFactory {
  static create(keys: Keys): ClaimsUser {
    const privateKeySigner = new EwPrivateKeySigner(keys.privateKey, providerSettings);
    const owner = IdentityOwner.fromPrivateKeySigner(privateKeySigner);
    // Ignoring error that "Type 'RegistrySettings' is not assignable to type 'IResolverSettings'"
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const operator: IOperator = new Operator(
      owner,
      { address: registrySettings.address },
    );
    const did = `did:ethr:${keys.getAddress()}`;
    const didDocument = new DIDDocumentFull(did, operator);
    return new ClaimsUser(owner, didDocument, didStore);
  }
}