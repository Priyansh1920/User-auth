import { ConflictException, Injectable } from '@nestjs/common';
import { registerUserDto } from '../auth/dto/registerUser.dto.js';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema.js';
import { Model } from 'mongoose';
import { Role } from './user.types.js';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class UserService {

    constructor(
        @InjectModel(User.name) private userModel: Model<User>,
        private readonly config: ConfigService,
    ){}
    async createUser(userDto: registerUserDto){

        try{
            return await this.userModel.create({
            fname: userDto.fname,
            lname: userDto.lname,
            email: userDto.email,
            password: userDto.password,
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

    async markVerifiedUser(userId: string) {
        const user = await this.userModel.findById(userId).exec();
        if(!user){
            return null;
        }
        if(user.isVerified) return user;

        const adminSuffix = this.config.getOrThrow<string>('ADMIN').toLowerCase();
        user.isVerified = true;
        user.role = user.email.toLowerCase().endsWith(adminSuffix) ? Role.ADMIN : Role.STUDENT;
        return user.save();
    }

    async findByEmail(email: string): Promise<User | null>{
        return this.userModel.findOne({ email }).exec();
    }
    async findById(id: string): Promise<User | null> {
        return this.userModel.findById(id).exec();
    }
}
