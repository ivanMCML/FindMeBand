import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Opportunity } from '../models/models';

@Injectable({ providedIn: 'root' })
export class OpportunityService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/opportunity`;

  getAll(): Observable<Opportunity[]> {
    return this.http.get<Opportunity[]>(this.base);
  }

  getById(id: number): Observable<Opportunity> {
    return this.http.get<Opportunity>(`${this.base}/${id}`);
  }
}
