import { SetMetadata } from '@nestjs/common';
import { ValidRoles } from 'src/auth/interface';

export const META_ROLES = 'roles';

export const RolesProtected = (...args: ValidRoles[]) => {
  return SetMetadata(META_ROLES, args);
};
