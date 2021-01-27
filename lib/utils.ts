import { arrayify, hashMessage, keccak256, recoverAddress } from 'ethers/utils'
import base64url from 'base64url'
import { normalize } from 'eth-ens-namehash'
import { ITokenPayload } from './LoginStrategy.types'

const sha3 = require('js-sha3').keccak_256

export function decodeLabelhash(hash: string) {
  if (!(hash.startsWith('[') && hash.endsWith(']'))) {
    throw Error(
      'Expected encoded labelhash to start and end with square brackets'
    )
  }

  if (hash.length !== 66) {
    throw Error('Expected encoded labelhash to have a length of 66')
  }

  return `${hash.slice(1, -1)}`
}

export function isEncodedLabelhash(hash: string) {
  return hash.startsWith('[') && hash.endsWith(']') && hash.length === 66
}

export function namehash(inputName: string) {
  let node = ''
  for (let i = 0; i < 32; i++) {
    node += '00'
  }

  if (inputName) {
    const labels = inputName.split('.')

    for (let i = labels.length - 1; i >= 0; i--) {
      let labelSha: string
      if (isEncodedLabelhash(labels[i])) {
        labelSha = decodeLabelhash(labels[i])
      } else {
        const normalizedLabel = normalize(labels[i])
        labelSha = sha3(normalizedLabel)
      }
      node = sha3(Buffer.from(node + labelSha, 'hex'))
    }
  }

  return '0x' + node
}

export function labelhash(unnormalizedLabelOrLabelhash: string) {
  return isEncodedLabelhash(unnormalizedLabelOrLabelhash)
    ? '0x' + decodeLabelhash(unnormalizedLabelOrLabelhash)
    : '0x' + sha3(normalize(unnormalizedLabelOrLabelhash))
}

export function lookup(obj: {}, field: string): string | null {
  if (!obj) {
    return null
  }
  const chain = field.split(']').join('').split('[')
  for (let i = 0, len = chain.length; i < len; i++) {
    const prop = obj[chain[i]]
    if (typeof prop === 'undefined') {
      return null
    }
    if (typeof prop !== 'object') {
      return prop
    }
    obj = prop
  }
  return null
}

export const verifyClaim = (token: string, { iss }: ITokenPayload) => {
  const [encodedHeader, encodedPayload, encodedSignature] = token.split('.')
  const msg = `0x${Buffer.from(`${encodedHeader}.${encodedPayload}`).toString(
    'hex'
  )}`
  const signature = base64url.decode(encodedSignature)
  const hash = keccak256(msg)
  const decodedAddress = iss.split(':')[2]
  const address = recoverAddress(arrayify(hash), signature)
  if (decodedAddress === address) {
    return iss
  }
  const digest = hashMessage(arrayify(hash))
  const addressFromDigest = recoverAddress(arrayify(digest), signature)
  return decodedAddress === addressFromDigest ? iss : ''
}

export const createLoginTokenHeadersAndPayload = ({
  address,
  blockNumber,
}: {
  address: string
  blockNumber: number
}) => {
  const header = {
    alg: 'ES256',
    typ: 'JWT',
  }

  const encodedHeader = base64url(JSON.stringify(header))

  const payload = {
    iss: `did:ethr:${address}`,
    claimData: {
      blockNumber,
    },
  }

  const encodedPayload = base64url(JSON.stringify(payload))
  return { encodedHeader, encodedPayload }
}
