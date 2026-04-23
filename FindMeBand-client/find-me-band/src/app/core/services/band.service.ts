import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Band } from '../models/models';

@Injectable({ providedIn: 'root' })
export class BandService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/band`;

  getAll(): Observable<Band[]> {
    return this.http.get<Band[]>(this.base);
  }

  getById(id: number): Observable<Band> {
    return this.http.get<Band>(`${this.base}/${id}`);
  }
}
