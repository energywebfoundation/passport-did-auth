<p align="center">
  <img src="https://github.com/energywebfoundation/passport-did-auth/actions/workflows/deploy.yml/badge.svg" />
</p>

# Node.js Passport strategy using decentralised identifiers

## Description

This repository consists of a Node.js Password Strategy which authenticates based on roles defined in Energy Web Foundation Ethereum namespace.

## Sequence diagram

 ```mermaid
sequenceDiagram
autonumber
    participant C as Client
    participant LS as LoginStrategy
    participant CV as ClaimVerifier
    participant PV as ProofVerifier
    participant CR as CredentialResolver
    participant IV as IssuerVerification
    participant SH as SSI-HUB
    participant IPFS
    participant DR as DomainReader
rect rgb(200, 255, 255)
    Note right of C: Initialisation
    C->>C: Client sets the login strategy options and initialises LoginStrategy
    Note right of C: Validation Call
    C->>LS: LoginStrategy.validate(token, payload)
end
rect rgb(255, 220, 255)
    Note right of LS: Signature and role validation
    LS->>PV: Authenticate token issuer
    LS ->> CR : Fetches role credentials {by DID}
    alt Fetch DID Document from SSI-HUB if cacheClient initialised
      CR->>SH: Fetch cached DID Document
      loop For each serviceEndpoint
        CR->>IPFS : Resolve credential from IPFS
      end
    else Resolve DID Document from Blockchain
      loop For each serviceEndpoint
        CR->>IPFS : Resolve credential from IPFS
      end
    end
    CR-->>LS: returns credentials
end
rect rgb(255, 255, 220)
    Note right of CV: Issuer verification
    LS->>LS: Initialise ClaimVerifier <br> {RoleEIP191Jwt[], getRoleDefinition, IssuerVerification}
    LS->>CV: ClaimVerifier.getVerifiedRoles(userCredentials, getRoleDefinition, issuerVerification) 
    loop For each claims
      alt Fetch role definition from SSI-HUB if cacheClient initialised
        CV->>SH: Request role definition
        SH-->>CV: return role definition
      else Fetch role definition from DomainReader
        CV->>DR: Request role definition
        DR-->>CV: return role definition
      end
      CV->>IV: IssuerVerification.verifyIssuer() <br> verifies issuers in the hierarchy along with their revocation status and expiration
      IV-->>CV : Returns VerificationResult
    end
    CV-->>LS: returns verified roles
    LS->>LS: checks if accepted roles are in verified roles
end
```

## LoginStrategy

This class provides implementation for verification of issued roles credential. The verification ensures that the credentials were issued by the authorised issuers and are neither revoked nor expired. LoginStrategy can be configured to authenticate only EnergyWeb Roles.

LoginStrategy relies on [`IssuerVerification`](https://github.com/energywebfoundation/ew-credentials/blob/develop/packages/vc-verification/src/verifier/issuer-verification.ts) internally for verification of the roles credential. 

In order to use LoginStrategy, one needs to intialise and provide :
[`RoleIssuerResolver`](./lib/RoleIssuerResolver.ts/)
[`RoleRevokerResolver`](./lib/RoleRevokerResolver.ts/)
[`RoleCredentialResolver`](./lib/RoleCredentialResolver.ts/)

Addresses for deployed contracts are exported by [`@energyweb/credential-governance`](https://github.com/energywebfoundation/ew-credentials/blob/develop/packages/credential-governance/src/chain-constants.ts). One can choose the addresses based on the chain they want to operate upon.

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
// Use contract addresses specific to the chain you are connected to (import from ew-credential)
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
