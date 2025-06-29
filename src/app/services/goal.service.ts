import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GoalService {

  private baseUrl = 'http://localhost:3000'; // Adjust your backend URL accordingly

  constructor(private http: HttpClient) { } 

  fetchAllGoals(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/goal`);
  }
  fetchSpecificGoal(contentId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/goal/${contentId}`);
  }
  updateProgression(goalId: string, objectiveName: string, isChecked: boolean, username: string): Observable<any> {
    const body = {
      goalId: goalId,
      objectiveName: objectiveName,
      isChecked: isChecked,
      username: username
    };
    return this.http.put<any>(`${this.baseUrl}/progression`, body);
  }
  addProgression(goalId: string, username: string): Observable<any> {
    const body = { goalId, username };
    return this.http.put<any>(`${this.baseUrl}/addProgression`, body);
  }
  resetUserProgress(goalId: string, username: string): Observable<any> {
    const resetData = {
      goalId,
      username,
      reset: true
    };

    return this.http.put(`${this.baseUrl}/reset-progress`, resetData);
  }
}
