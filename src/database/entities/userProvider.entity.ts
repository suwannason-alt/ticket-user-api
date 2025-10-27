import { Column, Entity } from 'typeorm';
import { TemplateEntity } from './template.entity';

@Entity({ name: 'providers' })
export class UserProvider extends TemplateEntity {
  @Column({ type: 'bytea' })
  value: string;

  @Column({ type: 'varchar' })
  provider: string; // line, user, any
}
