import {
  IssuerVerification,
  RevocationVerification,
  RoleEIP191JWT,
  RolePayload,
} from '@energyweb/vc-verification';
import { IRoleDefinitionV2 } from '@energyweb/credential-governance';
import { Logger } from './Logger';
import { StatusList2021Entry } from '@ew-did-registry/credentials-interface';
import { StatusListEntryVerification } from '@ew-did-registry/revocation';
import { CredentialRevoked } from './utils';

export class ClaimVerifier {
  constructor(
    private readonly claims: RoleEIP191JWT[],
    private readonly getRoleDefinition: (
      namespace: string
    ) => Promise<IRoleDefinitionV2 | null>,
    private readonly issuerVerification: IssuerVerification,
    private readonly revocationVerification: RevocationVerification,
    private readonly statusListEntryVerificaiton: StatusListEntryVerification
  ) {}

  public async getVerifiedRoles(): Promise<
    { name: string; namespace: string; error: string }[]
  > {
    const roles = await Promise.all(
      this.claims.map(async (claim) =>
        this.verifyRole(<Required<RoleEIP191JWT>>claim)
      )
    );
    const filteredRoles = roles.filter(Boolean) as {
      name: IRoleDefinitionV2['roleName'];
      namespace: RoleEIP191JWT['payload']['claimData']['claimType'];
      error: string;
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
    error: string;
  } | null> {
    if (!credential.payload) {
      Logger.info('Invalid role credential: RolePayload does not exist');
      return null;
    }
    const role = await this.getRoleDefinition(
      credential.payload.claimData.claimType
    );
    const credentialClaimData = credential.payload.claimData;
    if (!role) {
      Logger.info(
        `No role found: Role ${credentialClaimData.claimType} does not exist`
      );
      return null;
    }
    const roleStatus = await this.checkRoleStatus(credential.payload);
    if (!roleStatus.status) {
      return {
        name: role.roleName,
        namespace: credentialClaimData.claimType,
        error: roleStatus.error,
      };
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
        error: '',
      };
    }
    return null;
  }

  /**
   * @description Validates role credential expiration and revocation status
   * @param rolePayload role credential to be validated
   * @returns boolean
   */
  private async checkRoleStatus(
    rolePayload: RolePayload
  ): Promise<{ status: boolean; error: string }> {
    if (rolePayload.exp && rolePayload.exp * 1000 < Date.now()) {
      Logger.info(
        `Credential expired: Role ${
          rolePayload.claimData.claimType
        } had expiration date of ${new Date(rolePayload.exp).toISOString()} UTC`
      );
      return {
        status: false,
        error: `Credential expired: Role ${rolePayload.claimData.claimType} had expired`,
      };
    }
    try {
      if (rolePayload.credentialStatus) {
        await this.statusListEntryVerificaiton.verifyCredentialStatus(
          rolePayload?.credentialStatus as StatusList2021Entry
        );
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.message == CredentialRevoked) {
          const credential =
            await this.statusListEntryVerificaiton.fetchStatusListCredential(
              rolePayload.credentialStatus?.statusListCredential as string
            );
          await this.revocationVerification.verifyRevoker(
            credential?.issuer as string,
            rolePayload.claimData.claimType
          );
          Logger.info(
            `Credential revoked: Role ${rolePayload.claimData.claimType} has been revoked.`
          );
          return {
            status: false,
            error: `Credential revoked: Role ${rolePayload.claimData.claimType} has been revoked.`,
          };
        }
        throw new Error(error.message);
      }
    }
    return { status: true, error: '' };
  }
}
