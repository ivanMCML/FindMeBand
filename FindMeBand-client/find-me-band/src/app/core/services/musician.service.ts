import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Musician } from '../models/models';

@Injectable({ providedIn: 'root' })
export class MusicianService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/musician`;

  getAll(): Observable<Musician[]> {
    return this.http.get<Musician[]>(this.base);
  }

  getById(id: number): Observable<Musician> {
    return this.http.get<Musician>(`${this.base}/${id}`);
  }
}
