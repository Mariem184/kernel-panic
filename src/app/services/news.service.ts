import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { API_BASE } from '../core/api.config';
import { NewsCreatePayload, NewsDetail, NewsItem, NewsUpdatePayload, PagedResult } from '../models/content.models';

@Injectable({ providedIn: 'root' })
export class NewsService {
  private http = inject(HttpClient);
  private readonly url = `${API_BASE}/news`;

  /** Published items for visitors; published + drafts when an admin token is attached. */
  list(): Observable<NewsItem[]> {
    return this.http.get<PagedResult<NewsItem>>(this.url).pipe(map(r => r.items));
  }

  get(slugOrId: string | number): Observable<NewsDetail> {
    return this.http.get<NewsDetail>(`${this.url}/${encodeURIComponent(String(slugOrId))}`);
  }

  create(payload: NewsCreatePayload): Observable<NewsDetail> {
    return this.http.post<NewsDetail>(this.url, payload);
  }

  update(id: number, payload: NewsUpdatePayload): Observable<NewsDetail> {
    return this.http.put<NewsDetail>(`${this.url}/${id}`, payload);
  }

  delete(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.url}/${id}`);
  }
}
