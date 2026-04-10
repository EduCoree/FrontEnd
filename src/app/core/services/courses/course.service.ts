import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateCourseDto, CreateSectionDto, ReorderItemDto, UpdateCourseDto, UpdatePricingDto, UpdateSectionDto } from '../../model/courses/course.model';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CourseService {

  // private baseUrl = 'https://localhost:7275/api/teacher/courses';
  private baseUrl = `${environment.apiUrl}/api/teacher/courses`;
//  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // course list with pagination and filtering
  getMyCourses(page: number = 1, pageSize: number = 10): Observable<any> {
    const params = new HttpParams()
      .set('pageNumber', page)
      .set('pageSize', pageSize);
    return this.http.get<any>(this.baseUrl, { params });
  }

  // get course by id
  getCourseById(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}`);
  }
getMyCoursesWithEnrollment(): Observable<any> {
  return this.http.get<any>(`${this.baseUrl}/my-courses`);
}
  // create a new course
  createCourse(dto: CreateCourseDto): Observable<any> {
    return this.http.post<any>(this.baseUrl, dto);
  }

  // update a course
  updateCourse(id: number, dto: UpdateCourseDto): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${id}`, dto);
  }

  // delete a course
  deleteCourse(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/${id}`);
  }

  // upload cover image
  uploadCover(id: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.put<any>(`${this.baseUrl}/${id}/cover`, formData);
  }

  // update pricing
  updatePricing(id: number, dto: UpdatePricingDto): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${id}/pricing`, dto);
  }
// publish a course
  publishCourse(id: number): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${id}/publish`, {});
  }

  // unpublish a course
  unpublishCourse(id: number): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${id}/unpublish`, {});
  }

  // get sections
  getSections(courseId: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${courseId}/sections`);
  }
// add a new section
  addSection(courseId: number, dto: CreateSectionDto): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/${courseId}/sections`, dto);
  }

  // update section
  updateSection(courseId: number, sectionId: number, dto: UpdateSectionDto): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${courseId}/sections/${sectionId}`, dto);
  }

  // delete section
  deleteSection(courseId: number, sectionId: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/${courseId}/sections/${sectionId}`);
  }

  // reorder sections
  reorderSections(courseId: number, items: ReorderItemDto[]): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${courseId}/sections/reorder`, items);
  }

  // reorder lessons
  reorderLessons(courseId: number, sectionId: number, items: ReorderItemDto[]): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${courseId}/sections/${sectionId}/lessons/reorder`, items);
  }

}