import { Body, Controller, Post, Get, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { registerUserDto } from './dto/registerUser.dto.js';
import { loginUser } from './dto/loginUser.dto.js';
import { AuthGaurd } from './auth.gaurd.js';
import { UserService } from '../user/user.service.js';
@Controller('auth') // auth/register
export class AuthController {

    constructor( 
        private readonly authService: AuthService,
        private readonly userService: UserService
    ) {}

    // We make endpoints in controller, since we need auth endpoints so we will make this here
    // and we will put logic in service file 
    @Post('register')
    async register(@Body() UsersDto: registerUserDto){

        const token = await this.authService.registerUser(UsersDto);
        return {access_token: token}
    }

    @Post('login')
    async login(@Body() userLogin: loginUser){
        return this.authService.login(userLogin);
    }
    
    @UseGuards(AuthGaurd)
    @Get('user')
    async getUser(@Request() req: any){
        const userId = req.user.id;
        const user = await this.userService.findById(userId);

        console.log(user);
        return {
            name: user?.fname,
            surname: user?.lname,
            email: user?.email,
            role: user?.role
        }
    }
}
