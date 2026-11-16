import { Injectable, NotFoundException } from '@nestjs/common';
import { CourseDto } from './dto/create-course.dto.js';
import { UpdateCourseDto } from './dto/update-course.dto.js';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Course } from './schemas/course.schema.js';
import { ListCourseQuerySto } from './dto/list-courses-query.dto.js';

@Injectable()
export class CourseService {

  constructor(@InjectModel(Course.name) private courseModel: Model<Course>) { }

  async create(createCourseDto: CourseDto) {
    return await this.courseModel.create({
      name: createCourseDto.name,
      description: createCourseDto.description,
      level: createCourseDto.level,
      price: createCourseDto.price,
    })
  }

  async findAll(query: ListCourseQuerySto) {
    const { page, limit } = query;
    const skip = (page - 1) * limit;          // with offset: const skip = query.offset;

    const [data, totalCount] = await Promise.all([
      this.courseModel.find().sort({ _id: 1 }).skip(skip).limit(limit).exec(),  
      this.courseModel.countDocuments().exec(),
    ])

    return {
      data,
      meta: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      }
    }
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

  async remove(name: string) {
    const course = await this.courseModel.findOneAndDelete({ name }).exec();
    if (!course) {
      throw new NotFoundException('Course not found');
    }
    return { message: 'Course deleted', name: course.name };
  }
}
