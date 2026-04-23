import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Event } from '../models/models';

@Injectable({ providedIn: 'root' })
export class EventService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/event`;

  getAll(): Observable<Event[]> {
    return this.http.get<Event[]>(this.base);
  }

  getById(id: number): Observable<Event> {
    return this.http.get<Event>(`${this.base}/${id}`);
  }
}
