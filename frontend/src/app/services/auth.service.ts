import { Injectable } from '@angular/core';
import { TaskService } from './task.service';
import { shareReplay, tap } from 'rxjs';
import { Router } from '@angular/router';
import { HttpClient, HttpResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(
    private taskService: TaskService,
    private router: Router,
    private http: HttpClient
  ) {}

  login(email: string, password: string) {
    return this.taskService.login(email, password).pipe(
      shareReplay(),
      tap((res) => {
        this.setSession(
          res.body?._id,
          res.headers.get('x-access-token'),
          res.headers.get('x-refresh-token')
        );
      })
    );
  }

  signup(email: string, password: string) {
    return this.taskService.signup(email, password).pipe(
      shareReplay(),
      tap((res) => {
        this.setSession(
          res.body?._id,
          res.headers.get('x-access-token'),
          res.headers.get('x-refresh-token')
        );
      })
    );
  }

  logout() {
    this.removeSession();
    this.router.navigate(['/login']);
  }

  setSession(userId: string, accessToken: string, refreshToken: string) {
    localStorage.setItem('userId', userId);
    localStorage.setItem('x-access-token', accessToken);
    localStorage.setItem('x-refresh-token', refreshToken);
  }

  removeSession() {
    localStorage.removeItem('userId');
    localStorage.removeItem('x-access-token');
    localStorage.removeItem('x-refresh-token');
  }

  getAccessToken() {
    return localStorage.getItem('x-access-token');
  }

  getRefreshToken() {
    return localStorage.getItem('x-refresh-token');
  }

  getUserId() {
    return localStorage.getItem('userId');
  }

  setAccessToken(accessToken: string) {
    return localStorage.setItem('x-access-token', accessToken);
  }

  getNewAccessToken1() {
    return this.http
      .get(`${this.taskService.baseUrl}/users/me/access-token`, {
        headers: {
          'x-refresh-token': this.getRefreshToken() as string,
          "'_id'": this.getUserId() as string,
        },
        observe: 'response',
      })
      .pipe(
        tap((res: HttpResponse<any>) => {
          this.setAccessToken(res.headers.get('x-access-token') as string);
        })
      );
  }

  getNewAccessToken() {
    return this.http
      .get(`${this.taskService.baseUrl}/users/me/access-token`, {
        headers: {
          'x-refresh-token': this.getRefreshToken() as string,
          "'_id'": this.getUserId() as string,
        },
        observe: 'response',
      })
      .pipe(
        tap((res) => {
          this.setAccessToken(res.headers.get('x-access-token') as string);
        })
      );
  }
}
