import { IssuerVerification, RoleEIP191JWT } from '@energyweb/vc-verification';
import { IRoleDefinitionV2 } from '@energyweb/credential-governance';
import { Logger } from './Logger';

export class ClaimVerifier {
  constructor(
    private readonly claims: RoleEIP191JWT[],
    private readonly getRoleDefinition: (
      namespace: string
    ) => Promise<IRoleDefinitionV2 | null>,
    private readonly issuerVerification: IssuerVerification
  ) {}

  public async getVerifiedRoles(): Promise<
    { name: string; namespace: string }[]
  > {
    const roles = await Promise.all(
      this.claims.map(async (claim) =>
        this.verifyRole(<Required<RoleEIP191JWT>>claim)
      )
    );
    const filteredRoles = roles.filter(Boolean) as {
      name: IRoleDefinitionV2['roleName'];
      namespace: RoleEIP191JWT['payload']['claimData']['claimType'];
    }[];
    const uniqueRoles = [
      ...new Set(filteredRoles.map((r) => JSON.stringify(r))),
    ];
    return uniqueRoles.map((r) => JSON.parse(r));
  }

  /**
   * @description Checks that credential represents role and was
   * issued by issuer required by role definition
   *
   * @param credential: Role EIP191Jwt
   */
  private async verifyRole(credential: Required<RoleEIP191JWT>): Promise<{
    name: IRoleDefinitionV2['roleName'];
    namespace: RoleEIP191JWT['payload']['claimData']['claimType'];
  } | null> {
    if (!credential.payload) {
      Logger.info('Invalid role credential: RolePayload does not exist');
      return null;
    }
    const role = await this.getRoleDefinition(
      credential.payload.claimData.claimType
    );
    const credentialClaimData = credential.payload.claimData;
    if (credential.payload.exp && credential.payload.exp < Date.now()) {
      Logger.info(
        `Credential expired: Role ${
          credentialClaimData.claimType
        } has expiration date of ${new Date(
          credential.payload.exp
        ).toISOString()} UTC`
      );
      return null;
    }
    if (!role) {
      Logger.info(
        `No role found: Role ${credentialClaimData.claimType} does not exist`
      );
      return null;
    }

    if (role.version !== credentialClaimData.claimTypeVersion) {
      Logger.info(
        `No role found: Role ${credentialClaimData.claimType} with version ${credentialClaimData.claimTypeVersion} does not exists`
      );
      return null;
    }
    const verificationResult = await this.issuerVerification.verifyIssuer(
      credential.payload.iss as string,
      credentialClaimData.claimType
    );
    if (verificationResult.verified) {
      return {
        name: role.roleName,
        namespace: credentialClaimData.claimType,
      };
    }
    return null;
  }
}
