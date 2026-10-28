import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { registerUserDto } from './dto/registerUser.dto.js';

@Controller('auth') // auth/register
export class AuthController {

    constructor( private readonly authService: AuthService ) {}

    // We make endpoints in controller, since we need auth endpoints so we will make this here
    // and we will put logic in service file 
    @Post('register')
    register(@Body() UsersDto: registerUserDto){

        const result = this.authService.registerUser(UsersDto);
        return result;
    }
}
