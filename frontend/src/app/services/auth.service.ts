import { Injectable } from '@angular/core';
import { TaskService } from './task.service';
import { shareReplay, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private taskService: TaskService) {}

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

  logout() {
    this.removeSession();
  }

  setSession(userId: string, accessToken: string, refreshToken: string) {
    localStorage.setItem('userId', userId);
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  removeSession() {
    localStorage.removeItem('userId');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  getAccessToken() {
    return localStorage.getItem('x-access-token');
  }

  getRefreshToken() {
    return localStorage.getItem('x-refresh-token');
  }

  setAccessToken(accessToken: string) {
    return localStorage.setItem('x-access-token', accessToken);
  }
}
