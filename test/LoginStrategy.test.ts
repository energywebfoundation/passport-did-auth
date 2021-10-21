import {
    providers,
} from "ethers";

import { getServer } from './testUtils/server';
import { preparePassport } from './testUtils/preparePassport';

import {
    setChainConfig,
    IAM,
    DIDAttribute,
    Algorithms,
    Encoding,
    PubKeyType,
} from 'iam-client-lib';

import request from 'supertest';

import { JWT } from "@ew-did-registry/jwt";
import { Keys } from "@ew-did-registry/keys";

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
} from "./setup_contracts";
import { assert } from "chai";

const GANACHE_PORT = 8544;
const rpcUrl = `http://localhost:${GANACHE_PORT}`;

const provider = new providers.JsonRpcProvider(rpcUrl);

// funded private key for 0x627306090abaB3A6e1400e9345bC60c78a8BEf57
// ganache with "candy maple cake sugar pudding cream honey rich smooth crumble sweet treat" mnemonic
const userPrivKey = '0xc87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3';
const userAddress = '0x627306090abaB3A6e1400e9345bC60c78a8BEf57';
const userDid = `did:ethr:${userAddress}`;

const secondPrivKey = 'ae6ae8e5ccbfb04590405997ee2d52d2b330726137b875053c36d94e974d162f';
const secondAddress = '0xf17f52151EbEF6C7334FAD080c5704D77216b732';
const seconDid = `did:ethr:${secondAddress}`

jest.setTimeout(84000);

let iam: IAM;
let secondIam: IAM

beforeAll(async () => {
    await deployDidRegistry();
    await deployEns();
    await deployClaimManager();
    await deployIdentityManager();

    const { chainId } = await provider.getNetwork();
    setChainConfig(chainId, {
        rpcUrl,
        didContractAddress: didContract.address,
        ensRegistryAddress: ensRegistry.address,
        ensResolverAddress: ensResolver.address,
        assetManagerAddress: assetsManager.address,
        claimManagerAddress: claimManager.address,
        domainNotifierAddress: domainNotifer.address
    });
    iam = new IAM({privateKey: userPrivKey, rpcUrl});
    await iam.initializeConnection({initCacheServer: false})
})

it('Verifies asset authentication',  async () => {
    // Register an asset
    const assetAddress = await iam.registerAsset();
    assert.exists(assetAddress);

    // Create a key
    const assetKeys = new Keys();

    // Add new key to asset's DID Document
    const assetDid = `did:ethr:${assetAddress}`;
    const isDIdDocUpdated = await iam.updateDidDocument({
        didAttribute: DIDAttribute.PublicKey,
        did: assetDid,
        data: {
            algo: Algorithms.Secp256k1,
            encoding: Encoding.HEX,
            type: PubKeyType.SignatureAuthentication2018,
            value: { tag: "key-1", publicKey: `0x${assetKeys.publicKey}` },
        },
    });
    assert.isTrue(isDIdDocUpdated, "The asset has not been added to document");
    
    const token = await iam.createDelegateProof(
        assetKeys.privateKey,
        rpcUrl,
        assetDid
    );
    const identityToken = token;
    const server = getServer(didContract.address);
    const connection = server.listen(4242, () => {
        console.log("Test Server is ready and listening on port 4242");
      });
    const response = await request(server).post('/login').send({identityToken})
    expect(response.statusCode).toBe(200);
    expect(response.body.token).toBeDefined;
    connection.close()
});

it("Should authenticate issuer signature", async () => {
    const { loginStrategy } = preparePassport(didContract.address);
    const token = await iam.createIdentityProof();
    const payload = {
        iss: userDid,
        claimData: {
            blockNumber: 4242,
        },
        sub: '',
    }
    
    await loginStrategy.validate(token, payload, (err, user) => {
        const jwt = new JWT(new Keys({privateKey: userPrivKey}));
        const decodedIdentity = jwt.decode(token) as { [key: string]: string | object; };
        const decodedVerifiedUser = jwt.decode(user) as { [key: string]: string | object; }
        expect(decodedVerifiedUser.did).toBe(decodedIdentity.did);
    });
});

it("Should reject invalid issuer", async () => {
    const { loginStrategy } = preparePassport(didContract.address);
    const token = await iam.createIdentityProof();
    const payload = {
        iss: seconDid,
        claimData: {
            blockNumber: 4242,
        },
        sub: '',
    }
    
    const consoleListenner = jest.spyOn(console, 'log')
    await loginStrategy.validate(token, payload, () => {
        expect(consoleListenner).toBeCalledWith('Not Verified')
    });
});

it("Should reject invalid token", async () => {
    secondIam = new IAM({privateKey: secondPrivKey, rpcUrl});
    await secondIam.initializeConnection({initCacheServer: false});
    const { loginStrategy } = preparePassport(didContract.address);
    const token = await secondIam.createIdentityProof();
    const payload = {
        iss: userDid,
        claimData: {
            blockNumber: 4242,
        },
        sub: '',
    }
    
    const consoleListenner = jest.spyOn(console, 'log')
    await loginStrategy.validate(token, payload, () => {
        expect(consoleListenner).toBeCalledWith('Not Verified')
    });
});

