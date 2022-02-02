import {
  OffchainClaim,
  DecodedToken,
  IRoleDefinition,
} from './LoginStrategy.types';
import * as jwt from 'jsonwebtoken';
import { IDIDDocument } from '@ew-did-registry/did-resolver-interface';
import { ProofVerifier } from '@ew-did-registry/claims';

export class ClaimVerifier {
  constructor(
    private readonly claims: OffchainClaim[],
    private readonly getRoleDefinition: (
      namespace: string
    ) => Promise<IRoleDefinition>,
    private readonly getOffchainClaims: (
      did: string
    ) => Promise<OffchainClaim[]>,
    private readonly getDidDocument: (did: string) => Promise<IDIDDocument>
  ) {}

  public async getVerifiedRoles(): Promise<
    { name: string; namespace: string }[]
  > {
    const roles = await Promise.all(
      this.claims.map(async (claim) => {
        if (claim.iss) {
          return this.verifyRole(<Required<OffchainClaim>>claim);
        }
        const { iss } = jwt.decode(claim.issuedToken) as DecodedToken;
        return this.verifyRole({ ...claim, iss });
      })
    );
    const filteredRoles = roles.filter(Boolean) as {
      name: IRoleDefinition['roleName'];
      namespace: OffchainClaim['claimType'];
    }[];
    const uniqueRoles = [...new Set(filteredRoles)];
    return uniqueRoles;
  }

  /**
   * @description Checks that claim represents role and was
   * issued by issuer required by role definition
   *
   * @param claim: role claim
   */
  private async verifyRole(claim: Required<OffchainClaim>): Promise<{
    name: IRoleDefinition['roleName'];
    namespace: OffchainClaim['claimType'];
  } | null> {
    if (!(await this.verifySignature(claim))) {
      return null;
    }

    const role = await this.getRoleDefinition(claim.claimType);
    if (!role) {
      return null;
    }

    if (role.version !== claim.claimTypeVersion) {
      return null;
    }

    if (
      role.issuer?.issuerType === 'DID' &&
      Array.isArray(role.issuer?.did) &&
      role.issuer?.did.includes(claim.iss)
    ) {
      return {
        name: role.roleName,
        namespace: claim.claimType,
      };
    } else if (role.issuer?.issuerType === 'Role' && role.issuer.roleName) {
      const issuerClaims = await this.getOffchainClaims(claim.iss);
      const issuerRoles = issuerClaims.map((claim) => claim.claimType);
      if (issuerRoles.includes(role.issuer.roleName)) {
        return {
          name: role.roleName,
          namespace: claim.claimType,
        };
      }
    }
    return null;
  }

  private async verifySignature(
    claim: Required<OffchainClaim>
  ): Promise<boolean> {
    const document = await this.getDidDocument(claim.iss);
    const proofVerifier = new ProofVerifier(document);
    const verifiedIssuer = await proofVerifier.verifyAssertionProof(
      claim.issuedToken
    );
    return verifiedIssuer === claim.iss;
  }
}
