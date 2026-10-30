import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { CourseService } from './course.service.js';
import { CourseDto } from './dto/create-course.dto.js';
import { UpdateCourseDto } from './dto/update-course.dto.js';
import { AuthGaurd } from '../auth/auth.gaurd.js';
import { Roles } from '../auth/roles.decorator.js';
import { Role } from '../user/user.types.js';
import { RolesGaurd } from '../auth/roles.gaurd.js';

@Controller('courses')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Post()
  @UseGuards(AuthGaurd, RolesGaurd)
  @Roles(Role.ADMIN)
  create(@Body() createCourseDto: CourseDto) {
    console.log('Course has been created',createCourseDto);
    return this.courseService.create(createCourseDto);
  }

  @Get()
  findAll() {
    return this.courseService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.courseService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCourseDto: UpdateCourseDto) {
    return this.courseService.update(+id, updateCourseDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.courseService.remove(+id);
  }
}
