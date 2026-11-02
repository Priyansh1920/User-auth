import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service.js';
import { registerUserDto } from './dto/registerUser.dto.js';
import bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { loginUser } from './dto/loginUser.dto.js';

@Injectable()
export class AuthService {

    constructor (
        private readonly userService : UserService,
        private readonly jwtService: JwtService
    ) {}

    async registerUser(UsersDto : registerUserDto){

        const saltRounds = 10;
        const hash = await bcrypt.hash(UsersDto.password, saltRounds);

        const user = await this.userService.createUser({...UsersDto, password: hash});

        const payload = {sub: user._id, email: user.email, role: user.role};
        return this.jwtService.signAsync(payload);
    }    

    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.userService.findByEmail(email);

        if(!user || !(await bcrypt.compare(pass, user.password))){
            throw new UnauthorizedException('Invalid credentials');
        }
        return user;
    }

    async login(User: loginUser) {
        const user = await this.validateUser(User.email, User.password);
        const payload  = {sub: user._id, email: user.email, role: user.role};
        return {
            access_token : await this.jwtService.signAsync(payload)
        };
    }
}
