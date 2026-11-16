import { Module } from '@nestjs/common';
import { CourseService } from './course.service.js';
import { CourseController } from './course.controller.js';
import { MongooseModule } from '@nestjs/mongoose';
import { CourseSchema, Course } from './schemas/course.schema.js';
import { UserModule } from '../user/user.module.js';
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Course.name, schema: CourseSchema}]),
    UserModule
  ],
  controllers: [CourseController],
  providers: [CourseService],
})
export class CourseModule {}
