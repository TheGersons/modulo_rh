import { IsString, IsNotEmpty } from 'class-validator';

export class LoginDto {
    //email y password son obligatorios
    @IsString()
    @IsNotEmpty()
    email: string;
    @IsString()
    @IsNotEmpty()
    password: string;
}