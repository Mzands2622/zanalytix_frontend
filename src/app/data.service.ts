import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { map } from 'rxjs/operators';
import { HttpParams } from '@angular/common/http';



// interface Company {
//   companyId: string;
//   companyName: string;
// }

export interface Programmer {
  userId: number;
  programmerId: number;
  firstName: string;
  lastName: string;
  companyList: string[];
}

interface Company {
  companyId: number;
  companyName: string;
}

interface CompanyDetails {
  companyName: string;
  companyLogo: string;
  pipelineLink: string;
  categories: string[];
  scrapingObjects: ScrapingObject[];
}

interface ScrapingObject {
  objectDescription: string;
  objectFrequency: string;
  objectCode: string;
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
    return this.http.delete<any>(`${this.apiUrl}delete-notification-preference/${setId}`).pipe(
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

  getProgrammerCompanies(userId: number): Observable<Company[]> {
    return this.http.get<Company[]>(`${this.apiUrl}api/programmer-companies/${userId}`).pipe(
      catchError(this.handleError<Company[]>('getProgrammerCompanies', []))
    );
  }

  // Updated method to get company details by ID
  getCompanyDetails(companyId: string): Observable<CompanyDetails> {
    return this.http.get<CompanyDetails>(`${this.apiUrl}api/company-details/${companyId}`).pipe(
      catchError(this.handleError<CompanyDetails>('getCompanyDetails'))
    );
  }

  updateCompanyDetails(companyData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}update-company-details`, companyData);
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }

  getProgrammers(): Observable<Programmer[]> {
    return this.http.get<Programmer[]>(`${this.apiUrl}api/get-programmers`).pipe(
      map(programmers => programmers.map(p => ({
        ...p,
        userId: +p.userId, // Ensure userId is a number
        companyList: p.companyList || [] // Ensure companyList is always an array
      })))
    );
  }

  updateProgrammerCompanies(userId: number, companyList: string[]): Observable<any> {
    return this.http.post(`${this.apiUrl}api/update-programmer-companies/${userId}`, { companyList }, {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  getProgrammerContacts(userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}api/programmerContacts/${userId}`).pipe(
      catchError(this.handleError<any>('getProgrammerContacts'))
    );
  }
  
  saveProgrammerContacts(userId: number, contactData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}api/programmerContacts/${userId}`, contactData, {
      headers: { 'Content-Type': 'application/json' }
    }).pipe(
      catchError(this.handleError<any>('saveProgrammerContacts'))
    );
  }

  addCompany(companyData: { companyName: string; headquartersLocalTime: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}api/add-company`, companyData, {
      headers: { 'Content-Type': 'application/json' }
    }).pipe(
      catchError(this.handleError<any>('addCompany'))
    );
  }

  updatePreferenceSetTitle(setId: number, newTitle: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/update-preference-set-title/${setId}`, { SetTitle: newTitle });
  }

  getTreatments(searchTerm: string, searchBy: string, selectedCompanies: string[]): Observable<any> {
    let params = new HttpParams()
      .set('searchTerm', searchTerm)
      .set('searchBy', searchBy)
      .set('companies', selectedCompanies.join(','));
  
    return this.http.get<any>(`${this.apiUrl}api/treatments/search`, { params }).pipe(
      catchError(this.handleError<any>('getTreatments'))
    );
  }



}
