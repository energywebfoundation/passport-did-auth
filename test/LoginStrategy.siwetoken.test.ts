import { providers } from 'ethers';
import { preparePassport } from './testUtils/preparePassport';
import {
  setChainConfig,
  initWithPrivateKeySigner,
  ClaimsService,
  AssetsService,
  DidRegistry,
  setCacheConfig,
} from 'iam-client-lib';
import ServerMock from 'mock-http-server';
import { JWT } from '@ew-did-registry/jwt';
import { Keys } from '@ew-did-registry/keys';

import {
  assetsManager,
  claimManager,
  deployClaimManager,
  deployDidRegistry,
  deployEns,
  deployIdentityManager,
  didContract,
  domainNotifer,
  ensRegistry,
  ensResolver,
} from './setup_contracts';
import { RoleEIP191JWT } from '@energyweb/vc-verification';
import { Chain } from '@ew-did-registry/did';
import { ISiweMessagePayload } from '../lib/LoginStrategy.types';
import { addressOf } from '@ew-did-registry/did-ethr-resolver';

const GANACHE_PORT = 8544;
const rpcUrl = `http://localhost:${GANACHE_PORT}`;

const provider = new providers.JsonRpcProvider(rpcUrl);

// funded private key for 0x627306090abaB3A6e1400e9345bC60c78a8BEf57
// ganache with "candy maple cake sugar pudding cream honey rich smooth crumble sweet treat" mnemonic
const userPrivKey =
  '0xc87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3';
const userAddress = '0x627306090abaB3A6e1400e9345bC60c78a8BEf57';
const userDid = `did:ethr:volta:${userAddress}`;

const secondPrivKey =
  'ae6ae8e5ccbfb04590405997ee2d52d2b330726137b875053c36d94e974d162f';
const secondAddress = '0xf17f52151EbEF6C7334FAD080c5704D77216b732';
const secondDid = `did:ethr:volta:${secondAddress}`;

jest.setTimeout(84000);

interface IAM {
  claimsService?: ClaimsService;
  assetService?: AssetsService;
  didRegistry?: DidRegistry;
}

const iam: IAM = {};

const sampleSiwePayload: ISiweMessagePayload = {
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

const token =
  '0xdc35c7f8ba2720df052e0092556456127f00f7707eaa8e3bbff7e56774e7f2e05a093cfc9e02964c33d86e8e066e221b7d153d27e5a2e97ccd5ca7d3f2ce06cb1b';

const server = new ServerMock(
  { host: 'localhost', port: 9000 },
  { host: 'localhost', port: 9001 }
);
const asyncStart = () => new Promise((resolve) => server.start(resolve));
const asyncStop = () => new Promise((resolve) => server.stop(resolve));

let getOwnedAssets: jest.SpyInstance;

beforeAll(async () => {
  await deployDidRegistry();
  await deployEns();
  await deployClaimManager();
  await deployIdentityManager();

  await asyncStart();

  server.on({
    method: 'POST',
    path: '/login',
    reply: {
      status: 200,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ hello: 'world' }),
    },
  });

  const { chainId } = await provider.getNetwork();
  setChainConfig(chainId, {
    rpcUrl,
    chainName: Chain.VOLTA,
    didRegistryAddress: didContract.address,
    ensRegistryAddress: ensRegistry.address,
    ensResolverAddress: ensResolver.address,
    assetManagerAddress: assetsManager.address,
    claimManagerAddress: claimManager.address,
    domainNotifierAddress: domainNotifer.address,
    ensPublicResolverAddress: ensResolver.address,
    stakingPoolFactoryAddress: ensRegistry.address,
  });

  setCacheConfig(chainId, {
    url: 'http://localhost:9000/',
    cacheServerSupportsAuth: false,
  });

  const { connectToCacheServer } = await initWithPrivateKeySigner(
    userPrivKey,
    rpcUrl
  );
  const { connectToDidRegistry, assetsService } = await connectToCacheServer();

  const { claimsService, didRegistry } = await connectToDidRegistry();
  iam.claimsService = claimsService;
  iam.assetService = assetsService;
  iam.didRegistry = didRegistry;

  jest
    .spyOn(iam.assetService, 'getAssetById')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .mockResolvedValue(undefined as any);
  getOwnedAssets = jest.spyOn(iam.assetService, 'getOwnedAssets');
});

