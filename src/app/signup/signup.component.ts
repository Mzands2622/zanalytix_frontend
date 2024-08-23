import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { TitleCasePipe } from '@angular/common';
import { AuthService } from '../auth.service';
import { CommonModule } from '@angular/common';
import { MatOptionModule } from '@angular/material/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    CommonModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatOptionModule,
    MatSelectModule,
    MatIconModule,
    ReactiveFormsModule,
    TitleCasePipe,
    RouterModule
  ],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
  providers: [AuthService]
})
export class SignupComponent {
  signupForm: FormGroup;
  errorMessage: string | null = null;
  roles = ['user', 'programmer', 'admin'];
  hidePassword = true;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.signupForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      role: ['', Validators.required]
    }, { validators: this.passwordsMatchValidator });
  }

  passwordsMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordsMismatch: true };
  }

  onSubmit() {
    this.errorMessage = null;  // Clear previous error message
    if (this.signupForm.valid) {
      this.authService.signup(this.signupForm.value).subscribe(
        response => {
          console.log('Sign up successful:', response);
  
          const userId = response.userID;  // Correctly access the userID
          console.log('UserId:', userId);
          const role = this.signupForm.get('role')?.value;
  
          if (!userId) {
            this.errorMessage = 'User ID is undefined. Please try signing up again.';
            return;
          }
  
          // Store the userId in AuthService
          this.authService.setUserId(userId);
          console.log('UserId set in AuthService:', this.authService.getUserId());

  
          // Navigate based on the user's role only after userId is set
          if (role === 'user') {
            this.router.navigate([`/user-console/${userId}`]);
          } else if (role === 'programmer') {
            this.router.navigate([`/programmer-console/${userId}`]);
          } else if (role === 'admin') {
            this.router.navigate([`/admin-console/${userId}`]);
          }
        },
        error => {
          console.error('Sign up error:', error);
          this.errorMessage = error.error.message;  // Store the error message
        }
      );
    }
  }
  
  
  
}
