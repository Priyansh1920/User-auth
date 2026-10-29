import { ConflictException, Injectable } from '@nestjs/common';
import { registerUserDto } from '../auth/dto/registerUser.dto.js';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema.js';
import { Model } from 'mongoose';

@Injectable()
export class UserService {

    constructor(@InjectModel(User.name) private userModel: Model<User>){}
    async createUser(userDto: registerUserDto){

        try{
            return await this.userModel.create({
            fname: userDto.fname,
            lname: userDto.lname,
            email: userDto.email,
            password: userDto.password
            })
        }
        catch(err: unknown){
            console.log(err);

            const e = err as {code?: number};
            const DUPLICATE_KEY_CODE = 11000

            if(e.code === DUPLICATE_KEY_CODE){
                throw new ConflictException("Email is already register");
            }
            throw err;
        }
    }
}