afterAll(async () => {
  await asyncStop();
});

it('Should authenticate issuer signature with Siwe', async () => {
  const { loginStrategy } = preparePassport(
    provider,
    ensResolver.address,
    didContract.address,
    ensRegistry.address
  );
  expect(token).toBeTruthy();

  await loginStrategy?.validate(token, sampleSiwePayload, (_, user) => {
    const jwt = new JWT(new Keys({ privateKey: userPrivKey }));
    const decodedVerifiedUser = jwt.decode(user as string) as {
      [key: string]: string | object;
    };
    expect(addressOf(decodedVerifiedUser.did as string)).toBe(
      sampleSiwePayload.address
    );
  });
});

it('Should reject invalid issuer', async () => {
  const { loginStrategy } = preparePassport(
    provider,
    ensResolver.address,
    didContract.address,
    ensRegistry.address
  );
  const siwePayloadWithDifferentUser = { ...sampleSiwePayload };
  siwePayloadWithDifferentUser.address =
    '0x627306090abaB3A6e1400e9345bC60c78a8BEf57';
  expect(token).toBeTruthy();

  await loginStrategy?.validate(token, siwePayloadWithDifferentUser, (err) => {
    expect(err.message).toEqual(
      'Signature does not match address of the message.'
    );
  });
});

it('Should reject invalid token', async () => {
  const { loginStrategy } = preparePassport(
    provider,
    ensResolver.address,
    didContract.address,
    ensRegistry.address
  );
  const wrongToken =
    '0xc2539ace78f13c7eb8c0852d38d269a6f97bebd9f7872097d2e3137b541f8bf50176062a46eeea83086bd2721423fb5755a932ff6ccc046ed482d14e4576042f1c';

  await loginStrategy?.validate(wrongToken, sampleSiwePayload, (err) => {
    expect(err.message).toEqual(
      'Signature does not match address of the message.'
    );
  });
});

it('Should reject invalid token payload', async () => {
  const { loginStrategy } = preparePassport(
    provider,
    ensResolver.address,
    didContract.address,
    ensRegistry.address
  );
  const wrongPayload = { ...sampleSiwePayload };
  delete wrongPayload.nonce;
  const consoleListener = jest.spyOn(console, 'log');
  await loginStrategy?.validate(token, wrongPayload, (err) => {
    expect(consoleListener).toBeCalledWith('Token payload is not valid');
  });
  const delay = (ms) => new Promise((res) => setTimeout(res, ms));
  await delay(10000);
});

it('Should not validate issuer if no accepted roles found', async () => {
  const { loginStrategy } = preparePassport(
    provider,
    ensResolver.address,
    didContract.address,
    ensRegistry.address,
    false,
    ['test']
  );

  expect(token).toBeTruthy();
  console.log(sampleSiwePayload);
  await loginStrategy?.validate(token, sampleSiwePayload, (_, user, err) => {
    const jwt = new JWT(new Keys({ privateKey: userPrivKey }));
    expect(err).toEqual('User does not have any roles.');
  });
});

it('Should validate user with no roles if no accepted roles defined', async () => {
  const { loginStrategy } = preparePassport(
    provider,
    ensResolver.address,
    didContract.address,
    ensRegistry.address,
    false
  );
  expect(token).toBeTruthy();

  await loginStrategy?.validate(token, sampleSiwePayload, (err, user) => {
    expect(err).toBe(undefined);
    expect(user);
  });
});

