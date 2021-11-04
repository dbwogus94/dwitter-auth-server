import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsUrl,
  Length,
  ValidateIf,
} from 'class-validator';

export class SignupDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @Length(5)
  password: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  // 조건부 검사 : url은 빈문자열('')이 아닌 경우만 검사한다.
  // (dto, v) => dto: body가 매핑된 singupDto , v: 해당 필드에 매핑된 값
  @ValidateIf((dto, v) => dto.url !== '' && v !== '')
  @IsUrl()
  url: string;
}
