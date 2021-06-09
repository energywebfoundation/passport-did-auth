import {IDIDDocument} from "@ew-did-registry/did-resolver-interface"


export const firstDocument : IDIDDocument = {
    id: 'did:ethr:0x72EFf9faB7876c4c1b6cAe426c121358431758F3',
    service: [
      {
        id: '78ad468a-d964-4ca6-b496-c7fabd526682',
        did: 'did:ethr:0x72EFf9faB7876c4c1b6cAe426c121358431758F3',
        iat: 1621600642888,
        iss: 'did:ethr:0x72EFf9faB7876c4c1b6cAe426c121358431758F3',
        sub: 'did:ethr:0x72EFf9faB7876c4c1b6cAe426c121358431758F3',
        hash: '1e8ac4cfc7a405924d146b395f03919d0fedd646371297f5e79dd7ec7397e54a',
        signer: 'did:ethr:0x72EFf9faB7876c4c1b6cAe426c121358431758F3',
        hashAlg: 'SHA256',
        profile: [Object],
        serviceEndpoint: 'QmT7d8ntKhgJb3hqCyXscYxDPdaM3asXKenYyJcxuxoxcF'
      },
      {
        id: '7ef471ed-0a37-4ba5-98f0-75eb90d64314',
        did: 'did:ethr:0x731ac21Aa72c1A6E15243AFBB34cA9CC073D419B',
        iat: 1622662901815,
        iss: 'did:ethr:0x829b91Fa3e91EA4448365ADA58C7Bad1Ff142866',
        sub: 'did:ethr:0x731ac21Aa72c1A6E15243AFBB34cA9CC073D419B',
        hash: '35405a628207f5f165d7c0ae6663d089733cea2a5233c4971d65699bbff2f45f',
        fields: [],
        signer: 'did:ethr:0x829b91Fa3e91EA4448365ADA58C7Bad1Ff142866',
        hashAlg: 'SHA256',
        claimType: 'prequalified.roles.flexmarket.apps.elia.iam.ewc',
        serviceEndpoint: 'QmTUFHwSk7RbNUK8u2bwyDNtvmtxhk83JNCc1YnJvYxghd',
        claimTypeVersion: '1.0.0'
      }
    ],
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
        publicKeyHex: '0x0355f6f95a109a1ebe2a2aaea74f49274ea55aaecd2d32a44a2002bcf63002b913'
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
    logs: '{"owner":"0x673ddFc94021Cf80dbBe24A308C467DF5bE2572D","topBlock":{"_hex":"0xb7bf91"},"authentication":{},"publicKey":{"did:ethr:0x72EFf9faB7876c4c1b6cAe426c121358431758F3#key-owner":{"id":"did:ethr:0x72EFf9faB7876c4c1b6cAe426c121358431758F3#key-owner","type":"Secp256k1veriKey","controller":"0x72EFf9faB7876c4c1b6cAe426c121358431758F3","validity":{"_hex":"0x20000060bdd380"},"block":12042129,"publicKeyHex":"0x0355f6f95a109a1ebe2a2aaea74f49274ea55aaecd2d32a44a2002bcf63002b913"},"did:ethr:0x731ac21Aa72c1A6E15243AFBB34cA9CC073D419B#key-owner":{"id":"did:ethr:0x731ac21Aa72c1A6E15243AFBB34cA9CC073D419B#key-owner","type":"Secp256k1veriKey","controller":"0x731ac21Aa72c1A6E15243AFBB34cA9CC073D419B","validity":{"_hex":"0x60c0f6b0"},"block":11994739,"publicKeyHex":"0x037cff69ef821172f5df74d3f9406679cc27aba2d96438211538deeb325c9d434d"}},"service":{"78ad468a-d964-4ca6-b496-c7fabd526682":{"id":"78ad468a-d964-4ca6-b496-c7fabd526682","serviceEndpoint":"QmT7d8ntKhgJb3hqCyXscYxDPdaM3asXKenYyJcxuxoxcF","hash":"1e8ac4cfc7a405924d146b395f03919d0fedd646371297f5e79dd7ec7397e54a","hashAlg":"SHA256","validity":{"_hex":"0x20000060a7a993"},"block":11854770},"7ef471ed-0a37-4ba5-98f0-75eb90d64314":{"id":"7ef471ed-0a37-4ba5-98f0-75eb90d64314","serviceEndpoint":"QmTUFHwSk7RbNUK8u2bwyDNtvmtxhk83JNCc1YnJvYxghd","hash":"35405a628207f5f165d7c0ae6663d089733cea2a5233c4971d65699bbff2f45f","hashAlg":"SHA256","validity":{"_hex":"0x20000060b7df70"},"block":11995273}},"attributes":{}}'
}

