import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class AuthDto {
  @IsNumber()
  @IsNotEmpty()
  phone: number;

  @IsString()
  @IsNotEmpty()
  password: string;
}
