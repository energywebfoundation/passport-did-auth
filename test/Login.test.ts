import {
    Wallet,
    providers,
} from "ethers";

import { getServer } from './testUtils/server';

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
import { LOGIN_STRATEGY, private_pem_secret } from "./testUtils/preparePassport";
import { assetsManager, claimManager, deployClaimManager, deployDidRegistry, deployEns, deployIdentityManager, didContract, domainNotifer, ensRegistry, ensResolver } from "./setup_contracts";
import { assert } from "chai";

const GANACHE_PORT = 8544;
const rpcUrl = `http://localhost:${GANACHE_PORT}`;

const provider = new providers.JsonRpcProvider(rpcUrl);

// funded private key for 0x627306090abaB3A6e1400e9345bC60c78a8BEf57
// ganache with "candy maple cake sugar pudding cream honey rich smooth crumble sweet treat" mnemonic
const userPrivKey = '0xc87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3';

export const createIdentityProofWithDelegate = async (secp256k1PrivateKey: string, rpcUrl: string, identityProofDid: string) => {
    const provider = new providers.JsonRpcProvider(rpcUrl);
    const wallet = new Wallet(secp256k1PrivateKey, provider);

    const blockNumber = (await provider.getBlockNumber());

    const payload = {
        claimData: {
            blockNumber,
        },
    };
    const jwt = new JWT(wallet);
    const identityToken = await jwt.sign(payload, { issuer: identityProofDid, subject: identityProofDid });
    return { 
        token: identityToken,
        payload: payload
    };
}
jest.setTimeout(84000);

let iam: IAM;

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

it('Can Log in',  async () => {
    // Register an asset
    const assetAddress = await iam.registerAsset();
    assert.exists(assetAddress);
    console.log("Asset created at address ", assetAddress);

    // Create a key
    const assetKeys = new Keys();
    console.log("Asset pubkey", assetKeys.publicKey);
    console.log("Before update DidDoc: ", await iam.getDidDocument())

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
    console.log("After update DidDoc: ", await iam.getDidDocument());
    
    // TODO: replace with static function in iam-client-lib
    const {token , } = await createIdentityProofWithDelegate(
        assetKeys.privateKey,
        rpcUrl,
        assetDid
    );
    const identityToken = token;
    console.log("IdentityToken >> ", identityToken);

    const server = getServer(didContract.address);
    const connection = server.listen(3333, () => {
        console.log("App is ready and listening on port 3333");
      });
    const response = await request(server).post('/login').send({identityToken})
    expect(response.statusCode).toBe(200);
    expect(response.body.token).toBeDefined;
    connection.close()
});