it('Should verify only accepted roles if includeAllRoles is false', async () => {
  const claim1: RoleEIP191JWT = {
    payload: {
      did: 'did:ethr:volta:0x0000000000000000000000000000000000000001',
      signer: 'did:ethr:volta:0x0000000000000000000000000000000000000001',
      claimData: {
        claimType: 'test',
        claimTypeVersion: 1,
      },
      iss: 'did:ethr:volta:0x0000000000000000000000000000000000000001',
    },
    eip191Jwt: 'skdjnskdjflksdjlkajsdlkajs',
  };
  const claim2: RoleEIP191JWT = {
    payload: {
      did: 'did:ethr:volta:0x0000000000000000000000000000000000000001',
      signer: 'did:ethr:volta:0x0000000000000000000000000000000000000001',
      claimData: {
        claimType: 'test2',
        claimTypeVersion: 1,
      },
      iss: 'did:ethr:volta:0x0000000000000000000000000000000000000001',
    },
    eip191Jwt: 'skdjnskdjflksdjlkajsdlkajs',
  };
  const { loginStrategy } = preparePassport(
    provider,
    ensResolver.address,
    didContract.address,
    ensRegistry.address,
    false,
    ['test']
  );
  expect(token).toBeTruthy();

  jest
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .spyOn((loginStrategy as any).credentialResolver, 'eip191JwtsOf')
    .mockResolvedValueOnce([claim1, claim2]);

  const consoleListener = jest.spyOn(console, 'log');
  await loginStrategy?.validate(token, sampleSiwePayload, () => {
    expect(consoleListener).toBeCalledWith(
      'includeAllRoles: false, verifying only accepted roles'
    );
  });
});

it('Should verify all role claims if includeAllRoles is true', async () => {
  const claim1: RoleEIP191JWT = {
    payload: {
      did: 'did:ethr:volta:0x0000000000000000000000000000000000000001',
      signer: 'did:ethr:volta:0x0000000000000000000000000000000000000001',
      claimData: {
        claimType: 'test',
        claimTypeVersion: 1,
      },
      iss: 'did:ethr:volta:0x0000000000000000000000000000000000000001',
    },
    eip191Jwt: 'skdjnskdjflksdjlkajsdlkajs',
  };
  const claim2: RoleEIP191JWT = {
    payload: {
      did: 'did:ethr:volta:0x0000000000000000000000000000000000000001',
      signer: 'did:ethr:volta:0x0000000000000000000000000000000000000001',
      claimData: {
        claimType: 'test2',
        claimTypeVersion: 1,
      },
      iss: 'did:ethr:volta:0x0000000000000000000000000000000000000001',
    },
    eip191Jwt: 'skdjnskdjflksdjlkajsdlkajs',
  };
  const { loginStrategy } = preparePassport(
    provider,
    ensResolver.address,
    didContract.address,
    ensRegistry.address,
    true,
    ['test']
  );
  expect(token).toBeTruthy();

  jest
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .spyOn((loginStrategy as any).credentialResolver, 'eip191JwtsOf')
    .mockResolvedValueOnce([claim1, claim2]);

  const consoleListener = jest.spyOn(console, 'log');
  await loginStrategy?.validate(token, sampleSiwePayload, () => {
    expect(consoleListener).toBeCalledWith(
      'includeAllRoles: true, verifying all roles'
    );
  });
});

it('Should reject invalid payload', async () => {
  const { loginStrategy } = preparePassport(
    provider,
    ensResolver.address,
    didContract.address,
    ensRegistry.address
  );

  const results = [
    loginStrategy.isSiweMessagePayload({}), // Empty payload,
    loginStrategy.isSiweMessagePayload(''), // String instead of object,
    loginStrategy.isSiweMessagePayload(function () {
      return true;
    }), // Function instead of object,
    loginStrategy.isSiweMessagePayload({
      domain: 'energyweb.org',
    }), // missing attributes,
    loginStrategy.isSiweMessagePayload({
      domain: 'energyweb.org',
      nonce: 'kjasndkjah8323',
    }), // missing attributes,
    loginStrategy.isSiweMessagePayload({
      domain: 1,
      address: '0x9D85ca56217D2bb651b00f15e694EB7E713637D4',
      statement: 'Sign-In With Ethereum Example Statement',
      uri: 'https://login.xyz',
      version: '1',
      nonce: 'bTyXgcQxn2htgkjJn',
      issuedAt: '2022-01-27T17:09:38.578Z',
      chainId: 1,
      expirationTime: '2100-01-07T14:31:43.952Z',
    }), // wrong type,
  ];

  expect(results.every((x) => !x)).toBeTruthy();
});
