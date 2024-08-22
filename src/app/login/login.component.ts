import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';  // Import AuthService

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    ReactiveFormsModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string | null = null;  // To store error messages

  // Inject FormBuilder, AuthService, and Router
  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    this.errorMessage = null;
    console.log('Form submitted:', this.loginForm.value);
    
    if (this.loginForm.valid) {
      const { username, password } = this.loginForm.value;
  
      this.authService.login(username, password).subscribe(
        response => {
          console.log('Login successful:', response);
  
          const role = response.role;
          const userId = response.userID;  // or response.userId, based on your convention
  
          console.log(userId);
  
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
          alert(this.errorMessage);
        }
      );
    } else {
      console.log('Form is invalid');
    }
  }
  
}
