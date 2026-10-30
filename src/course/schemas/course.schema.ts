
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { CourseDto } from '../dto/create-course.dto.js';

export type CourseDocument = HydratedDocument<CourseDto>;

@Schema()
export class Course {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ required: true})
  level: string;

  @Prop({ required: true })
  price: number;
}

export const CourseSchema = SchemaFactory.createForClass(Course);
