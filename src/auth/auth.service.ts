import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service.js';
import { registerUserDto } from './dto/registerUser.dto.js';
import bcrypt from 'bcrypt';

@Injectable()
export class AuthService {

    constructor (private readonly userService : UserService) {}

    async registerUser(UsersDto : registerUserDto){

        console.log(UsersDto);

        const saltRounds = 10;
        const hash = await bcrypt.hash(UsersDto.password, saltRounds);
        //Logic for user register
        /*
            1.Check if email is register or not
            2.Hash the password
            3.Store the user into DB
            4.Generate JWT Token
            5.Send token in response
        */



        return this.userService.createUser({...UsersDto, password: hash});
    }
}
