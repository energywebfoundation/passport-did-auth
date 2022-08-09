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
    // if (!(await this.verifySignature(claim))) {
    //   return null;
    // }

    if (!credential?.payload) {
      Logger.info('RolePayload does not exist');
      return null;
    }
    if (credential.payload) {
      const role = await this.getRoleDefinition(
        credential.payload.claimData.claimType
      );
      if (!role) {
        Logger.info('Role does not exist');
        return null;
      }

      if (role.version !== credential.payload.claimData.claimTypeVersion) {
        Logger.info(
          'Role version does not match the claimTypeVersion in credential'
        );
        return null;
      }
      const verificationResult = await this.issuerVerification.verifyIssuer(
        credential.payload.iss as string,
        credential.payload.claimData.claimType
      );
      if (verificationResult.verified) {
        return {
          name: role.roleName,
          namespace: credential.payload.claimData.claimType,
        };
      }
    }
    return null;
  }
}
