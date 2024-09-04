import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

// Define the interface for the login response
interface LoginResponse {
  role: 'user' | 'programmer' | 'admin';
  userID: string;  // Change to userID if you prefer PascalCase
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticated = false;
  private userRole: 'user' | 'programmer' | 'admin' | null = null;
  private userId: string | null = null;
  private baseUrl = 'http://localhost:5000/';  // Your Flask API base URL

  constructor(private router: Router, private http: HttpClient) {}

  // Sign-Up Method
  signup(userData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/signup`, userData);  // Correctly using POST
  }

  // Login Method
  login(username: string, password: string): Observable<LoginResponse> {
    const loginData = { username, password };
    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, loginData).pipe(
      tap(response => {
        this.isAuthenticated = true;
        this.userRole = response.role;
        this.userId = response.userID;  // Change to response.userId if using camelCase
      })
    );
  }

  logout(): void {
    this.isAuthenticated = false;
    this.userRole = null;
    this.userId = null;
    this.router.navigate(['/login']);
  }

  getRole(): string | null {
    return this.userRole;
  }

  isLoggedIn(): boolean {
    return this.isAuthenticated;
  }

  getUserId(): string | null {
    return this.userId;
  }

  setUserId(userId: string): void {
    this.userId = userId;
  }

  forgotPassword(email: string): Observable<any> {
    const url = `${this.baseUrl}forgot-password`;
    return this.http.post(url, { email });
  }


  resetPassword(token: string, password: string): Observable<any> {
    const url = `${this.baseUrl}reset-password/${token}`;
    return this.http.post(url, { password });
  }
}
