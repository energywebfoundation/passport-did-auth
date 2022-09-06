import { utils } from 'ethers';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { JWT } from '@ew-did-registry/jwt';
import { abi as erc1056Abi } from './testUtils/ERC1056.json';
import { JsonRpcProvider, JsonRpcSigner } from '@ethersproject/providers';
import {
  StatusListEntryType,
  CredentialStatusPurpose,
} from '@ew-did-registry/credentials-interface';
import assert from 'assert';
import {
  DomainReader,
  DomainTransactionFactoryV2,
  IRoleDefinitionV2,
  ResolverContractType,
  VOLTA_CHAIN_ID,
} from '@energyweb/credential-governance';
import { PreconditionType } from '@energyweb/credential-governance';
import { EwSigner, Operator } from '@ew-did-registry/did-ethr-resolver';
import { DidStore } from '@ew-did-registry/did-ipfs-store';
import { Methods } from '@ew-did-registry/did';
import {
  deployClaimManager,
  deployDidRegistry,
  deployEns,
  deployIdentityManager,
  didContract,
  ensRegistry,
  ensResolver,
  rpcUrl,
} from './setup_contracts';
import {
  CredentialResolver,
  IssuerVerification,
  IssuerResolver,
  RevocationVerification,
  RevokerResolver,
  RoleEIP191JWT,
} from '@energyweb/vc-verification';
import {
  DIDAttribute,
  ProviderTypes,
  ProviderSettings,
  RegistrySettings,
  IUpdateData,
} from '@ew-did-registry/did-resolver-interface';
import { Keys } from '@ew-did-registry/keys';
import { spawnIpfsDaemon, shutDownIpfsDaemon } from './testUtils/ipfs-daemon';
import {
  adminStatusList,
  managerStatusList,
} from './Fixtures/sample-statuslist-credential';
import nock from 'nock';
import { verifyCredential } from 'didkit-wasm-node';
import { ClaimVerifier } from '../lib/ClaimVerifier';
import { RoleIssuerResolver } from '../lib/RoleIssuerResolver';
import { RoleRevokerResolver } from '../lib/RoleRevokerResolver';
import { RoleCredentialResolver } from '../lib/RoleCredentialResolver';
import { StatusListEntryVerification } from '@ew-did-registry/revocation';

chai.use(chaiAsPromised);
const expect = chai.expect;

const root = `0x${'0'.repeat(64)}`;
const adminRole = 'admin';
const userRole = 'user';
const activeuserRole = 'active-user';
const managerRole = 'manager';

const hashLabel = (label: string): string =>
  utils.keccak256(utils.toUtf8Bytes(label));
const defaultVersion = 1;

let roleFactory: DomainTransactionFactoryV2;
let provider: JsonRpcProvider;
let issuerVerification: IssuerVerification;
let registrySettings: RegistrySettings;
let credentialResolver: CredentialResolver;
let issuerResolver: IssuerResolver;
let revokerResolver: RevokerResolver;
let revocationVerification: RevocationVerification;
let statusListEntryVerificaiton: StatusListEntryVerification;
let domainReader: DomainReader;

let deployer: JsonRpcSigner;
let deployerAddr: string;
let manager: EwSigner;
let managerAddress: string;
let admin: EwSigner;
let adminAddress: string;

let adminKeys: Keys;
let adminDid: string;
let managerKeys: Keys;
let managerDid: string;

let adminOperator: Operator;
let managerOperator: Operator;
let providerSettings: ProviderSettings;
let ipfsUrl: string;
let didStore: DidStore;

const validity = 10 * 60 * 1000;
jest.setTimeout(84000);

