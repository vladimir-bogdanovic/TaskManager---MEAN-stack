import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class WebRequestService {
  baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  get(url: string) {
    return this.http.get(`${this.baseUrl}/${url}`);
  }

  post(url: string, payload: Object) {
    return this.http.post(`${this.baseUrl}/${url}`, payload);
  }

  patch(url: string, payload: Object) {
    return this.http.patch(`${this.baseUrl}/${url}`, payload);
  }

  delete(url: string) {
    return this.http.delete(`${this.baseUrl}/${url}`);
  }
}
