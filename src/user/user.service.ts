import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../database/entities/user.entity';
import { Repository } from 'typeorm';
import { SaveAppLog } from '../utils/logger';
import { RegisterDto } from './dto/register.dto';
import { v7 as uuidv7 } from 'uuid';
import { ConfigService } from '@nestjs/config';
import sha1 from 'crypto-js/sha1';
import { EStatus } from '../enum/base';

@Injectable()
export class UserService {
  private readonly logger = new SaveAppLog(UserService.name);
  constructor(
    private readonly configService: ConfigService,

    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async register(body: RegisterDto) {
    try {
      const uuid = uuidv7();

      const user = await this.userRepository
        .createQueryBuilder(`u`)
        .where(`u."emailHash" = :email`, { email: sha1(body.email) })
        .andWhere(`u.status = :status`, { status: EStatus.ACTIVE })
        .select([`u.uuid AS uuid`])
        .getRawOne();

      if (user) {
        return null;
      }

      await this.userRepository
        .createQueryBuilder()
        .insert()
        .into(UserEntity)
        .values([
          {
            uuid,
            email: () =>
              `pgp_sym_encrypt('${body.email}', '${this.configService.get('ENCRYPTION_KEY')}')`,
            emailHash: sha1(body.email),
            displayName: body.displayName || null,
            password: sha1(body.password),
          },
        ])
        .execute();

      return uuid;
    } catch (error: any) {
      this.logger.error(error.message, error.stack, this.register.name);
      throw new Error(error);
    }
  }
}
