import { Pipe, PipeTransform } from '@angular/core';
import { TeacherCourseModel } from '../../core/models/user';
@Pipe({
  name: 'totalStudents'
})
export class TotalStudentsPipe implements PipeTransform {

   transform(courses: TeacherCourseModel[]): number {
    return courses.reduce((sum, c) => sum + c.enrollmentCount, 0);
  }

}

 

 