import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category, CreateCategoryDto, UpdateCategoryDto } from '../models/category.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getAll(centerId: number): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/api/centers/${centerId}/Categories`);
  }

  create(centerId: number, dto: CreateCategoryDto): Observable<Category> {
    return this.http.post<Category>(`${this.apiUrl}/api/centers/${centerId}/Categories`, dto);
  }

  update(centerId: number, categoryId: number, dto: UpdateCategoryDto): Observable<Category> {
    return this.http.put<Category>(`${this.apiUrl}/api/centers/${centerId}/Categories/${categoryId}`, dto);
  }

  delete(centerId: number, categoryId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/api/centers/${centerId}/Categories/${categoryId}`);
  }
}