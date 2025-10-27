import { Column, Entity } from 'typeorm';
import { TemplateEntity } from './template.entity';
import { EStatus } from '../../enum/base';

@Entity({ name: 'users' })
export class UserEntity extends TemplateEntity {
  @Column({ type: 'varchar', nullable: true })
  displayName?: string | null;

  @Column({ type: 'bytea', nullable: true })
  email: string;

  @Column({ type: 'varchar', nullable: true })
  emailHash: string;

  @Column({ type: 'varchar', nullable: true })
  password: string;

  @Column({ type: 'boolean' })
  agreeTermsPolicy: boolean;

  @Column({ type: 'enum', enum: EStatus, default: EStatus.ACTIVE })
  status: EStatus;
}
