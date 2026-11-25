import { BadRequestException, Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { UserService } from '../user/user.service.js';
import { registerUserDto } from './dto/registerUser.dto.js';
import bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { loginUser } from './dto/loginUser.dto.js';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { USER_REGISTERED, type UserRegisteredEvent } from './events/user-registered.event.js';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {

    constructor (
        private readonly userService : UserService,
        private readonly jwtService: JwtService,
        private readonly eventEmitter: EventEmitter2,
        private readonly config: ConfigService,
    ) {}

    async registerUser(UsersDto : registerUserDto){

        const saltRounds = 10;
        const hash = await bcrypt.hash(UsersDto.password, saltRounds);

        const user = await this.userService.createUser({...UsersDto, password: hash});

        const token = await this.jwtService.signAsync(
            {sub: String(user._id), purpose: 'verify-email'},
            {secret: this.config.getOrThrow('EMAIL_VERIFY_SECRET'), expiresIn: '24h' },
        );

        const verifyUrl = `${this.config.getOrThrow('APP_URL')}/auth/verify?token=${token}`;

        this.eventEmitter.emit(USER_REGISTERED, {
            email: user.email,
            fname: user.fname,
            verifyUrl,
        } satisfies UserRegisteredEvent);

       return {
        message: 'User registered successfully, Check your email to verify your account.'};
    }

    async verifyEmail(token: string) {
        let payload: {sub: string; purpose: string};
        try{
            payload = await this.jwtService.verifyAsync(token, {
                secret: this.config.getOrThrow('EMAIL_VERIFY_SECRET'),
            })
        } catch{
            throw new BadRequestException('Invalid or expired verification link');
        }

        const user = await this.userService.markVerifiedUser(payload.sub);

        if(!user){
            throw new BadRequestException('Invalid or expired verification link');
        }
        return {message:"Email verified successfully"};
        
    }

    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.userService.findByEmail(email);

        if(!user || !(await bcrypt.compare(pass, user.password))){
            throw new UnauthorizedException('Invalid credentials');
        }
        if (!user.isVerified) {
            throw new ForbiddenException('Please verify your email before logging in');
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
