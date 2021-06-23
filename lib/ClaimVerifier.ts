import { Claim, DecodedToken, IRoleDefinition } from "./LoginStrategy.types"
import * as jwt from 'jsonwebtoken'

export class ClaimVerifier {

  constructor(
    private readonly claims: Claim[],
    private readonly getRoleDefinition: (namespace: string) => Promise<IRoleDefinition>,
    private readonly getUserClaims: (did: string) => Promise<Claim[]>) {
  }

  public async getVerifiedRoles(): Promise<{ name: any; namespace: string }[]> {
    const roles = await Promise.all(
      this.claims.map(
        async ({ claimType, claimTypeVersion, iss, issuedToken }) => {
          if (!claimType) return

          if (iss) {
            return this.verifyRole({
              issuer: iss,
              namespace: claimType,
              version: claimTypeVersion,
            })
          }
          const issuedClaim = jwt.decode(issuedToken!) as DecodedToken;
          return this.verifyRole({
            issuer: issuedClaim.iss,
            namespace: claimType,
            version: claimTypeVersion,
          })
        }
      )
    )
    const filteredRoles = roles.filter(Boolean)
    const uniqueRoles = [...new Set(filteredRoles)]
    return uniqueRoles;
  }

  /**
   * @description checks that role which corresponds to `namespace` is owned by the `issuer`
   * @param param0
   */
  async verifyRole({
    namespace,
    issuer,
    version,
  }: {
    namespace: string
    issuer: string
    version?: string
  }): Promise<{
    name: string;
    namespace: string;
  } | null> {
    const role = await this.getRoleDefinition(namespace)
    if (!role) {
      return null
    }

    if (version && role.version !== version) {
      return null
    }

    if (role.issuer?.issuerType === 'DID') {
      if (
        Array.isArray(role.issuer?.did) &&
        role.issuer?.did.includes(issuer)
      ) {
        return {
          name: role.roleName,
          namespace,
        }
      }
      return null
    }

    if (role.issuer?.issuerType === 'Role') {
      const issuerClaims = await this.getUserClaims(issuer)
      const issuerRoles = issuerClaims.map((c) => c.claimType)
      if (issuerRoles.includes(role.issuer.roleName)) {
        return {
          name: role.roleName,
          namespace,
        }
      }
    }
    return null
  }

}