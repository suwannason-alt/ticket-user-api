import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { EStatus } from '../../enum/common';
import { TemplateEntity } from './template.entity';
import { RoleEntity } from './role.entity';
import { FeatureEntity } from './feature.entity';
import type { IAccess } from '../../permission/interface/permission.interface';

@Entity({ name: 'permissions' })
export class PermissionEntity extends TemplateEntity {
  @Column({ type: 'jsonb' })
  permission: IAccess;

  @Column({ type: 'enum', enum: EStatus, default: EStatus.ACTIVE })
  status: EStatus;

  @ManyToOne(() => RoleEntity, (role) => role.permissions)
  @JoinColumn({ name: 'role_uuid' })
  @Index('permissions_role_idx')
  role_uuid: string;

  @ManyToOne(() => FeatureEntity, (feature) => feature.permissions)
  @JoinColumn({ name: 'feature_uuid' })
  feature_uuid: string;
}
