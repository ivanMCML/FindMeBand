import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Performer } from '../models/models';

@Injectable({ providedIn: 'root' })
export class PerformerService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/performer`;

  getAll(): Observable<Performer[]> {
    return this.http.get<Performer[]>(this.base);
  }

  getById(id: number): Observable<Performer> {
    return this.http.get<Performer>(`${this.base}/${id}`);
  }
}
