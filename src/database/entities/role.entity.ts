import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { TemplateEntity } from './template.entity';
import { EStatus } from '../../enum/common';
import { CompanyEntity } from './company.entity';
import { PermissionEntity } from './permission.entity';
import { UserEntity } from './user.entity';

@Entity({ name: 'roles' })
export class RoleEntity extends TemplateEntity {
  @Column()
  name: string;

  @Column()
  description: string;

  @Column({ type: 'enum', enum: EStatus, default: EStatus.ACTIVE })
  status: EStatus;

  @ManyToOne(() => CompanyEntity, (company) => company.role_company, {
    nullable: true,
  })
  @Index('roles_company_idx')
  @JoinColumn({ name: 'company_uuid' })
  company_uuid: string;

  @OneToMany(() => PermissionEntity, (permission) => permission.role_uuid)
  permissions: PermissionEntity[];

  @OneToMany(() => UserEntity, (user) => user.role_uuid)
  users: UserEntity[];
}
