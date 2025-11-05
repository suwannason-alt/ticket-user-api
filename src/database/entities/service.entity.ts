import { Column, Entity, OneToMany } from 'typeorm';
import { TemplateEntity } from './template.entity';
import { EStatus } from '../../enum/common';
import { FeatureEntity } from './feature.entity';

@Entity({ name: 'services' })
export class ServiceEntity extends TemplateEntity {
  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: EStatus.ACTIVE, type: 'enum', enum: EStatus })
  status: EStatus;

  @OneToMany(() => FeatureEntity, (feature) => feature.service_uuid)
  features: FeatureEntity[];
}
