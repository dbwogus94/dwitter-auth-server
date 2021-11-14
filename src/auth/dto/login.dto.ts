import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ default: 'userId' })
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiProperty({ default: 'userPassword' })
  @IsNotEmpty()
  @IsString()
  password: string;
}
