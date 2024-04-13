import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss'],
})
export class LoginPageComponent {
  constructor(private authService: AuthService, private router: Router) {}

  onClickLoginButton(email: string, password: string) {
    this.authService.login(email, password).subscribe((res) => {
      if (res.status === 200) {
        this.router.navigate(['lists']);
      } else {
        alert('Wrong email or password!!!');
      }
    });
  }
}
