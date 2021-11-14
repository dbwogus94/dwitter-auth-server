import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshDto {
  @ApiProperty({ description: '아이디', example: 'testId', required: true })
  @IsNotEmpty()
  username: string;
}
