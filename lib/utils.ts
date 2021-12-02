import { normalize } from "eth-ens-namehash";
import { keccak_256 as sha3 } from "js-sha3";
import { OffchainClaim } from "./LoginStrategy.types";

export function decodeLabelhash(hash: string): string {
  if (!(hash.startsWith("[") && hash.endsWith("]"))) {
    throw Error(
      "Expected encoded labelhash to start and end with square brackets"
    );
  }

  if (hash.length !== 66) {
    throw Error("Expected encoded labelhash to have a length of 66");
  }

  return `${hash.slice(1, -1)}`;
}

export function isEncodedLabelhash(hash: string): boolean {
  return hash.startsWith("[") && hash.endsWith("]") && hash.length === 66;
}

export function namehash(inputName: string): string {
  let node = "";
  for (let i = 0; i < 32; i++) {
    node += "00";
  }

  if (inputName) {
    const labels = inputName.split(".");

    for (let i = labels.length - 1; i >= 0; i--) {
      let labelSha: string;
      if (isEncodedLabelhash(labels[i])) {
        labelSha = decodeLabelhash(labels[i]);
      } else {
        const normalizedLabel = normalize(labels[i]);
        labelSha = sha3(normalizedLabel);
      }
      node = sha3(Buffer.from(node + labelSha, "hex"));
    }
  }

  return "0x" + node;
}

export function labelhash(unnormalizedLabelOrLabelhash: string): string {
  return isEncodedLabelhash(unnormalizedLabelOrLabelhash)
    ? "0x" + decodeLabelhash(unnormalizedLabelOrLabelhash)
    : "0x" + sha3(normalize(unnormalizedLabelOrLabelhash));
}

export function lookup(
  obj: Record<string, unknown> | string,
  field: string
): string | null {
  if (!obj) {
    return null;
  }
  const chain = field.split("]").join("").split("[");
  for (let i = 0, len = chain.length; i < len; i++) {
    const prop = obj[chain[i]];
    if (typeof prop === "undefined") {
      return null;
    }
    if (typeof prop !== "object") {
      return prop as string | null;
    }
    obj = prop;
  }
  return null;
}

export function isOffchainClaim(claim: any): claim is OffchainClaim {
  const offChainCliamProps = [
    "claimType",
    "claimTypeVersion",
    "issuedToken",
    "iss",
  ];
  const claimProps = Object.keys(claim);
  return offChainCliamProps.every((p) => claimProps.includes(p));
}
