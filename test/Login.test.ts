import {
    Wallet,
    Contract,
    providers,
    ContractFactory,
} from "ethers";

import request from 'supertest';

import {
    abi as didContractAbi,
    bytecode as didContractBytecode,
} from "./testUtils/ERC1056.json";

import {
    setChainConfig,
    setCacheClientOptions,
} from 'iam-client-lib';

import express from 'express';
import passport from 'passport';
import { LoginStrategy, LoginStrategyOptions } from '../lib/LoginStrategy';

import dotenv from 'dotenv';
import { JWT } from "@ew-did-registry/jwt";

dotenv.config()

let didContract: Contract;

const GANACHE_PORT = 8544;
const rpcUrl = `http://localhost:${GANACHE_PORT}`;
const server = express();

const provider = new providers.JsonRpcProvider(rpcUrl);
const deployer = provider.getSigner(0);
const userPrivKey = 'c87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3';

const deployDidRegistry = async (): Promise<void> => {
    const didContractFactory = new ContractFactory(didContractAbi, didContractBytecode, deployer);
    didContract = await didContractFactory.deploy();
};

const loginStrategyOptions : LoginStrategyOptions = {
    jwtSecret: process.env.PRIVATE_PEM,
    jwtSignOptions: {
      algorithm: 'RS256',
    },
    name: 'login',
    rpcUrl: process.env.RPC_URL || 'https://volta-rpc.energyweb.org/',
    cacheServerUrl: process.env.CACHE_SERVER_URL || 'https://identitycache-dev.energyweb.org/',
    acceptedRoles: process.env.ACCEPTED_ROLES ? process.env.ACCEPTED_ROLES.split(',') : [],
    privateKey: 'eab5e5ccb983fad7bf7f5cb6b475a7aea95eff0c6523291b0c0ae38b5855459c',
  }

const createIdentityProofWithDelegate = async (secp256k1PrivateKey: string, rpcUrl: string, identityProofDid: string): Promise<string> => {
    const provider = new providers.JsonRpcProvider(rpcUrl);
    const wallet = new Wallet(secp256k1PrivateKey, provider);

    const blockNumber = (await provider.getBlockNumber()).toString();

    const payload: { iss: string; claimData: { blockNumber: string } } = {
        iss: identityProofDid,
        claimData: {
            blockNumber,
        },
    };
    const jwt = new JWT(wallet);
    const identityToken = jwt.sign(payload);
    return identityToken;
}

beforeAll(async () => {
    await deployDidRegistry();
    const { chainId } = await provider.getNetwork();

    setChainConfig(chainId, {
        rpcUrl,
        didContractAddress: didContract.address,
    });
    setCacheClientOptions(chainId, { url: "" });
})

test('Basic login', async () => {
    const userAddress = new Wallet(userPrivKey).address;
    const did = `did:ethr:${userAddress}`;
    const idendityToken = await createIdentityProofWithDelegate(userPrivKey, rpcUrl, did);
    console.log("token >> ", idendityToken);
    request(server).post('/login', idendityToken).expect(400);
    const loginStrategy = new LoginStrategy(loginStrategyOptions);
    
    passport.authenticate(loginStrategy, (req, res) => {
        console.log("Authentication: ", req.user);
    })

})
