import { Module } from '@nestjs/common';
import { CourseService } from './course.service.js';
import { CourseController } from './course.controller.js';
import { MongooseModule } from '@nestjs/mongoose';
import { CourseSchema, Course } from './schemas/course.schema.js';
import { APP_GUARD } from '@nestjs/core';
import { RolesGaurd } from '../auth/roles.gaurd.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Course.name, schema: CourseSchema}])
  ],
  controllers: [CourseController],
  providers: [CourseService],
})
export class CourseModule {}
