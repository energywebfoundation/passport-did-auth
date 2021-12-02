import { Claim, DecodedToken, IRoleDefinition } from "./LoginStrategy.types";
import * as jwt from "jsonwebtoken";
import { AuthTokenVerifier } from "./AuthTokenVerifier";
import { IDIDDocument } from "@ew-did-registry/did-resolver-interface";

export class ClaimVerifier {
  constructor(
    private readonly claims: Claim[],
    private readonly getRoleDefinition: (
      namespace: string
    ) => Promise<IRoleDefinition>,
    private readonly getUserClaims: (did: string) => Promise<Claim[]>,
    private readonly getDidDocument: (did: string) => Promise<IDIDDocument>
  ) {}

  public async getVerifiedRoles(): Promise<{ name: any; namespace: string }[]> {
    const roles = await Promise.all(
      this.claims.map(
        async ({ claimType, claimTypeVersion, iss, issuedToken }) => {
          if (!claimType) return;

          if (iss) {
            return this.verifyRole({
              issuer: iss,
              namespace: claimType,
              version: claimTypeVersion,
            });
          }
          const issuedClaim = jwt.decode(issuedToken!) as DecodedToken;
          return this.verifyRole({
            issuer: issuedClaim.iss,
            namespace: claimType,
            version: claimTypeVersion,
          });
        }
      )
    );
    const filteredRoles = roles.filter(Boolean);
    const uniqueRoles = [...new Set(filteredRoles)];
    return uniqueRoles as [];
  }

  /**
   * @description checks that the `issuer` has the required role specified by the `namespace`
   * @param param0
   */
  async verifyRole({
    namespace,
    issuer,
    version,
  }: {
    namespace: string;
    issuer: string;
    version?: string;
  }): Promise<{
    name: string;
    namespace: string;
  } | null> {
    const role = await this.getRoleDefinition(namespace);
    if (!role) {
      return null;
    }

    if (version && role.version !== version) {
      return null;
    }

    const issuerClaims = await this.getUserClaims(issuer);
    const areClaimsValid = await this.verifySignature(issuer, issuerClaims);
    if (!areClaimsValid) {
      return null;
    }
    if (role.issuer?.issuerType === "DID") {
      if (
        Array.isArray(role.issuer?.did) &&
        role.issuer?.did.includes(issuer)
      ) {
        return {
          name: role.roleName,
          namespace,
        };
      }
      return null;
    }

    if (role.issuer?.issuerType === "Role") {
      const issuerRoles = issuerClaims.map((claim) => claim.claimType);
      if (issuerRoles.includes(role.issuer.roleName)) {
        return {
          name: role.roleName,
          namespace,
        };
      }
    }
    return null;
  }

  private async verifySignature(
    issuer: string,
    issuerClaims: Claim[]
  ): Promise<boolean> {
    const didDocument = await this.getDidDocument(issuer);
    const authenticationClaimVerifier = new AuthTokenVerifier(didDocument);
    const checks = await Promise.all(
      issuerClaims.map(async (claim) => {
        if (claim.iss !== issuer) {
          return false;
        }
        const claimToken = claim.issuedToken as string;
        const verifiedIssuer = await authenticationClaimVerifier.verify(
          claimToken
        );
        if (verifiedIssuer !== issuer) {
          return false;
        }
        return true;
      })
    );
    return checks.includes(true);
  }
}
