## Configuring LoginStrategy

LoginStrategy constructor expects the following parameters for initialisation :
1. LoginStrategyOptions
2. IssuerResolver
3. RevokerResolver
4. CredentialResolver
5. verifyProof (method)

#### 1. [LoginStrategyOptions](https://github.com/energywebfoundation/passport-did-auth/blob/ee6e9e9d89ff5051c1cd59aed32186fccc72f9e6/lib/LoginStrategy.ts#L39)

LoginStrategy accepts number of attributes (optional and non-optional). 

| Attributes | Allowed values | use case|
|------------|---------------|---------|
| claimField |        string       |   field name which holds the claim in request      |
| rpcUrl |         string      |    rpc url for the blockchain, `ewc` or `volta`     |
| cacheServerUrl |     string          |    `ssi-hub` url     |
| privateKey |        string       |     PrivateKey of the user    |
| ensResolvers |               |    Resolver contract address, used to resolve RoleDefinition (`RoleDefinitionREsolverV2` contract)     |
| didContractAddress |      string         |    DID Registry contract address (ERC1056)     |
| ensRegistryAddress |       string        |    ENS Contract address     |
| ipfsUrl |       string        |   IPFS Gateway      |
| acceptedRoles |       string[]        |    Roles needed to get authorised     |
| includeAllRoles |      boolean         |    If set to `true`, all holder's are required for authorisation     |
| jwtSecret |        string       |    Jwt secret required to encode response     |
| jwtSignOptions |               |         |
| siweMessageUri |      string         |    uri used in siwe message payload     |


> Addresses for deployed contracts are exported by [`@energyweb/credential-governance`](https://github.com/energywebfoundation/ew-credentials/blob/develop/packages/credential-governance/src/chain-constants.ts). One can choose the addresses based on the chain they want to operate upon.

To be able to use `LoginStrategy` to authorise DIDs based on role credentials -
- one can provide one of the two values -  either flag `includeAllRoles` (_verifies all the role credential issued to given DID_) attribute to `true` 
- or provide set of `acceptedRoles` (_DID needs to have atleast one of the metioned role credential issued to it_) while initialising `LoginStrategy`. `includeAllRoles` will override `acceptedRoles` in case both values are provided.

### Resolvers

LoginStrategy relies on [`IssuerVerification`](https://github.com/energywebfoundation/ew-credentials/blob/develop/packages/vc-verification/src/verifier/issuer-verification.ts) internally for verification of the roles credential. 

In order to use LoginStrategy, one needs to intialise and provide :

2. [`RoleIssuerResolver`](./lib/RoleIssuerResolver.ts/) - Resolves `issuer/s` for a `RoleDefinition`.
3. [`RoleRevokerResolver`](./lib/RoleRevokerResolver.ts/) - Resolves `revoker/s` for a `RoleDefinition`.
4. [`RoleCredentialResolver`](./lib/RoleCredentialResolver.ts/) - Resolves credentials of a holder.

It is also possible to provide own implementation of these resolvers by implementing these [`Interfaces`](https://github.com/energywebfoundation/ew-credentials/tree/develop/packages/vc-verification/src/resolver). The purpose of these resolvers are to resolve authorities responsible for issuance and revocation of these role credentials.

