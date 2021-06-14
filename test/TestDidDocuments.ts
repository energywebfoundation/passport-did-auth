import { Keys } from '@ew-did-registry/keys'
import {IDIDDocument} from "@ew-did-registry/did-resolver-interface"

export const firstKeys = new Keys();
export const secondKeys = new Keys();

export const firstDocument : IDIDDocument = {
    id: 'did:ethr:0x72EFf9faB7876c4c1b6cAe426c121358431758F3',
    authentication: [
      {
        type: 'owner',
        validity: [Object],
        publicKey: 'did:ethr:0x72EFf9faB7876c4c1b6cAe426c121358431758F3#owner'
      }
    ],
    created: null,
    delegates: null,
    proof: null,
    publicKey: [
      {
        id: 'did:ethr:0x72EFf9faB7876c4c1b6cAe426c121358431758F3#key-owner',
        type: 'Secp256k1veriKey',
        controller: '0x72EFf9faB7876c4c1b6cAe426c121358431758F3',
        publicKeyHex: '0x' + firstKeys.publicKey
      },
      {
        id: 'did:ethr:0x731ac21Aa72c1A6E15243AFBB34cA9CC073D419B#key-owner',
        type: 'Secp256k1veriKey',
        controller: '0x731ac21Aa72c1A6E15243AFBB34cA9CC073D419B',
        publicKeyHex: '0x037cff69ef821172f5df74d3f9406679cc27aba2d96438211538deeb325c9d434d'
      }
    ],
    updated: null,
    '@context': 'https://www.w3.org/ns/did/v1',
}

export const secondDocument : IDIDDocument = {
  id: 'did:ethr:0x0E46cbecF1742DdEb29BBC56F27ad236483443b7',
  authentication: [
    {
      type: 'owner',
      validity: [Object],
      publicKey: 'did:ethr:0x0E46cbecF1742DdEb29BBC56F27ad236483443b7#owner'
    }
  ],
  created: null,
  delegates: null,
  proof: null,
  publicKey: [
    {
      id: 'did:ethr:0xA533557F26477b1fA7BFa76E6eD5467D9Bc9d633#809ea74d-50c8-451b-a7ce-2fe37b724e0d',
      type: 'Secp256k1sigAuth',
      controller: '0xA533557F26477b1fA7BFa76E6eD5467D9Bc9d633',
      publicKeyHex: 'mynewkey'
    },
    {
      id: 'did:ethr:0x0E46cbecF1742DdEb29BBC56F27ad236483443b7#key-owner',
      type: 'Secp256k1veriKey',
      controller: '0x0E46cbecF1742DdEb29BBC56F27ad236483443b7',
      publicKeyHex: '0x' + secondKeys.publicKey
    }
  ],
  updated: null,
  '@context': 'https://www.w3.org/ns/did/v1',
}

export const emptyAuthenticationDocument : IDIDDocument = {
  id: 'did:ethr:0x0E46cbecF1742DdEb29BBC56F27ad236483443b7',
  authentication: [],
  created: null,
  delegates: null,
  proof: null,
  publicKey: [
    {
      id: 'did:ethr:0xA533557F26477b1fA7BFa76E6eD5467D9Bc9d633#809ea74d-50c8-451b-a7ce-2fe37b724e0d',
      type: 'Secp256k1sigAuth',
      controller: '0xA533557F26477b1fA7BFa76E6eD5467D9Bc9d633',
      publicKeyHex: '0x' + secondKeys.publicKey
    }
  ],
  updated: null,
  '@context': 'https://www.w3.org/ns/did/v1',
}