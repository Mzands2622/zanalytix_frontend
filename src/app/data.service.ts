import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

interface Company {
  companyId: string;
  companyName: string;
}

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private apiUrl = 'http://localhost:5000/'; 

  constructor(private http: HttpClient) {}

  // Existing methods for scraping objects
  submitScrapingObject(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}add-scraping-object`, data, {
      headers: { 'Content-Type': 'application/json' }
    }).pipe(
      catchError(this.handleError<any>('submitScrapingObject'))
    );
  }

  deleteScrapingObject(companyId: string, objectCode: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}delete-scraping-object/${companyId}/${objectCode}`).pipe(
      catchError(this.handleError<any>('deleteScrapingObject'))
    );
  }

  updateScrapingObject(companyId: string, objectCode: string, data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}update-scraping-object/${companyId}/${objectCode}`, data, {
      headers: { 'Content-Type': 'application/json' }
    }).pipe(
      catchError(this.handleError<any>('updateScrapingObject'))
    );
  }
  
  saveOrUpdateContactPreference(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}save-or-update-contact-preference`, data, {
      headers: { 'Content-Type': 'application/json' }
    }).pipe(
      catchError(this.handleError<any>('saveOrUpdateContactPreference'))
    );
  }

  // New method to fetch categories from the Flask API
  getCategories(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}api/categories`).pipe(
      catchError(this.handleError<string[]>('getCategories', []))
    );
  }

  getCompaniesByCategory(category: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}api/companies?category=${category}`).pipe(
      catchError(this.handleError<string[]>('getCompaniesByCategory', []))
    );
  }

  // New method to save or update notification preferences
  saveOrUpdateNotificationPreferences(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}save-or-update-notification-preferences`, data, {
      headers: { 'Content-Type': 'application/json' }
    }).pipe(
      catchError(this.handleError<any>('saveOrUpdateNotificationPreferences'))
    );
  }

  deleteNotificationPreference(setId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/delete-notification-preference/${setId}`).pipe(
      catchError(this.handleError<any>('deleteNotificationPreference'))
    );
  }

  getAllCompanies(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}api/all-companies`).pipe(
      catchError(this.handleError<string[]>('getAllCompanies', []))
    );
  }

  getUserPreferences(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}preferences/${userId}`).pipe(
      catchError(error => {
        if (error.status === 404) {
          return of(this.getDefaultPreferences());
        }
        throw error;
      })
    );
  }

  private getDefaultPreferences() {
    return {
      firstName: '',
      lastName: '',
      Priority: '3',
      contacts: [],
      preferredContacts: [],
      categories: {},
      companies: {},
      infoTypes: {},
      TherapyApproval: false,
      IndicationChange: false,
      EarningsReport: false,
      MAndA: false,
      Layoffs: false,
      NewHires: false
    };
  }

  getUserContactInformation(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/api/user-contact-information/${userId}`).pipe(
      catchError(this.handleError<any>('getUserContactInformation'))
    );
  }

  // New methods for company details section logic
  getProgrammerCompanies(userId: number): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}api/programmer-companies/${userId}`);
  }

  getCompanyDetails(companyName: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}api/company-details/${companyName}`).pipe(
      catchError(this.handleError<any>('getCompanyDetails'))
    );
  }

  updateCompanyDetails(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}api/update-company-details`, data, {
      headers: { 'Content-Type': 'application/json' }
    }).pipe(
      catchError(this.handleError<any>('updateCompanyDetails'))
    );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }
}
