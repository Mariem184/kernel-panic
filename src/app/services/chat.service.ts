import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

export interface ChatMessagePayload {
  sender: 'user' | 'bot';
  text: string;
}

export interface ChatResponse {
  answer: string;
  sources?: string[];
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private http = inject(HttpClient);
  private apiUrl = '/api/chat';

  /**
   * Sends user question and recent session history to the backend AI API.
   */
  sendMessage(message: string, history: ChatMessagePayload[] = [], lang: string = 'en'): Observable<ChatResponse> {
    return this.http.post<ChatResponse>(this.apiUrl, { message, history, lang }).pipe(
      catchError((error) => {
        console.error('[ChatService] Error calling /api/chat:', error);
        return throwError(() => error);
      })
    );
  }
}
