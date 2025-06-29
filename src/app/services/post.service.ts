import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PostService {

  private baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  createPost(postData: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/post`, postData);
  }
  createAchievement(achievementId: string, username: string, description: string): Observable<any> {
    const body = {
      achievementId: achievementId,
      username: username,
      description: description
    };

    return this.http.post<any>(`${this.baseUrl}/achievement`, body);
  }
  fetchPostsByUsername(username: string): Observable<any[]> {
    const url = `${this.baseUrl}/post?username=${encodeURIComponent(username)}`;
    return this.http.get<any[]>(url);
  }
  // Fetch all educational content
  fetchAllPost(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/post/all`);
  }
  likePost(postId: string, username: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/like-post`, { postId, username });
  }  
  addComment(postId: string, username: string, comment: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/add-comment`, { postId, username, comment });
  }
  
}
