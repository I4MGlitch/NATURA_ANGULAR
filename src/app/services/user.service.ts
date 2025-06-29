import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';



@Injectable({
  providedIn: 'root'
})
export class UserService {

  private baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient, private router: Router) { }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  ifAdmin(): boolean {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.role === 'admin';
  }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, userData);
  }

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/login`, credentials);
  }

  saveToken(token: string) {
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAdmin(): boolean {
    const token = this.getToken();
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role === 'admin';
    }
    return false;
  }

  getUsernameFromToken(): string | null {
    const token = this.getToken();
    if (token) {
      const decodedToken: any = jwtDecode(token);
      const username = decodedToken.username;

      console.log('Username:', username);
      return username || null;
    }
    return null;
  }

  fetchAllUsernames(): Observable<{ username: string; profilePic: string | null }[]> {
    return this.http.get<{ username: string; profilePic: string | null }[]>('http://localhost:3000/all-usernames');
  }


  addFriend(currentUsername: string, friendUsername: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/add-friend`, {
      currentUsername,
      friendUsername
    });
  }

  removeFriend(currentUsername: string, friendUsername: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/remove-friend`, {
      currentUsername,
      friendUsername,
    });
  }

  getUserByUsername(username: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/users/${username}`);
  }

  getUserData(): any {
    const token = this.getToken();
    if (token) {
      const decodedToken: any = jwtDecode(token);
      return {
        username: decodedToken?.username,
        role: decodedToken?.role
      };
    }
    return null;
  }

  // Update user profile
  updateUserProfile(userData: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/users/update`, userData).pipe(
    );
  }

  // Convert image to base64
  convertImageToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  }
}
