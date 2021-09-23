import {
    utils,
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
import { LoginStrategy, LoginStrategyOptions } from "../lib/LoginStrategy";
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
    // setCacheClientOptions(chainId, { url: "" });
    iam = new IAM({privateKey: userPrivKey, rpcUrl});
    await iam.initializeConnection({initCacheServer: false})
})

it('Can Log in',  async () => {
    // TODO: instead of createIdentityProof (or need another test)
    // Create an asset , ....

    const assetAddress = await iam.registerAsset();
    assert.exists(assetAddress);
    console.log("Asset created at address ", assetAddress);

    //create a key
    const assetKeys = new Keys();
    console.log("Asset pubkey", assetKeys.publicKey);
    console.log("Before update DidDoc: ", await iam.getDidDocument())

    //add to asset
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
    
    //create IdentityProofWithDelegate

    const {token , } = await createIdentityProofWithDelegate(
        assetKeys.privateKey,
        rpcUrl,
        assetDid
        );
        const identityToken = token;
        console.log("IdentityToken >> ", identityToken);

    await request(getServer(didContract.address))
        .post('/login')
        .send({identityToken})
        .expect(200)
        // TODO: expect jwt token
        // TODO: ensure that test ends afterwards
});