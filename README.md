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

To know more about `LoginStrategy` initialization check [How to configure LoginStrategy](./configure-loginstrategy.md).

#### Example LoginStrategy Initialisation

```Typescript
import {
  DidStore,
  DomainReader,
  ethrReg,
  EWC_CHAIN_ID,
  EWC_ADDRESS_1056,
  EWC_ENS_REGISTRY_ADDRESS,
  EWC_RESOLVER_V2_ADDRESS,
  LoginStrategy,
  Methods,
  RegistrySettings,
  RoleCredentialResolver,
  RoleIssuerResolver,
  RoleRevokerResolver,
  ResolverContractType,
  VOLTA_CHAIN_ID,
  VOLTA_ERC_1056_ADDRESS,
  VOLTA_ENS_REGISTRY_ADDRESS,
  VOLTA_RESOLVER_V2_ADDRESS,
} from 'passport-did-auth';
import { providers } from 'ethers';
import { verifyCredential } from 'didkit-wasm-node';
import passport from 'passport';
import { Strategy, ExtractJwt } from 'passport-jwt';

const jwtSecret = 'secret';
// Use contract addresses specific to the chain you are connected to
const didRegistryAddress = VOLTA_ERC_1056_ADDRESS;
const ensRegistryAddress = VOLTA_ENS_REGISTRY_ADDRESS;
const ensResolverAddress = VOLTA_RESOLVER_V2_ADDRESS;

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
  chainId: VOLTA_CHAIN_ID,
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
```

### Login with EIP191 Jwt token (Sign-in with Ethereum)

```typescript
const token = 'askjad...'; // EIP191 signed JWT
const payload = {
  iss: `did:ethr:volta:0x1224....`,
  claimData: {
    blockNumber: 4242,
  },
  sub: '',
};

await loginStrategy.validate(token, payload);
```
where the `iss` is DID of the subject and `blockNumber` is block number (or height) of the most recently mined block.

### Login with SIWE (Sign-in with Ethereum)

* While login with SIWE, one must initialise LoginStrategy with `siweMessageUri` (one of the attribute of `LoginStrategyOptions`).

```typescript
const token = '0xdc35c7f8ba2720df052e0092556456127f00f7707eaa8e3bbff7e56774e7f2e05a093cfc9e02964c33d86e8e066e221b7d153d27e5a2e97ccd5ca7d3f2ce06cb1b'; // EIP712 signature

const sampleSiwePayload: Partial<SiweMessagePayload> = {
  domain: 'login.xyz',
  address: '0x9D85ca56217D2bb651b00f15e694EB7E713637D4',
  statement: 'Sign-In With Ethereum Example Statement',
  uri: 'https://login.xyz',
  version: '1',
  nonce: 'bTyXgcQxn2htgkjJn',
  issuedAt: '2022-01-27T17:09:38.578Z',
  chainId: 1,
  expirationTime: '2100-01-07T14:31:43.952Z',
};

await loginStrategy.validate(token, payload);
```
> Read more about Sign-In with Ethereum [here](https://docs.login.xyz)

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
- [Ashish Tripathi](https://github.com/nichonien)
