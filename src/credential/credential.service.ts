import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { SaveAppLog } from '../utils/logger';
@Injectable()
export class CredentialService {
  private readonly logger = new SaveAppLog(CredentialService.name);
  private instance: AxiosInstance;

  constructor(private readonly configService: ConfigService) {}

  async signJwt(payload: any) {
    try {
      this.instance = axios.create({
        baseURL: this.configService.get<string>('CREDENTIAL_API'),
      });
      const response = await this.instance.post(`/api/v1/credential`, payload);
      return response.data;
    } catch (error) {
      this.logger.error(error.message, error.stack, this.signJwt.name, payload);
    }
  }

  async changeToken(authorization: string, payload: any) {
    try {
      this.instance = axios.create({
        baseURL: this.configService.get<string>('CREDENTIAL_API'),
        headers: {
          Authorization: authorization,
        },
      });
      const response = await this.instance.patch(
        `/api/v1/credential/add-fields`,
        payload,
      );
      return response.data;
    } catch (error) {
      this.logger.error(
        error.message,
        error.stack,
        this.changeToken.name,
        payload,
      );
    }
  }
}
