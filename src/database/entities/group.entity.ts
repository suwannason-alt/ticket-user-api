import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { TemplateEntity } from './template.entity';
import { CompanyEntity } from './company.entity';

@Entity({ name: 'group' })
export class GroupEntity extends TemplateEntity {
  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar', nullable: true })
  description: string;

  @ManyToOne(() => CompanyEntity, (company) => company.company_group)
  @JoinColumn({ name: 'company_uuid' })
  company_uuid: string;
}