export const secondDocument : IDIDDocument = {
  id: 'did:ethr:0x0E46cbecF1742DdEb29BBC56F27ad236483443b7',
  service: [
    {
      id: '5438d8c8-03b0-412a-a1e1-ca270161f666',
      did: 'did:ethr:0x0E46cbecF1742DdEb29BBC56F27ad236483443b7',
      iat: 1621599093771,
      iss: 'did:ethr:0x0E46cbecF1742DdEb29BBC56F27ad236483443b7',
      sub: 'did:ethr:0x0E46cbecF1742DdEb29BBC56F27ad236483443b7',
      hash: '32f87a05f4a935397d1f68cda1e1936855b7bb719f63f33b8446f112c6a3bd63',
      signer: 'did:ethr:0x0E46cbecF1742DdEb29BBC56F27ad236483443b7',
      hashAlg: 'SHA256',
      profile: [Object],
      serviceEndpoint: 'QmQefkgmLYR86yyQwwGWzVHmUNSB4EzdochTyyySKKSgEC'
    }
  ],
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
      publicKeyHex: '0x0312c03a2ff680b9ab94a46d9f52b0cb934f15365f96dd3eae75661b0756318fd3'
    }
  ],
  updated: null,
  '@context': 'https://www.w3.org/ns/did/v1',
  logs: '{"owner":"0x0000000000000000000000000000000000000000","topBlock":{"_hex":"0xb0e89e"},"authentication":{},"publicKey":{"did:ethr:0xA533557F26477b1fA7BFa76E6eD5467D9Bc9d633#809ea74d-50c8-451b-a7ce-2fe37b724e0d":{"id":"did:ethr:0xA533557F26477b1fA7BFa76E6eD5467D9Bc9d633#809ea74d-50c8-451b-a7ce-2fe37b724e0d","type":"Secp256k1sigAuth","controller":"0xA533557F26477b1fA7BFa76E6eD5467D9Bc9d633","validity":{"_hex":"0x20000060b11c26"},"block":11945221,"publicKeyHex":"mynewkey"},"did:ethr:0x0E46cbecF1742DdEb29BBC56F27ad236483443b7#key-owner":{"id":"did:ethr:0x0E46cbecF1742DdEb29BBC56F27ad236483443b7#key-owner","type":"Secp256k1veriKey","controller":"0x0E46cbecF1742DdEb29BBC56F27ad236483443b7","validity":{"_hex":"0x20000060b2a7c6"},"block":11956465,"publicKeyHex":"0x0312c03a2ff680b9ab94a46d9f52b0cb934f15365f96dd3eae75661b0756318fd3"}},"service":{"5438d8c8-03b0-412a-a1e1-ca270161f666":{"id":"5438d8c8-03b0-412a-a1e1-ca270161f666","serviceEndpoint":"QmQefkgmLYR86yyQwwGWzVHmUNSB4EzdochTyyySKKSgEC","hash":"32f87a05f4a935397d1f68cda1e1936855b7bb719f63f33b8446f112c6a3bd63","hashAlg":"SHA256","validity":{"_hex":"0x20000060a7a38a"},"block":11854514}},"attributes":{}}'
}