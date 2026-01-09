import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { TemplateEntity } from './template.entity';
import { EStatus } from '../../enum/common';
import { ServiceEntity } from './service.entity';
import { PermissionEntity } from './permission.entity';

@Entity({ name: 'features' })
export class FeatureEntity extends TemplateEntity {
  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: EStatus,
    default: EStatus.ACTIVE,
  })
  status: EStatus;

  @ManyToOne(() => ServiceEntity, (service) => service.features)
  @JoinColumn({ name: 'service_uuid' })
  service_uuid: string;

  @OneToMany(() => PermissionEntity, (permission) => permission.feature_uuid)
  permissions: PermissionEntity[];
}
