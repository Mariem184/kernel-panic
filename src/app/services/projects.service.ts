import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { API_BASE } from '../core/api.config';
import {
  PagedResult, ProjectCreatePayload, ProjectDetail, ProjectItem, ProjectUpdatePayload
} from '../models/content.models';

@Injectable({ providedIn: 'root' })
export class ProjectsService {
  private http = inject(HttpClient);
  private readonly url = `${API_BASE}/projects`;

  list(): Observable<ProjectItem[]> {
    return this.http.get<PagedResult<ProjectItem>>(this.url).pipe(map(r => r.items));
  }

  get(slugOrId: string | number): Observable<ProjectDetail> {
    return this.http.get<ProjectDetail>(`${this.url}/${encodeURIComponent(String(slugOrId))}`);
  }

  create(payload: ProjectCreatePayload): Observable<ProjectDetail> {
    return this.http.post<ProjectDetail>(this.url, payload);
  }

  update(id: number, payload: ProjectUpdatePayload): Observable<ProjectDetail> {
    return this.http.put<ProjectDetail>(`${this.url}/${id}`, payload);
  }

  delete(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.url}/${id}`);
  }

}
