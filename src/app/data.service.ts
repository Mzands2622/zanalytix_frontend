import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

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
    });
  }

  deleteScrapingObject(companyId: string, objectCode: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}delete-scraping-object/${companyId}/${objectCode}`);
  }

  updateScrapingObject(companyId: string, objectCode: string, data: any): Observable<any> {
    console.log("Sending update with data:", data);
    return this.http.post(`${this.apiUrl}update-scraping-object/${companyId}/${objectCode}`, data, {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  saveOrUpdateContactPreference(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}save-or-update-contact-preference`, data, {
      headers: { 'Content-Type': 'application/json' }
    });
  }

    // New method to fetch categories from the Flask API
  getCategories(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}api/categories`);
  }

  getCompaniesByCategory(category: string): Observable<string[]> {
    console.log('Fetching companies for category:', category);
    return this.http.get<string[]>(`${this.apiUrl}api/companies?category=${category}`);
  }

    // New method to save or update notification preferences
  saveOrUpdateNotificationPreferences(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}save-or-update-notification-preferences`, data, {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  deleteNotificationPreference(setId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/delete-notification-preference/${setId}`);
  }

  getAllCompanies(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}api/all-companies`);
}

getUserPreferences(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}preferences/${userId}`).pipe(
      catchError(error => {
        if (error.status === 404) {
          // Return default preferences
          return of(this.getDefaultPreferences());
        }
        // For other errors, re-throw
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
    return this.http.get(`${this.apiUrl}/api/user-contact-information/${userId}`);
  }
  
}
