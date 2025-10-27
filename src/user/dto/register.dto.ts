import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class RegisterDto {
  @IsNotEmpty()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsOptional()
  @IsString()
  displayName: string;
}
