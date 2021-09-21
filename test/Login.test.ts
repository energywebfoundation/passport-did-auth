import {
    Wallet,
    Contract,
    providers,
    ContractFactory,
} from "ethers";

import { getServer } from './testUtils/server';

import {
    abi as didContractAbi,
    bytecode as didContractBytecode,
} from "./testUtils/ERC1056.json";

import {
    setChainConfig,
    IAM,
} from 'iam-client-lib';

import request from 'supertest';

import { JWT } from "@ew-did-registry/jwt";
import { LoginStrategy, LoginStrategyOptions } from "../lib/LoginStrategy";
import { LOGIN_STRATEGY, private_pem_secret } from "./testUtils/preparePassport";
import { assetsManager, claimManager, deployClaimManager, deployDidRegistry, deployEns, deployIdentityManager, didContract, domainNotifer, ensRegistry, ensResolver } from "./setup_contracts";

const GANACHE_PORT = 8544;
const rpcUrl = `http://localhost:${GANACHE_PORT}`;

const provider = new providers.JsonRpcProvider(rpcUrl);
const deployer = provider.getSigner(0);

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
jest.setTimeout(600000);

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
    // const userAddress = new Wallet(userPrivKey).address;
    // const did = `did:ethr:${userAddress}`;
    // const identityToken = await createIdentityProofWithDelegate(userPrivKey, rpcUrl, did);
    // const idendity = {
    //     token: "eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiIiLCJjbGFpbURhdGEiOnsiYmxvY2tOdW1iZXIiOjMyMTM5fSwic3ViIjoiIiwiaWF0IjoxNjMyMTUxNzAyMTUzfQ.MHg0MjMwZjdlZTcwOGQ2MzA3Yjk3ZWJkN2RhNGNkN2QzM2QyNjI1ZjM0MGUyNzhmODY1NGUwMDc1MTBjY2RiYTVjMWFhNWJlMGQ1NGI1YWViNWNmOGUwZWI4ZDg5YmNjNmI4MTAzYmFiZjdlOTJlMDQzNjhjMWEzYTMxYTNkMDY2YjFj",
    //     payload: {
    //         iss: 'did:ethr:0xC5fdf4076b8F3A5357c5E395ab970B5B54098Fef',
    //         claimData: { blockNumber: 32139 },
    //         sub: 'did:ethr:0xC5fdf4076b8F3A5357c5E395ab970B5B54098Fef',
    //         iat: 1632151702153
    //       },
    // }
    const identityToken = await iam.createIdentityProof();
    // const loginStrategyOptions : LoginStrategyOptions = {
    //     jwtSecret: private_pem_secret,
    //     name: LOGIN_STRATEGY,
    //     rpcUrl: `http://localhost:8544`,
    //     didContractAddress: didContract.address
    // }
    // const loginStrategy = new LoginStrategy(loginStrategyOptions)
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    //await loginStrategy.validate(identityToken.token, identityToken.payload, ()=>{})

    await request(getServer(didContract.address))
        .post('/login')
        .send({identityToken})
        .expect(200);
});