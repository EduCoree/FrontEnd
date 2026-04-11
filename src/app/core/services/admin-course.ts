// src/app/core/services/admin-course.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CourseSummaryDto, UpdatePricingDto, PagedResult } from '../models/course';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AdminCourseService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/api/admin/courses`;

  getCourses(
    page: number = 1,
    pageSize: number = 10,
    search?: string,
    status?: string,
    categoryId?: number,
    level?: string,
    pricingType?: string,
  ): Observable<PagedResult<CourseSummaryDto>> {
    let params = new HttpParams()
      .set('pageNumber', page)
      .set('pageSize', pageSize);
    if (search)      params = params.set('search', search);
    if (status)      params = params.set('status', status);
    if (categoryId)  params = params.set('categoryId', categoryId);
    if (level)       params = params.set('level', level);
    if (pricingType) params = params.set('pricingType', pricingType);
    return this.http.get<PagedResult<CourseSummaryDto>>(this.base, { params });
  }

  publishCourse(id: number): Observable<boolean> {
    return this.http.put<boolean>(`${this.base}/${id}/publish`, {});
  }

  unpublishCourse(id: number): Observable<boolean> {
    return this.http.put<boolean>(`${this.base}/${id}/unpublish`, {});
  }

  updatePricing(id: number, dto: UpdatePricingDto): Observable<boolean> {
    return this.http.put<boolean>(`${this.base}/${id}/pricing`, dto);
  }
}