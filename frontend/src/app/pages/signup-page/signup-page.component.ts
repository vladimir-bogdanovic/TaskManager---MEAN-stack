import { Component } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-signup-page',
  templateUrl: './signup-page.component.html',
  styleUrls: ['./signup-page.component.scss'],
})
export class SignupPageComponent {
  constructor(private authService: AuthService) {}

  onClickSignupButton(email: string, password: string) {
    this.authService.signup(email, password).subscribe((res) => {
      console.log(res);
      console.log('Sign-up successfully and now logged in!');
    });
  }
}
