import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { FormsModule } from '@angular/forms';  // Import FormsModule
import { CommonModule } from '@angular/common';  // Import CommonModule

@Component({
  selector: 'app-reset-password',
  standalone: true,
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css'],
  imports: [FormsModule, CommonModule]  // Include FormsModule and CommonModule in the imports array
})
export class ResetPasswordComponent {
  newPassword: string = '';
  confirmPassword: string = '';
  token: string | null = null;
  message: string = '';

  constructor(private authService: AuthService, private route: ActivatedRoute, private router: Router) {
    // Get the token from the URL
    this.token = this.route.snapshot.paramMap.get('token');
  }

  onSubmit(): void {
    if (this.newPassword !== this.confirmPassword) {
      this.message = 'Passwords do not match.';
      return;
    }

    if (this.token) {
      this.authService.resetPassword(this.token, this.newPassword).subscribe({
        next: (response) => {
          console.log('Password reset successfully', response);
          this.message = 'Your password has been reset successfully. You can now log in.';
          this.router.navigate(['/login']);  // Optionally redirect to the login page
        },
        error: (error) => {
          console.error('Error resetting password', error);
          this.message = 'There was an issue resetting your password. Please try again later.';
        }
      });
    } else {
      this.message = 'Invalid or missing token.';
    }
  }
}
