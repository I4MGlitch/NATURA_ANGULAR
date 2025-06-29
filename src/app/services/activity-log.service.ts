import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ActivityLogService {
  private baseUrl = 'http://localhost:3000'; // Adjust your backend URL accordingly

  constructor(private http: HttpClient) {}
 
  submitActivityLog(activityLog: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/activity-log`, activityLog);
  }

  fetchActivityLogsByUsername(username: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/activity-log/${username}`);
  }
}
