import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { TemplateEntity } from './template.entity';
import { CompanyEntity } from './company.entity';
import { EStatus } from '../../enum/category';

@Entity({ name: 'category' })
export class CategoryEntity extends TemplateEntity {
  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: EStatus })
  status: EStatus;

  @ManyToOne(() => CategoryEntity, (category) => category.subCategories, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'parent' })
  parent: string;

  @OneToMany(() => CategoryEntity, (category) => category.parent)
  subCategories: CategoryEntity[];

  @ManyToOne(() => CompanyEntity, (company) => company.company_category)
  @JoinColumn({ name: 'company_uuid' })
  @Index('category_company_idx')
  company_uuid: string;
}
