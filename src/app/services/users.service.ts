import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { API_BASE } from '../core/api.config';

/** "admin" can manage everything incl. team accounts; "editor" can only add/edit news and projects. */
export type TeamRole = 'admin' | 'editor';

export interface TeamUser {
  id: number;
  fullName: string;
  email: string;
  role: TeamRole;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface CreateTeamUser {
  fullName: string;
  email: string;
  password: string;
  role: TeamRole;
  isActive: boolean;
}

export type UpdateTeamUser = Partial<CreateTeamUser>;

interface Paged<T> { totalCount: number; items: T[]; }

/** Team accounts — /api/users (admin only on the API side). */
@Injectable({ providedIn: 'root' })
export class UsersService {
  private http = inject(HttpClient);
  private readonly url = `${API_BASE}/users`;

  list(): Observable<TeamUser[]> {
    return this.http.get<Paged<TeamUser>>(this.url).pipe(
      map(res => (res.items ?? []).map(u => ({ ...u, role: normalizeRole(u.role) })))
    );
  }

  create(dto: CreateTeamUser): Observable<TeamUser> {
    return this.http.post<TeamUser>(this.url, dto);
  }

  update(id: number, dto: UpdateTeamUser): Observable<TeamUser> {
    return this.http.put<TeamUser>(`${this.url}/${id}`, dto);
  }

  remove(id: number): Observable<unknown> {
    return this.http.delete(`${this.url}/${id}`);
  }
}

/** The API sends the enum as "admin"/"editor" (or 0/1 on older builds). */
export function normalizeRole(role: unknown): TeamRole {
  if (role === 0 || String(role).toLowerCase() === 'admin') return 'admin';
  return 'editor';
}
