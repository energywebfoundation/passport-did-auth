import { OffchainClaim } from './LoginStrategy.types';
import { IRoleDefinition } from '@energyweb/credential-governance';
import { IDIDDocument } from '@ew-did-registry/did-resolver-interface';

export class ClaimVerifier {
  constructor(
    private readonly claims: OffchainClaim[],
    private readonly getRoleDefinition: (
      namespace: string
    ) => Promise<IRoleDefinition | null>,
    private readonly getOffchainClaims: (
      did: string
    ) => Promise<OffchainClaim[]>,
    private readonly getDidDocument: (did: string) => Promise<IDIDDocument>
  ) {}

  public async getVerifiedRoles(): Promise<
    { name: string; namespace: string }[]
  > {
    const roles = await Promise.all(
      this.claims.map(async (claim) =>
        this.verifyRole(<Required<OffchainClaim>>claim)
      )
    );
    const filteredRoles = roles.filter(Boolean) as {
      name: IRoleDefinition['roleName'];
      namespace: OffchainClaim['claimType'];
    }[];
    const uniqueRoles = [
      ...new Set(filteredRoles.map((r) => JSON.stringify(r))),
    ];
    return uniqueRoles.map((r) => JSON.parse(r));
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
    // if (!(await this.verifySignature(claim))) {
    //   return null;
    // }

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
}
