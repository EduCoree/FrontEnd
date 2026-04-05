import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Center } from '../models/center.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CenterService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/Centers`;

  getAll(): Observable<Center[]> {
    return this.http.get<Center[]>(this.apiUrl);
  }

  getById(id: number): Observable<Center> {
    return this.http.get<Center>(`${this.apiUrl}/${id}`);
  }

  create(data: Partial<Center>): Observable<Center> {
    return this.http.post<Center>(this.apiUrl, data);
  }

  update(id: number, data: Partial<Center>): Observable<Center> {
    return this.http.put<Center>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  updateLogo(id: number, logoUrl: string): Observable<Center> {
  return this.http.put<Center>(`${this.apiUrl}/${id}/settings/logo`, { logoUrl });
}
}