import { IsEmail, IsString, IsNotEmpty } from "class-validator";


export class loginUser{
    @IsEmail()
    @IsNotEmpty()
    email:string

    @IsString()
    @IsNotEmpty()
    password: string
}