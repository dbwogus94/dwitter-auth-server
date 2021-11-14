import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ description: '아이디', example: 'testId', required: true })
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiProperty({ description: '패스워드', example: 'testPassword', required: true })
  @IsNotEmpty()
  @IsString()
  password: string;
}
