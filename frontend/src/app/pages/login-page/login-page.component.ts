import { Component } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss'],
})
export class LoginPageComponent {
  constructor(private authService: AuthService) {}

  onClickLoginButton(email: string, password: string) {
    this.authService.login(email, password).subscribe((res) => {
      console.log(res);
      console.log('logged in');
    });
  }
}
