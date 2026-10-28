import { Injectable } from '@nestjs/common';
import { registerUserDto } from '../auth/dto/registerUser.dto.js';

@Injectable()
export class UserService {
    createUser(userDto: registerUserDto){
        return {message: "User created succesfully"}
    }
}
