<p align="center">
  <img src="https://github.com/energywebfoundation/passport-did-auth/actions/workflows/deploy.yml/badge.svg" />
</p>

# Node.js Passport strategy using decentralised identifiers

## Getting Started

This repository consists of a Node.js Password Strategy which provides verification of the issuance of credential made regarding roles defined in an Ethereum Naming System (ENS).

## LoginStrategy

This class provides implementation for verification of issued roles credential. The verification ensures that the credentials were issued by the authorised issuers and are neither revoked nor expired.

LoginStrategy relies on [`IssuerVerification`](https://github.com/energywebfoundation/ew-credentials/blob/develop/packages/vc-verification/src/verifier/issuer-verification.ts) internally for verification of the roles credential. 

In order to use LoginStrategy, one needs to intialise and provide :
[`RoleIssuerResolver`](./lib/RoleIssuerResolver.ts/)
[`RoleRevokerResolver`](./lib/RoleRevokerResolver.ts/)
[`RoleCredentialResolver`](./lib/RoleCredentialResolver.ts/)

It is also possible to provide own implementation of these resolvers by implementing these [`Interfaces`](https://github.com/energywebfoundation/ew-credentials/tree/develop/packages/vc-verification/src/resolver). The purpose of these resolvers are to resolve authorities responsible for issuance and revocation of these role credentials.

Check configurations / parameters for [`LoginStrategy`](./lib/LoginStrategy.ts/)

```Typescript
import {
  LoginStrategyOptions,
  LoginStrategy,
  RoleIssuerResolver,
  RoleRevokerResolver,
  RoleCredentialResolver,
} from 'paasport-did-auth';
import {
  DomainReader,
  ResolverContractType,
} from '@energyweb/credential-governance';
import { IpfsConfig } from 'iam-client-lib';
import { providers } from 'ethers';
import { verifyCredential } from 'didkit-wasm-node';
import passport from 'passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Methods } from '@ew-did-registry/did';
import { ethrReg } from '@ew-did-registry/did-ethr-resolver';
import { DidStore } from '@ew-did-registry/did-ipfs-store';
import { RegistrySettings } from '@ew-did-registry/did-resolver-interface';

const jwtSecret = 'secret';
const didRegistryAddress = '0x12321ffe321...';
const ensRegistryAddress = '0x12321ffe322...';
const ensResolverAddress = '0x12321ffe323...';

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: jwtSecret,
};
const LOGIN_STRATEGY = 'login';
const provider = new providers.JsonRpcProvider(rpcUrl);

const loginStrategyOptions: LoginStrategyOptions = {
  jwtSecret: 'private_pem_secret',
  rpcUrl: `http://localhost:8544`,
  name: LOGIN_STRATEGY,
  didContractAddress: didRegistryAddress,
  ensRegistryAddress: ensRegistryAddress,
  cacheServerUrl: 'http://12.34.56.1111/',
  ...other configurations,
};

const ipfsConfig: IpfsConfig = {
  ...some ipfsConfig
};
const didStore = new DidStore(ipfsConfig);
const domainReader = new DomainReader({
  ensRegistryAddress: ensRegistryAddress,
  provider: provider,
});
domainReader.addKnownResolver({
  chainId: 123,
  address: ensResolverAddress,
  type: ResolverContractType.RoleDefinitionResolver_v2,
});

const registrySettings: RegistrySettings = {
  abi: ethrReg.abi,
  address: didRegistryAddress,
  method: Methods.Erc1056,
};
const issuerResolver = new RoleIssuerResolver(domainReader);
const revokerResolver = new RoleRevokerResolver(domainReader);
const credentialResolver = new RoleCredentialResolver(
  provider,
  registrySettings,
  didStore
);

const loginStrategy = new LoginStrategy(
  loginStrategyOptions,
  issuerResolver,
  revokerResolver,
  credentialResolver,
  verifyCredential
);

passport.use(loginStrategy);
passport.use(
  new Strategy(jwtOptions, (_payload, _done) => {
    return _done(null, _payload);
  })
);

const token = 'askjad...';
const payload = {
  iss: `did:ethr:volta:0x1224....`,
  claimData: {
    blockNumber: 4242,
  },
  sub: '',
};

await loginStrategy.validate(token, payload);
```

## Token payload structure

Token payload should have following structure

```Typescript
{
  claimData: {
    blockNumber: number;
  };
  iss: string;
}
```

where the `iss` is DID of the subject and `blockNumber` is block number (or height) of the most recently mined block.

### Prerequisities

```
npm version 7+
nodejs version 16.10+
```

### Building the Passport Strategy

```
npm run build
```

### Example applications

Example server applications which demonstrate the use of the passport strategy can be found in [this repository](https://github.com/energywebfoundation/iam-client-examples). The repository also contains client examples which leverage the [iam-client-lib](https://github.com/energywebfoundation/iam-client-lib/) to interact with the server applications.

## Active Maintainers

- [John Henderson](https://github.com/jrhender)
- [Dmitry Fesenko](https://github.com/JGiter)
- [Jakub Sydor](https://github.com/Harasz)
- [Ashish Tripathi](https://github.com/nichonien)
