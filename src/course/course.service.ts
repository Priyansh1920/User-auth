import { Injectable, NotFoundException } from '@nestjs/common';
import { CourseDto } from './dto/create-course.dto.js';
import { UpdateCourseDto } from './dto/update-course.dto.js';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Course } from './schemas/course.schema.js';

@Injectable()
export class CourseService {

  constructor(@InjectModel(Course.name) private courseModel: Model<Course>){}

  async create(createCourseDto: CourseDto) {
    return await this.courseModel.create({
      name: createCourseDto.name,
      description: createCourseDto.description,
      level: createCourseDto.level,
      price: createCourseDto.price,
    })
  }

  async findAll() {
    return await this.courseModel.find().exec();
  }

  async findOne(name: string) {
    const course = await this.courseModel.findOne({ name }).exec();
    if (!course) {
      throw new NotFoundException('Course not found');
    }
    return course;
  }

  async update(name: string, updateCourseDto: UpdateCourseDto) {
    const course = await this.courseModel
      .findOneAndUpdate({ name }, updateCourseDto, { new: true })
      .exec();
    if (!course) {
      throw new NotFoundException('Course not found');
    }
    return course;
  }

  remove(id: number) {
    return `This action removes a #${id} course`;
  }
}
