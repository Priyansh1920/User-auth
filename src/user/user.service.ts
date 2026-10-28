import { Injectable } from '@nestjs/common';
import { registerUserDto } from '../auth/dto/registerUser.dto.js';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema.js';
import { Model } from 'mongoose';

@Injectable()
export class UserService {

    constructor(@InjectModel(User.name) private userModel: Model<User>){}
    async createUser(userDto: registerUserDto){

        return await this.userModel.create({
            fname: userDto.fname,
            lname: userDto.lname,
            email: userDto.email,
            password: userDto.password
        })
    }
}
