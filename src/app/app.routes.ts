import { Routes } from '@angular/router';
import { HomepageComponent } from './homepage/homepage.component';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { UserConsoleComponent } from './user-console/user-console.component';
import { ProgrammerConsoleComponent } from './programmer-console/programmer-console.component';
import { AdminConsoleComponent } from './admin-console/admin-console.component';
import { ProgrammerContactComponent } from './programmer-contact/programmer-contact.component';
import { TreatmentVisualizationComponent } from './treatment-visualization/treatment-visualization.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';  // Import the ResetPasswordComponent

export const routes: Routes = [
  { path: '', component: HomepageComponent },  // Default route
  { path: 'login', component: LoginComponent },  // Login route
  { path: 'signup', component: SignupComponent },  // Sign-up route
  { path: 'user-console/:userId', component: UserConsoleComponent },  // User console with dynamic userId
  { path: 'programmer-console/:userId', component: ProgrammerConsoleComponent },  // Programmer console with dynamic userId
  { path: 'admin-console/:userId', component: AdminConsoleComponent },  // Admin console with dynamic userId
  { path: 'programmer-contact/:userId', component: ProgrammerContactComponent },
  { path: 'user-console/:userId', component: UserConsoleComponent },
  { path: 'treatment-visualization/:userId', component: TreatmentVisualizationComponent },  // Add other routes here as needed
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password/:token', component: ResetPasswordComponent }  // Ensure this component is imported
];
