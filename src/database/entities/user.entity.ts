import {
  Column,
  Entity,
  Index,
  // JoinColumn,
  // ManyToOne,
  OneToMany,
} from 'typeorm';
import { TemplateEntity } from './template.entity';
import { EStatus } from '../../enum/common';
import { UserProvider } from './userProvider.entity';
import { CompanyUserEntity } from './company-user.entity';
import { UserGroupEntity } from './user-group.entity';
// import { RoleEntity } from './role.entity';

@Entity({ name: 'users' })
export class UserEntity extends TemplateEntity {
  @Column({ type: 'varchar', nullable: true })
  displayName?: string | null;

  @Column({ type: 'bytea', nullable: true })
  email: string;

  @Column({ type: 'varchar', nullable: true })
  @Index('users_emailHash_idx')
  emailHash: string;

  @Column({ type: 'varchar', nullable: true })
  password: string | null;

  @Column({ type: 'boolean' })
  agreeTermsPolicy: boolean;

  @Column({ type: 'enum', enum: EStatus, default: EStatus.ACTIVE })
  status: EStatus;

  @OneToMany(() => UserProvider, (provider) => provider.user_uuid)
  providers: UserProvider[];

  @OneToMany(() => CompanyUserEntity, (companyUser) => companyUser.user_uuid, {
    onDelete: 'CASCADE',
  })
  companyUser: CompanyUserEntity[];

  @OneToMany(() => UserGroupEntity, (usergroup) => usergroup.user_uuid, {
    onDelete: 'CASCADE',
  })
  groupUser: UserGroupEntity[];

  // @ManyToOne(() => RoleEntity, (role) => role.users, { nullable: true })
  // @JoinColumn({ name: 'role_uuid' })
  // role_uuid: string;
}