describe('ClaimVerifier', () => {
  beforeAll(async function () {
    provider = new JsonRpcProvider(rpcUrl);
    deployer = provider.getSigner(0);
    deployerAddr = await deployer.getAddress();
    await deployDidRegistry();
    await deployEns();
    await deployClaimManager();
    await deployIdentityManager();

    providerSettings = {
      type: ProviderTypes.HTTP,
    };

    adminKeys = new Keys({
      privateKey:
        '388c684f0ba1ef5017716adb5d21a053ea8e90277d0868337519f97bede61418',
    });
    adminAddress = adminKeys.getAddress();
    adminDid = `did:${Methods.Erc1056}:${adminAddress}`;
    admin = EwSigner.fromPrivateKey(adminKeys.privateKey, providerSettings);

    managerKeys = new Keys({
      privateKey:
        'aa3680d5d48a8283413f7a108367c7299ca73f553735860a87b08f39395618b7',
    });
    managerAddress = managerKeys.getAddress();
    managerDid = `did:${Methods.Erc1056}:${managerAddress}`;
    manager = EwSigner.fromPrivateKey(managerKeys.privateKey, providerSettings);
  });

  afterEach(async () => {
    await shutDownIpfsDaemon();
  });

  beforeEach(async function () {
    roleFactory = new DomainTransactionFactoryV2({
      domainResolverAddress: ensResolver.address,
    });
    ipfsUrl = await spawnIpfsDaemon();

    didStore = new DidStore(ipfsUrl);

    registrySettings = {
      method: Methods.Erc1056,
      abi: erc1056Abi,
      address: didContract.address,
    };

    providerSettings = {
      type: ProviderTypes.HTTP,
    };
    adminOperator = new Operator(admin, { address: didContract.address });
    managerOperator = new Operator(manager, { address: didContract.address });

    await adminOperator.create();
    await managerOperator.create();

    domainReader = new DomainReader({
      ensRegistryAddress: ensRegistry.address,
      provider: provider,
    });

    domainReader.addKnownResolver({
      chainId: VOLTA_CHAIN_ID,
      address: ensResolver.address,
      type: ResolverContractType.RoleDefinitionResolver_v2,
    });

    issuerResolver = new RoleIssuerResolver(domainReader);
    revokerResolver = new RoleRevokerResolver(domainReader);
    credentialResolver = new RoleCredentialResolver(
      provider,
      registrySettings,
      didStore
    );
    revocationVerification = new RevocationVerification(
      revokerResolver,
      issuerResolver,
      credentialResolver,
      provider,
      registrySettings,
      verifyCredential
    );
    statusListEntryVerificaiton = new StatusListEntryVerification(
      verifyCredential
    );
    issuerVerification = new IssuerVerification(
      issuerResolver,
      credentialResolver,
      provider,
      registrySettings,
      revocationVerification,
      verifyCredential
    );

    await (
      await ensRegistry.setSubnodeOwner(
        root,
        hashLabel(adminRole),
        deployerAddr
      )
    ).wait();
    await (
      await ensRegistry.setSubnodeOwner(root, hashLabel(userRole), deployerAddr)
    ).wait();
    await (
      await ensRegistry.setSubnodeOwner(
        root,
        hashLabel(activeuserRole),
        deployerAddr
      )
    ).wait();
    await (
      await ensRegistry.setSubnodeOwner(
        root,
        hashLabel(managerRole),
        deployerAddr
      )
    ).wait();

    await (
      await ensRegistry.setResolver(
        utils.namehash(adminRole),
        ensResolver.address
      )
    ).wait();
    await (
      await ensRegistry.setResolver(
        utils.namehash(userRole),
        ensResolver.address
      )
    ).wait();
    await (
      await ensRegistry.setResolver(
        utils.namehash(activeuserRole),
        ensResolver.address
      )
    ).wait();
    await (
      await ensRegistry.setResolver(
        utils.namehash(managerRole),
        ensResolver.address
      )
    ).wait();

    await (
      await deployer.sendTransaction({
        ...roleFactory.newRole({
          domain: adminRole,
          roleDefinition: {
            roleName: adminRole,
            enrolmentPreconditions: [],
            requestorFields: [],
            issuerFields: [],
            issuer: {
              issuerType: 'DID',
              did: [`did:ethr:volta:${await admin.getAddress()}`],
            },
            revoker: {
              revokerType: 'DID',
              did: [`did:ethr:volta:${await admin.getAddress()}`],
            },
            metadata: [],
            roleType: '',
            version: defaultVersion,
          },
        }),
      })
    ).wait();

    await (
      await deployer.sendTransaction({
        ...roleFactory.newRole({
          domain: userRole,
          roleDefinition: {
            roleName: userRole,
            enrolmentPreconditions: [],
            requestorFields: [],
            issuerFields: [],
            issuer: { issuerType: 'ROLE', roleName: managerRole },
            revoker: { revokerType: 'ROLE', roleName: managerRole },
            metadata: [],
            roleType: '',
            version: defaultVersion,
          },
        }),
      })
    ).wait();

    await (
      await deployer.sendTransaction({
        ...roleFactory.newRole({
          domain: activeuserRole,
          roleDefinition: {
            roleName: activeuserRole,
            enrolmentPreconditions: [
              { type: PreconditionType.Role, conditions: [userRole] },
            ],
            requestorFields: [],
            issuerFields: [],
            issuer: { issuerType: 'ROLE', roleName: managerRole },
            revoker: { revokerType: 'ROLE', roleName: managerRole },
            metadata: [],
            roleType: '',
            version: defaultVersion,
          },
        }),
      })
    ).wait();

    await (
      await deployer.sendTransaction({
        ...roleFactory.newRole({
          domain: managerRole,
          roleDefinition: {
            roleName: managerRole,
            enrolmentPreconditions: [],
            requestorFields: [],
            issuerFields: [],
            issuer: { issuerType: 'ROLE', roleName: adminRole },
            revoker: { revokerType: 'ROLE', roleName: adminRole },
            metadata: [],
            roleType: '',
            version: defaultVersion,
          },
        }),
      })
    ).wait();
  });

  it('Should verify credentials, where the issuerType is did', async () => {
    const adminJWT = new JWT(adminKeys);
    const claim = {
      claimData: {
        fields: { name: 'test1' },
        claimTypeVersion: 1,
        claimType: adminRole,
      },
      iss: adminDid,
      signer: adminDid,
    };
    const token = await adminJWT.sign(claim);
    const ipfsCID = await didStore.save(token);
    const serviceId = adminRole;
    const updateData: IUpdateData = {
      type: DIDAttribute.ServicePoint,
      value: {
        id: `${adminDid}#service-${serviceId}`,
        type: 'ClaimStore',
        serviceEndpoint: ipfsCID,
      },
    };
    await adminOperator.update(
      adminDid,
      DIDAttribute.ServicePoint,
      updateData,
      validity
    );
    const userclaims: RoleEIP191JWT[] = [
      {
        payload: claim,
        eip191Jwt: token,
      },
    ];

    const claimverifier = new ClaimVerifier(
      userclaims,
      getAdminRoleDefinition,
      issuerVerification,
      revocationVerification,
      statusListEntryVerificaiton
    );
    const verifiedRoles = await claimverifier.getVerifiedRoles();
    assert.strictEqual(verifiedRoles.length, userclaims.length);
  });

  it('should verify credentials, where the issuerType is role', async () => {
    const adminJWT = new JWT(adminKeys);
    const adminClaim = {
      claimData: {
        fields: { name: 'test2' },
        claimType: adminRole,
        claimTypeVersion: 1,
      },
      iss: adminDid,
      credentialStatus: {
        id: 'https://identitycache-dev.energyweb.org/v1/status-list/urn:uuid:4fb4e120-a566-499c-85fb-47bb5abd3d6b',
        type: StatusListEntryType.Entry2021,
        statusPurpose: CredentialStatusPurpose.REVOCATION,
        statusListIndex: '0',
        statusListCredential:
          'https://identitycache-dev.energyweb.org/v1/status-list/urn:uuid:4fb4e120-a566-499c-85fb-47bb5abd3d6b',
      },
      signer: adminDid,
    };
    const token = await adminJWT.sign(adminClaim);
    const ipfsCIDAdmin = await didStore.save(token);
    const serviceIdAdmin = adminRole;
    const updateDataAdmin: IUpdateData = {
      type: DIDAttribute.ServicePoint,
      value: {
        id: `${adminDid}#service-${serviceIdAdmin}`,
        type: 'ClaimStore',
        serviceEndpoint: ipfsCIDAdmin,
      },
    };
    await adminOperator.update(
      adminDid,
      DIDAttribute.ServicePoint,
      updateDataAdmin,
      validity
    );

    const managerClaim = {
      claimData: {
        fields: { name: 'test22' },
        claimTypeVersion: 1,
        claimType: managerRole,
      },
      iss: adminDid,
      credentialStatus: {
        id: 'https://identitycache-dev.energyweb.org/v1/status-list/urn:uuid:4fb4e120-a566-499c-85fb-47bb5abd3d6b',
        type: StatusListEntryType.Entry2021,
        statusPurpose: CredentialStatusPurpose.REVOCATION,
        statusListIndex: '0',
        statusListCredential:
          'https://identitycache-dev.energyweb.org/v1/status-list/urn:uuid:4fb4e120-a566-499c-85fb-47bb5abd3d6b',
      },
      signer: adminDid,
    };
    const managersIssuedToken = await adminJWT.sign(managerClaim);
    const ipfsCIDManager = await didStore.save(managersIssuedToken);
    const serviceIdManager = managerRole;
    const updateDataManager: IUpdateData = {
      type: DIDAttribute.ServicePoint,
      value: {
        id: `${managerDid}#service-${serviceIdManager}`,
        type: 'ClaimStore',
        serviceEndpoint: ipfsCIDManager,
      },
    };
    await managerOperator.update(
      managerDid,
      DIDAttribute.ServicePoint,
      updateDataManager,
      validity
    );
    nock(managerClaim.credentialStatus.statusListCredential)
      .get('')
      .reply(204, undefined);
    nock(adminClaim.credentialStatus.statusListCredential)
      .get('')
      .reply(204, undefined);

    const userclaims: RoleEIP191JWT[] = [
      {
        payload: managerClaim,
        eip191Jwt: managersIssuedToken,
      },
    ];

    const claimverifier = new ClaimVerifier(
      userclaims,
      getAdminRoleDefinition,
      issuerVerification,
      revocationVerification,
      statusListEntryVerificaiton
    );
    const verifiedRoles = await claimverifier.getVerifiedRoles();
    assert.strictEqual(verifiedRoles.length, userclaims.length);
  });

  it('should verify credentials, if expiration timestamp is valid', async () => {
    const adminJWT = new JWT(adminKeys);
    const adminClaim = {
      claimData: {
        fields: { name: 'test3' },
        claimType: adminRole,
        claimTypeVersion: 1,
      },
      iss: adminDid,
      credentialStatus: {
        id: 'https://identitycache-dev.energyweb.org/v1/status-list/urn:uuid:4fb4e120-a566-499c-85fb-47bb5abd3d6b',
        type: StatusListEntryType.Entry2021,
        statusPurpose: CredentialStatusPurpose.REVOCATION,
        statusListIndex: '0',
        statusListCredential:
          'https://identitycache-dev.energyweb.org/v1/status-list/urn:uuid:4fb4e120-a566-499c-85fb-47bb5abd3d6b',
      },
      signer: adminDid,
    };
    const token = await adminJWT.sign(adminClaim);
    const ipfsCIDAdmin = await didStore.save(token);
    const serviceIdAdmin = adminRole;
    const updateDataAdmin: IUpdateData = {
      type: DIDAttribute.ServicePoint,
      value: {
        id: `${adminDid}#service-${serviceIdAdmin}`,
        type: 'ClaimStore',
        serviceEndpoint: ipfsCIDAdmin,
      },
    };
    await adminOperator.update(
      adminDid,
      DIDAttribute.ServicePoint,
      updateDataAdmin,
      validity
    );

    const managerClaim = {
      claimData: {
        fields: { name: 'test32' },
        claimTypeVersion: 1,
        claimType: managerRole,
      },
      iss: adminDid,
      exp: Math.floor((Date.now() + 20000) / 1000),
      credentialStatus: {
        id: 'https://identitycache-dev.energyweb.org/v1/status-list/urn:uuid:4fb4e120-a566-499c-85fb-47bb5abd3d6b',
        type: StatusListEntryType.Entry2021,
        statusPurpose: CredentialStatusPurpose.REVOCATION,
        statusListIndex: '0',
        statusListCredential:
          'https://identitycache-dev.energyweb.org/v1/status-list/urn:uuid:4fb4e120-a566-499c-85fb-47bb5abd3d6b',
      },
      signer: adminDid,
    };
    const managersIssuedToken = await adminJWT.sign(managerClaim);
    const ipfsCIDManager = await didStore.save(managersIssuedToken);
    const serviceIdManager = managerRole;
    const updateDataManager: IUpdateData = {
      type: DIDAttribute.ServicePoint,
      value: {
        id: `${managerDid}#service-${serviceIdManager}`,
        type: 'ClaimStore',
        serviceEndpoint: ipfsCIDManager,
      },
    };
    await managerOperator.update(
      managerDid,
      DIDAttribute.ServicePoint,
      updateDataManager,
      validity
    );
    nock(managerClaim.credentialStatus.statusListCredential)
      .get('')
      .reply(204, undefined);
    nock(adminClaim.credentialStatus.statusListCredential)
      .get('')
      .reply(204, undefined);

    const userclaims: RoleEIP191JWT[] = [
      {
        payload: managerClaim,
        eip191Jwt: managersIssuedToken,
      },
    ];

    const claimverifier = new ClaimVerifier(
      userclaims,
      getAdminRoleDefinition,
      issuerVerification,
      revocationVerification,
      statusListEntryVerificaiton
    );
    const verifiedRoles = await claimverifier.getVerifiedRoles();
    assert.strictEqual(verifiedRoles.length, userclaims.length);
  });

  it('should not verify credentials, if it is expired', async () => {
    const adminJWT = new JWT(adminKeys);
    const adminClaim = {
      claimData: {
        fields: { name: 'test4' },
        claimType: adminRole,
        claimTypeVersion: 1,
      },
      iss: adminDid,
      credentialStatus: {
        id: 'https://identitycache-dev.energyweb.org/v1/status-list/urn:uuid:4fb4e120-a566-499c-85fb-47bb5abd3d6b',
        type: StatusListEntryType.Entry2021,
        statusPurpose: CredentialStatusPurpose.REVOCATION,
        statusListIndex: '0',
        statusListCredential:
          'https://identitycache-dev.energyweb.org/v1/status-list/urn:uuid:4fb4e120-a566-499c-85fb-47bb5abd3d6b',
      },
      signer: adminDid,
    };
    const token = await adminJWT.sign(adminClaim);
    const ipfsCIDAdmin = await didStore.save(token);
    const serviceIdAdmin = adminRole;
    const updateDataAdmin: IUpdateData = {
      type: DIDAttribute.ServicePoint,
      value: {
        id: `${adminDid}#service-${serviceIdAdmin}`,
        type: 'ClaimStore',
        serviceEndpoint: ipfsCIDAdmin,
      },
    };
    await adminOperator.update(
      adminDid,
      DIDAttribute.ServicePoint,
      updateDataAdmin,
      validity
    );

    const managerClaim = {
      claimData: {
        fields: { name: 'test42' },
        claimTypeVersion: 1,
        claimType: managerRole,
      },
      iss: adminDid,
      exp: Math.floor((Date.now() + 2000) / 1000),
      credentialStatus: {
        id: 'https://identitycache-dev.energyweb.org/v1/status-list/urn:uuid:4fb4e120-a566-499c-85fb-47bb5abd3d6b',
        type: StatusListEntryType.Entry2021,
        statusPurpose: CredentialStatusPurpose.REVOCATION,
        statusListIndex: '0',
        statusListCredential:
          'https://identitycache-dev.energyweb.org/v1/status-list/urn:uuid:4fb4e120-a566-499c-85fb-47bb5abd3d6b',
      },
      signer: adminDid,
    };
    const managersIssuedToken = await adminJWT.sign(managerClaim);
    const ipfsCIDManager = await didStore.save(managersIssuedToken);
    const serviceIdManager = managerRole;
    const updateDataManager: IUpdateData = {
      type: DIDAttribute.ServicePoint,
      value: {
        id: `${managerDid}#service-${serviceIdManager}`,
        type: 'ClaimStore',
        serviceEndpoint: ipfsCIDManager,
      },
    };
    await managerOperator.update(
      managerDid,
      DIDAttribute.ServicePoint,
      updateDataManager,
      validity
    );

    const delay = (ms) => new Promise((res) => setTimeout(res, ms));
    await delay(3000);

    const userclaims: RoleEIP191JWT[] = [
      {
        payload: managerClaim,
        eip191Jwt: managersIssuedToken,
      },
    ];

    const claimverifier = new ClaimVerifier(
      userclaims,
      getAdminRoleDefinition,
      issuerVerification,
      revocationVerification,
      statusListEntryVerificaiton
    );
    const verifiedRoles = await claimverifier.getVerifiedRoles();
    assert.notEqual(verifiedRoles.length, userclaims.length);
  });

  it('should not verify credential, if it is revoked', async () => {
    const adminJWT = new JWT(adminKeys);
    const adminClaim = {
      claimData: {
        fields: { name: 'test5' },
        claimType: adminRole,
        claimTypeVersion: 1,
      },
      iss: adminDid,
      credentialStatus: {
        id: 'https://identitycache-dev.energyweb.org/v1/status-list/urn:uuid:4fb4e120-a566-499c-85fb-47bb5abd3d6b',
        type: StatusListEntryType.Entry2021,
        statusPurpose: CredentialStatusPurpose.REVOCATION,
        statusListIndex: '0',
        statusListCredential:
          'https://identitycache-dev.energyweb.org/v1/status-list/urn:uuid:4fb4e120-a566-499c-85fb-47bb5abd3d6b',
      },
      signer: adminDid,
    };
    const token = await adminJWT.sign(adminClaim);
    const ipfsCIDAdmin = await didStore.save(token);
    const serviceIdAdmin = adminRole;
    const updateDataAdmin: IUpdateData = {
      type: DIDAttribute.ServicePoint,
      value: {
        id: `${adminDid}#service-${serviceIdAdmin}`,
        type: 'ClaimStore',
        serviceEndpoint: ipfsCIDAdmin,
      },
    };
    await adminOperator.update(
      adminDid,
      DIDAttribute.ServicePoint,
      updateDataAdmin,
      validity
    );

    const managerClaim = {
      claimData: {
        fields: { name: 'test52' },
        claimTypeVersion: 1,
        claimType: managerRole,
      },
      iss: adminDid,
      credentialStatus: {
        id: 'https://identitycache-dev.energyweb.org/v1/status-list/urn:uuid:4fb4e120-a566-499c-85fb-47bb5abd3d6b',
        type: StatusListEntryType.Entry2021,
        statusPurpose: CredentialStatusPurpose.REVOCATION,
        statusListIndex: '0',
        statusListCredential:
          'https://identitycache-dev.energyweb.org/v1/status-list/urn:uuid:4fb4e120-a566-499c-85fb-47bb5abd3d6b',
      },
      signer: adminDid,
    };
    const managersIssuedToken = await adminJWT.sign(managerClaim);
    const ipfsCIDManager = await didStore.save(managersIssuedToken);
    const serviceIdManager = managerRole;
    const updateDataManager: IUpdateData = {
      type: DIDAttribute.ServicePoint,
      value: {
        id: `${managerDid}#service-${serviceIdManager}`,
        type: 'ClaimStore',
        serviceEndpoint: ipfsCIDManager,
      },
    };
    await managerOperator.update(
      managerDid,
      DIDAttribute.ServicePoint,
      updateDataManager,
      validity
    );

    nock(managerClaim.credentialStatus.statusListCredential)
      .get('')
      .reply(200, adminStatusList);

    nock(adminClaim.credentialStatus.statusListCredential)
      .get('')
      .reply(200, adminStatusList);

    const userclaims: RoleEIP191JWT[] = [
      {
        payload: managerClaim,
        eip191Jwt: managersIssuedToken,
      },
    ];

    const claimverifier = new ClaimVerifier(
      userclaims,
      getAdminRoleDefinition,
      issuerVerification,
      revocationVerification,
      statusListEntryVerificaiton
    );
    const verifiedRoles = await claimverifier.getVerifiedRoles();
    assert.strictEqual(verifiedRoles.length, 0);
  });

  it('should throw, if the credential is revoked by unauthorised revoker', async () => {
    const adminJWT = new JWT(adminKeys);
    const adminClaim = {
      claimData: {
        fields: { name: 'test6' },
        claimType: adminRole,
        claimTypeVersion: 1,
      },
      iss: adminDid,
      credentialStatus: {
        id: 'https://identitycache-dev.energyweb.org/v1/status-list/urn:uuid:4fb4e120-a566-499c-85fb-47bb5abd3d6b',
        type: StatusListEntryType.Entry2021,
        statusPurpose: CredentialStatusPurpose.REVOCATION,
        statusListIndex: '0',
        statusListCredential:
          'https://identitycache-dev.energyweb.org/v1/status-list/urn:uuid:4fb4e120-a566-499c-85fb-47bb5abd3d6b',
      },
      signer: adminDid,
    };
    const token = await adminJWT.sign(adminClaim);
    const ipfsCIDAdmin = await didStore.save(token);

    const serviceIdAdmin = adminRole;
    const updateDataAdmin: IUpdateData = {
      type: DIDAttribute.ServicePoint,
      value: {
        id: `${adminDid}#service-${serviceIdAdmin}`,
        type: 'ClaimStore',
        serviceEndpoint: ipfsCIDAdmin,
      },
    };
    await adminOperator.update(
      adminDid,
      DIDAttribute.ServicePoint,
      updateDataAdmin,
      validity
    );

    const managerClaim = {
      claimData: {
        fields: { name: 'test62' },
        claimTypeVersion: 1,
        claimType: managerRole,
      },
      iss: adminDid,
      credentialStatus: {
        id: 'https://identitycache-dev.energyweb.org/v1/status-list/urn:uuid:4fb4e120-a566-499c-85fb-47bb5abd3d6b',
        type: StatusListEntryType.Entry2021,
        statusPurpose: CredentialStatusPurpose.REVOCATION,
        statusListIndex: '0',
        statusListCredential:
          'https://identitycache-dev.energyweb.org/v1/status-list/urn:uuid:4fb4e120-a566-499c-85fb-47bb5abd3d6b',
      },
      signer: adminDid,
    };
    const managersIssuedToken = await adminJWT.sign(managerClaim);
    const ipfsCIDManager = await didStore.save(managersIssuedToken);
    const serviceIdManager = managerRole;
    const updateDataManager: IUpdateData = {
      type: DIDAttribute.ServicePoint,
      value: {
        id: `${managerDid}#service-${serviceIdManager}`,
        type: 'ClaimStore',
        serviceEndpoint: ipfsCIDManager,
      },
    };
    await managerOperator.update(
      managerDid,
      DIDAttribute.ServicePoint,
      updateDataManager,
      validity
    );

    nock(managerClaim.credentialStatus.statusListCredential)
      .get('')
      .reply(204, undefined);

    nock(adminClaim.credentialStatus.statusListCredential)
      .get('')
      .reply(200, adminStatusList);

    nock(adminClaim.credentialStatus.statusListCredential)
      .get('')
      .reply(200, managerStatusList);

    const userclaims: RoleEIP191JWT[] = [
      {
        payload: managerClaim,
        eip191Jwt: managersIssuedToken,
      },
    ];

    const claimverifier = new ClaimVerifier(
      userclaims,
      getManagerRoleDefinition,
      issuerVerification,
      revocationVerification,
      statusListEntryVerificaiton
    );
    await expect(claimverifier.getVerifiedRoles())
      .to.eventually.rejectedWith(
        'Revoker did:ethr:0x539:0x0f4f2ac550a1b4e2280d04c21cea7ebd822934b5 is not authorized to revoke admin: revoker is not in DID list'
      )
      .and.be.an.instanceOf(Error);
  });

  it('should verify credential, where expiration timestamp is valid', async () => {
    const adminJWT = new JWT(adminKeys);
    const adminClaim = {
      claimData: {
        fields: { name: 'test7' },
        claimType: adminRole,
        claimTypeVersion: 1,
      },
      iss: adminDid,
      exp: Math.floor((Date.now() + 10000) / 1000),
      credentialStatus: {
        id: 'https://identitycache-dev.energyweb.org/v1/status-list/urn:uuid:4fb4e120-a566-499c-85fb-47bb5abd3d6b',
        type: StatusListEntryType.Entry2021,
        statusPurpose: CredentialStatusPurpose.REVOCATION,
        statusListIndex: '0',
        statusListCredential:
          'https://identitycache-dev.energyweb.org/v1/status-list/urn:uuid:4fb4e120-a566-499c-85fb-47bb5abd3d6b',
      },
      signer: adminDid,
    };
    const token = await adminJWT.sign(adminClaim);
    const ipfsCIDAdmin = await didStore.save(token);
    const serviceIdAdmin = adminRole;
    const updateDataAdmin: IUpdateData = {
      type: DIDAttribute.ServicePoint,
      value: {
        id: `${adminDid}#service-${serviceIdAdmin}`,
        type: 'ClaimStore',
        serviceEndpoint: ipfsCIDAdmin,
      },
    };
    await adminOperator.update(
      adminDid,
      DIDAttribute.ServicePoint,
      updateDataAdmin,
      validity
    );

    const managerClaim = {
      claimData: {
        fields: { name: 'test72' },
        claimTypeVersion: 1,
        claimType: managerRole,
      },
      iss: adminDid,
      credentialStatus: {
        id: 'https://identitycache-dev.energyweb.org/v1/status-list/urn:uuid:4fb4e120-a566-499c-85fb-47bb5abd3d6b',
        type: StatusListEntryType.Entry2021,
        statusPurpose: CredentialStatusPurpose.REVOCATION,
        statusListIndex: '0',
        statusListCredential:
          'https://identitycache-dev.energyweb.org/v1/status-list/urn:uuid:4fb4e120-a566-499c-85fb-47bb5abd3d6b',
      },
      signer: adminDid,
    };
    const managersIssuedToken = await adminJWT.sign(managerClaim);
    const ipfsCIDManager = await didStore.save(managersIssuedToken);
    const serviceIdManager = managerRole;
    const updateDataManager: IUpdateData = {
      type: DIDAttribute.ServicePoint,
      value: {
        id: `${managerDid}#service-${serviceIdManager}`,
        type: 'ClaimStore',
        serviceEndpoint: ipfsCIDManager,
      },
    };
    await managerOperator.update(
      managerDid,
      DIDAttribute.ServicePoint,
      updateDataManager,
      validity
    );
    nock(managerClaim.credentialStatus.statusListCredential)
      .get('')
      .reply(204, undefined);

    nock(adminClaim.credentialStatus.statusListCredential)
      .get('')
      .reply(204, undefined);

    const userclaims: RoleEIP191JWT[] = [
      {
        payload: managerClaim,
        eip191Jwt: managersIssuedToken,
      },
    ];

    const claimverifier = new ClaimVerifier(
      userclaims,
      getManagerRoleDefinition,
      issuerVerification,
      revocationVerification,
      statusListEntryVerificaiton
    );
    const verifiedRoles = await claimverifier.getVerifiedRoles();
    assert.strictEqual(verifiedRoles.length, 1);
  });

  it('should not verify credential, if issuers authoritative credential has expired', async () => {
    const adminJWT = new JWT(adminKeys);
    const adminClaim = {
      claimData: {
        fields: { name: 'test8' },
        claimType: adminRole,
        claimTypeVersion: 1,
      },
      iss: adminDid,
      exp: Math.floor(Date.now() / 1000),
      credentialStatus: {
        id: 'https://identitycache-dev.energyweb.org/v1/status-list/urn:uuid:4fb4e120-a566-499c-85fb-47bb5abd3d6b',
        type: StatusListEntryType.Entry2021,
        statusPurpose: CredentialStatusPurpose.REVOCATION,
        statusListIndex: '0',
        statusListCredential:
          'https://identitycache-dev.energyweb.org/v1/status-list/urn:uuid:4fb4e120-a566-499c-85fb-47bb5abd3d6b',
      },
      signer: adminDid,
    };
    const token = await adminJWT.sign(adminClaim);
    const ipfsCIDAdmin = await didStore.save(token);
    const serviceIdAdmin = adminRole;
    const updateDataAdmin: IUpdateData = {
      type: DIDAttribute.ServicePoint,
      value: {
        id: `${adminDid}#service-${serviceIdAdmin}`,
        type: 'ClaimStore',
        serviceEndpoint: ipfsCIDAdmin,
      },
    };
    await adminOperator.update(
      adminDid,
      DIDAttribute.ServicePoint,
      updateDataAdmin,
      validity
    );

    const managerClaim = {
      claimData: {
        fields: { name: 'test82' },
        claimTypeVersion: 1,
        claimType: managerRole,
      },
      iss: adminDid,
      credentialStatus: {
        id: 'https://identitycache-dev.energyweb.org/v1/status-list/urn:uuid:4fb4e120-a566-499c-85fb-47bb5abd3d6b',
        type: StatusListEntryType.Entry2021,
        statusPurpose: CredentialStatusPurpose.REVOCATION,
        statusListIndex: '0',
        statusListCredential:
          'https://identitycache-dev.energyweb.org/v1/status-list/urn:uuid:4fb4e120-a566-499c-85fb-47bb5abd3d6b',
      },
      signer: adminDid,
    };
    const managersIssuedToken = await adminJWT.sign(managerClaim);
    const ipfsCIDManager = await didStore.save(managersIssuedToken);
    const serviceIdManager = managerRole;
    const updateDataManager: IUpdateData = {
      type: DIDAttribute.ServicePoint,
      value: {
        id: `${managerDid}#service-${serviceIdManager}`,
        type: 'ClaimStore',
        serviceEndpoint: ipfsCIDManager,
      },
    };
    await managerOperator.update(
      managerDid,
      DIDAttribute.ServicePoint,
      updateDataManager,
      validity
    );

    nock(adminClaim.credentialStatus.statusListCredential)
      .get('')
      .reply(204, undefined);

    nock(adminClaim.credentialStatus.statusListCredential)
      .get('')
      .reply(204, undefined);

    const userclaims: RoleEIP191JWT[] = [
      {
        payload: managerClaim,
        eip191Jwt: managersIssuedToken,
      },
    ];

    const claimverifier = new ClaimVerifier(
      userclaims,
      getManagerRoleDefinition,
      issuerVerification,
      revocationVerification,
      statusListEntryVerificaiton
    );
    const verifiedRoles = await claimverifier.getVerifiedRoles();
    assert.strictEqual(verifiedRoles.length, 0);
  });

  const getAdminRoleDefinition = (namespace: string) => {
    const roleDef: IRoleDefinitionV2 = {
      roleName: adminRole,
      enrolmentPreconditions: [],
      requestorFields: [],
      issuerFields: [],
      issuer: {
        issuerType: 'DID',
        did: [`did:ethr:volta:${adminAddress}`],
      },
      revoker: {
        revokerType: 'DID',
        did: [`did:ethr:volta:${adminAddress}`],
      },
      metadata: [],
      roleType: '',
      version: defaultVersion,
    };
    return Promise.resolve(roleDef);
  };

  const getManagerRoleDefinition = (namespace: string) => {
    const roleDef: IRoleDefinitionV2 = {
      roleName: managerRole,
      enrolmentPreconditions: [],
      requestorFields: [],
      issuerFields: [],
      issuer: { issuerType: 'ROLE', roleName: adminRole },
      revoker: { revokerType: 'ROLE', roleName: adminRole },
      metadata: [],
      roleType: '',
      version: defaultVersion,
    };
    return Promise.resolve(roleDef);
  };
});
