import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  isNotEmpty,
  isString,
} from 'class-validator';
export class RegisterUserDto {
  @IsNotEmpty()
  readonly username: string;

  @IsNotEmpty()
  @IsString()
  readonly firstName: string;

  @IsOptional()
  @IsString()
  readonly lastName?: string;

  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  // @MinLength(8, { message: ' The min length of password is 8 ' })
  // @MaxLength(20, {
  //   message: " The password can't accept more than 20 characters ",
  // })
  // @Matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,20}$/,
  //     { message: " A password at least contains one numeric digit, one supercase char and one lowercase char" }
  // )
  @IsNotEmpty()
  readonly password: string;
}
