import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CourseSummaryDto, UpdatePricingDto, PagedResult } from '../models/course';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AdminCourseService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/api/admin/courses`;

  getCourses(
    page = 1,
    pageSize = 10,
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

    return this.http.get<any>(this.base, { params }).pipe(
      map(res => res.data)
    );
  }

  publishCourse(id: number): Observable<boolean> {
    return this.http.put<any>(`${this.base}/${id}/publish`, {}).pipe(
      map(res => res.data)
    );
  }

  unpublishCourse(id: number): Observable<boolean> {
    return this.http.put<any>(`${this.base}/${id}/unpublish`, {}).pipe(
      map(res => res.data)
    );
  }

  updatePricing(id: number, dto: UpdatePricingDto): Observable<boolean> {
    return this.http.put<any>(`${this.base}/${id}/pricing`, dto).pipe(
      map(res => res.data)
    );
  }
}