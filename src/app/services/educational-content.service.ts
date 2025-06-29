import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EducationalContentService {

  private baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient, private router: Router) {}

  submitEducationalContent(formData: FormData): Observable<any> {
    return this.http.post(`${this.baseUrl}/educational-content`, formData);
  }

  updateEducationalContent(id: string, formData: FormData): Observable<any> {
    return this.http.put(`${this.baseUrl}/educational-content/${id}`, formData);
  }

  deleteEducationalContent(contentId: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/educational-content/${contentId}`);
  }

   // Fetch all educational content
   fetchAllEducationalContent(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/educational-content/all`);
  }

  // Fetch a specific educational content by its ID
  fetchSpecificEducationalContent(contentId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/educational-content/${contentId}`);
  }
}
