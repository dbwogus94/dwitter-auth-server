import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, IsUrl, Length, ValidateIf } from 'class-validator';

export class SignupDto {
  @ApiProperty({ description: '아이디', example: 'testId', required: true })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ description: '패스워드', example: 'testPassword', required: true })
  @IsString()
  @IsNotEmpty()
  @Length(5)
  password: string;

  @ApiProperty({ description: '이름', example: 'testerName', required: true })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: '이메일', example: 'tester@email.com', required: true })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: '프로필 이미지 URL', example: 'https://www.imgurl.com/', required: false })
  // 조건부 검사 : url은 빈문자열('')이 아닌 경우만 검사한다.
  // (dto, v) => dto: body가 매핑된 singupDto , v: 해당 필드에 매핑된 값
  @ValidateIf((dto, v) => dto.url !== '' && v !== '')
  @IsUrl()
  url: string;
}
