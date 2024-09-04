import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';  // Adjust the path if necessary

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css'],
  imports: [FormsModule, CommonModule],
})
export class ForgotPasswordComponent {
  email: string = '';
  message: string = '';  // To hold the confirmation message
  isSubmitted: boolean = false;  // Add a flag to track submission status

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(): void {
    if (this.email) {
      this.authService.forgotPassword(this.email).subscribe({
        next: (response) => {
          this.isSubmitted = true;  // Set the flag to true upon successful submission
          this.message = 'If you submitted a valid email, a link and token were sent to your address.';
        },
        error: (error) => {
          this.message = 'There was an issue with your request. Please try again later.';
          console.error('Error sending email', error);
        }
      });
    }
  }
}
