import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private baseUrl = 'http://localhost:3000';
  constructor(private http: HttpClient) { }

  // Updated method for getting chat messages
  getChatMessages(user1: string, user2: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/chat/${user1}/${user2}`);
  }

  updateMessageStatus(messageIds: string[]): Observable<any> {
    const url = `${this.baseUrl}/chat/messages/read`;
    return this.http.put<any>(url, { messageIds });
  }

  // markMessagesAsRead(chatId: string, messageIds: string[]): Observable<any> {
  //   const url = `${this.baseUrl}/chat/messages/read`;
  //   return this.http.put(url, { chatId, messageIds });
  // }

  markMessagesAsRead(chatId: string, messageIds: string[]): Observable<any> {
    const body = { chatId, messageIds };
    const url = `${this.baseUrl}/chat/messages/read`
    return this.http.put(url, body);
  }

  // Send a new chat message
  sendMessage(message: any): Observable<any> {
    const url = `${this.baseUrl}/send`;
    return this.http.post(url, message); // Replace with your API endpoint
  }
}