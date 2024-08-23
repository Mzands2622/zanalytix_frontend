import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatCheckboxModule,
    ReactiveFormsModule,
    RouterModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string | null = null;
  hidePassword = true;  // For password visibility toggle

  constructor(
    private fb: FormBuilder, 
    private authService: AuthService, 
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      rememberMe: [false]  // New form control for "Remember me" checkbox
    });
  }

  onSubmit() {
    this.errorMessage = null;
    console.log('Form submitted:', this.loginForm.value);
    
    if (this.loginForm.valid) {
      const { username, password, rememberMe } = this.loginForm.value;
  
      this.authService.login(username, password).subscribe(
        response => {
          console.log('Login successful:', response);
  
          const role = response.role;
          const userId = response.userID;
  
          console.log(userId);
  
          // Handle "Remember me" functionality
          if (rememberMe) {
            // Implement remember me logic (e.g., store token in local storage)
          }
  
          if (role === 'user') {
            this.router.navigate([`/user-console/${userId}`]);
          } else if (role === 'programmer') {
            this.router.navigate([`/programmer-console/${userId}`]);
          } else if (role === 'admin') {
            this.router.navigate([`/admin-console/${userId}`]);
          }
        },
        error => {
          console.error('Login failed:', error);
          this.errorMessage = error.error.message || 'Login failed. Please try again.';
        }
      );
    } else {
      console.log('Form is invalid');
    }
  }

  // New method to handle "Forgot password" functionality
  onForgotPassword() {
    // Implement forgot password logic
    console.log('Forgot password clicked');
  }
}