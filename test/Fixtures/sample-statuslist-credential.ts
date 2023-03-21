import {
  CredentialStatusPurpose,
  CredentialStatusType,
  CredentialType,
  StatusList2021Context,
  StatusList2021Credential,
} from '@ew-did-registry/credentials-interface';

export const adminStatusList: StatusList2021Credential = {
  '@context': ['https://www.w3.org/2018/credentials/v1', StatusList2021Context],
  id: 'https://identitycache.org/v1/status-list/urn:uuid:d91ec13f-8088-4645-9815-f491962b8324',
  type: [
    CredentialType.VerifiableCredential,
    CredentialType.StatusList2021Credential,
  ],
  credentialSubject: {
    id: 'https://identitycache.org/v1/status-list/urn:uuid:d91ec13f-8088-4645-9815-f491962b8324',
    type: CredentialStatusType.StatusList2021,
    statusPurpose: CredentialStatusPurpose.REVOCATION,
    encodedList: 'H4sIAAAAAAAAA2MEABvfBaUBAAAA',
  },
  issuer: 'did:ethr:0x539:0x0d1d4e623d10f9fba5db95830f7d3839406c6af2',
  issuanceDate: '2022-06-24T08:12:48.170Z',
  proof: {
    '@context': 'https://w3id.org/security/suites/eip712sig-2021/v1',
    type: 'EthereumEip712Signature2021',
    proofPurpose: 'assertionMethod',
    proofValue:
      '0x5d8dff7daab17bc992aa7dbe822227166d75fc9b11cb6c9183f6ec7b155dc16410237da53413a87662bea2b37d01fb1b7c63871313cdb6e3179b113b935a4d181c',
    verificationMethod:
      'did:ethr:0x539:0x0d1d4e623d10f9fba5db95830f7d3839406c6af2#controller',
    created: '2022-06-24T08:12:48.170Z',
    eip712Domain: {
      domain: {},
      messageSchema: {
        EIP712Domain: [],
        Proof: [
          { name: '@context', type: 'string' },
          { name: 'verificationMethod', type: 'string' },
          { name: 'created', type: 'string' },
          { name: 'proofPurpose', type: 'string' },
          { name: 'type', type: 'string' },
        ],
        StatusList2021: [
          { name: 'id', type: 'string' },
          { name: 'type', type: 'string' },
          { name: 'statusPurpose', type: 'string' },
          { name: 'encodedList', type: 'string' },
        ],
        VerifiableCredential: [
          { name: '@context', type: 'string[]' },
          { name: 'id', type: 'string' },
          { name: 'type', type: 'string[]' },
          { name: 'issuer', type: 'string' },
          { name: 'issuanceDate', type: 'string' },
          { name: 'credentialSubject', type: 'StatusList2021' },
          { name: 'proof', type: 'Proof' },
        ],
      },
      primaryType: 'VerifiableCredential',
    },
  },
};

export const managerStatusList: StatusList2021Credential = {
  '@context': ['https://www.w3.org/2018/credentials/v1', StatusList2021Context],
  id: 'https://identitycache.org/v1/status-list/urn:uuid:287917d8-53ef-41cb-ac94-25ee92e76d0e',
  type: [
    CredentialType.VerifiableCredential,
    CredentialType.StatusList2021Credential,
  ],
  credentialSubject: {
    id: 'https://identitycache.org/v1/status-list/urn:uuid:287917d8-53ef-41cb-ac94-25ee92e76d0e',
    type: CredentialStatusType.StatusList2021,
    statusPurpose: CredentialStatusPurpose.REVOCATION,
    encodedList: 'H4sIAAAAAAAAA2MEABvfBaUBAAAA',
  },
  issuer: 'did:ethr:0x539:0x0f4f2ac550a1b4e2280d04c21cea7ebd822934b5',
  issuanceDate: '2022-06-24T07:49:39.010Z',
  proof: {
    '@context': 'https://w3id.org/security/suites/eip712sig-2021/v1',
    type: 'EthereumEip712Signature2021',
    proofPurpose: 'assertionMethod',
    proofValue:
      '0xcf12f1228fe40edc3fb06f33999a0fb331ec763257a208c89d4292fa1ce0692f72c49341749cbf3b9eb63b10056af644e6f5365229b7598b9ec816ec959335fc1b',
    verificationMethod:
      'did:ethr:0x539:0x0f4f2ac550a1b4e2280d04c21cea7ebd822934b5#controller',
    created: '2022-06-24T07:49:39.010Z',
    eip712Domain: {
      domain: {},
      messageSchema: {
        EIP712Domain: [],
        Proof: [
          { name: '@context', type: 'string' },
          { name: 'verificationMethod', type: 'string' },
          { name: 'created', type: 'string' },
          { name: 'proofPurpose', type: 'string' },
          { name: 'type', type: 'string' },
        ],
        StatusList2021: [
          { name: 'id', type: 'string' },
          { name: 'type', type: 'string' },
          { name: 'statusPurpose', type: 'string' },
          { name: 'encodedList', type: 'string' },
        ],
        VerifiableCredential: [
          { name: '@context', type: 'string[]' },
          { name: 'id', type: 'string' },
          { name: 'type', type: 'string[]' },
          { name: 'issuer', type: 'string' },
          { name: 'issuanceDate', type: 'string' },
          { name: 'credentialSubject', type: 'StatusList2021' },
          { name: 'proof', type: 'Proof' },
        ],
      },
      primaryType: 'VerifiableCredential',
    },
  },
};
