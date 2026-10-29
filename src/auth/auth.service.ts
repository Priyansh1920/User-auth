import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service.js';
import { registerUserDto } from './dto/registerUser.dto.js';
import bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {

    constructor (
        private readonly userService : UserService,
        private readonly jwtService: JwtService
    ) {}

    async registerUser(UsersDto : registerUserDto){

        const saltRounds = 10;
        const hash = await bcrypt.hash(UsersDto.password, saltRounds);
        //Logic for user register
        /*
            1.Check if email is register or not - Done
            2.Hash the password - Done
            3.Store the user into DB - Done
            4.Generate JWT Token
            5.Send token in response
        */

        const user = await this.userService.createUser({...UsersDto, password: hash});

        const payload = {sub: user._id, email: user.email};
        const token = await this.jwtService.signAsync(payload);
        console.log(token);
        return token;
    }
}
