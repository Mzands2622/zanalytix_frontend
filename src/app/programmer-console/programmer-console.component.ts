import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { DataService } from '../data.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';  
import { RRule, Frequency } from 'rrule';

// Import Angular Material modules
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';

interface ScrapingObject {
  objectDescription: string;
  objectFrequency: string;
  objectCode: string;
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

@Component({
  selector: 'app-programmer-console',
  templateUrl: './programmer-console.component.html',
  styleUrls: ['./programmer-console.component.css'],
  imports: [
    ReactiveFormsModule,
    CommonModule,
    MatInputModule,       
    MatFormFieldModule,   
    MatSelectModule,      
    MatButtonModule,      
    MatCardModule,
    MatMenuModule,
    MatIconModule,        
    MatListModule,
    MatSidenavModule,
    RouterModule         
  ],
  standalone: true
})
export class ProgrammerConsoleComponent implements OnInit {
  companyForm = new FormGroup({
    companyId: new FormControl(''),
    companyLogo: new FormControl(''),
    pipelineLink: new FormControl(''),
    categories: new FormControl<string[]>([]),
    objectDescription: new FormControl(''),
    objectFrequency: new FormControl(''),
    customCron: new FormControl(''),
    objectCode: new FormControl('')
  });

  scrapingObjects: ScrapingObject[] = [];
  customCronVisible: boolean = false;
  selectedObjectIndex: number | null = null;

  categoriesList: string[] = [];
  companies: Company[] = [];
  userId: number | null = null;
  selectedCompanyName: string | null = null;

  constructor(
    private dataService: DataService, 
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const userIdStr = this.route.snapshot.paramMap.get('userId');
    this.userId = userIdStr ? +userIdStr : null;
  
    if (this.userId !== null) {
      this.loadCompanies();
    }

    this.loadCategories();
  }

  loadCompanies(): void {
    if (this.userId !== null) {
      this.dataService.getProgrammerCompanies(this.userId).subscribe({
        next: (companies: Company[]) => {
          console.log('Fetched companies:', companies);
          this.companies = companies;
        },
        error: (error) => {
          console.error('Failed to load companies', error);
          this.snackBar.open('Failed to load companies', 'Close', { duration: 3000 });
        }
      });
    }
  }

  loadCategories(): void {
    this.dataService.getCategories().subscribe({
      next: (categories) => {
        this.categoriesList = categories;
      },
      error: (error) => {
        console.error('Failed to load categories', error);
        this.snackBar.open('Failed to load categories', 'Close', { duration: 3000 });
      }
    });
  }

  onCompanySelect(): void {
    const selectedCompanyId = this.companyForm.get('companyId')?.value;
    console.log('Selected company ID:', selectedCompanyId);
  
    // Cancel any ongoing edits
    this.selectedObjectIndex = null;
  
    // Reset scraping object fields
    this.companyForm.patchValue({
      objectDescription: '',
      objectFrequency: '',
      customCron: '',
      objectCode: ''
    });
  
    // Reset custom cron visibility
    this.customCronVisible = false;
  
    if (selectedCompanyId) {
      const selectedCompany = this.companies.find(c => c.companyId === +selectedCompanyId);
      if (selectedCompany) {
        console.log('Selected company:', selectedCompany);
        this.dataService.getCompanyDetails(selectedCompany.companyId.toString()).subscribe({
          next: (companyDetails: CompanyDetails) => {
            console.log('Received company details:', companyDetails);
            if (companyDetails && companyDetails.companyName) {
              this.selectedCompanyName = companyDetails.companyName;
              this.companyForm.patchValue({
                companyLogo: companyDetails.companyLogo || '',
                pipelineLink: companyDetails.pipelineLink || '',
                categories: companyDetails.categories || [],
              });
        
              this.scrapingObjects = companyDetails.scrapingObjects || [];
            } else {
              console.error('Received invalid company details:', companyDetails);
              this.snackBar.open('Failed to load company details', 'Close', { duration: 3000 });
            }
          },
          error: (error) => {
            console.error('Failed to load company details', error);
            this.snackBar.open('Failed to load company details', 'Close', { duration: 3000 });
          }
        });
      } else {
        console.error('Selected company not found');
        this.snackBar.open('Selected company not found', 'Close', { duration: 3000 });
      }
    }
  }

  saveChanges(): void {
    const updatedCompanyData = {
      companyId: this.companyForm.get('companyId')?.value,
      companyLogo: this.companyForm.get('companyLogo')?.value,
      pipelineLink: this.companyForm.get('pipelineLink')?.value,
      categories: this.companyForm.get('categories')?.value,
    };

    this.dataService.updateCompanyDetails(updatedCompanyData).subscribe({
      next: (response) => {
        console.log('Update successful', response);
        this.snackBar.open('Company details updated successfully!', 'Close', { duration: 3000 });
      },
      error: (error) => {
        console.error('Failed to update company details', error);
        this.snackBar.open('Failed to update company details', 'Close', { duration: 3000 });
      }
    });
  }

  onFrequencyChange() {
    const frequency = this.companyForm.get('objectFrequency')?.value;
    this.customCronVisible = frequency === 'custom';
  }

  editObject(index: number): void {
    const object = this.scrapingObjects[index];
    this.companyForm.patchValue({
      objectDescription: object.objectDescription,
      objectFrequency: object.objectFrequency,
      objectCode: object.objectCode
    });
    this.selectedObjectIndex = index;
  }

  constructRRule(formValue: any): string {
    if (formValue.objectFrequency === 'CUSTOM') {
      return formValue.customCron ?? "";
    }

    const frequencyMap: { [key: string]: Frequency } = {
      MINUTELY: RRule.MINUTELY,
      HOURLY: RRule.HOURLY,
      DAILY: RRule.DAILY,
      WEEKLY: RRule.WEEKLY,
      MONTHLY: RRule.MONTHLY,
      YEARLY: RRule.YEARLY,
    };

    const options = {
      freq: frequencyMap[formValue.objectFrequency],
      interval: 1,
      dtstart: new Date()
    };

    const rule = new RRule(options);
    return rule.toString();
  }

  onSubmit(): void {
    if (this.companyForm.valid) {
      const formValue = this.companyForm.value;

      if (this.isScrapingObjectPartiallyFilled()) {
        this.snackBar.open('Please fill all fields for the scraping object or clear all fields', 'Close', { duration: 5000 });
        return;
      }

      // Check for duplicate object code before any submission
      if (formValue.objectCode) {
        const existingObject = this.scrapingObjects.find(obj => obj.objectCode === formValue.objectCode);
        if (existingObject) {
          this.snackBar.open('A scraping object with this code already exists. Please use a different code.', 'Close', { duration: 5000 });
          return; // Exit the method early, preventing any submission
        }
      }

      const updatedCompanyData = {
        companyId: formValue.companyId,
        companyLogo: formValue.companyLogo,
        pipelineLink: formValue.pipelineLink,
        categories: formValue.categories,
      };

      this.dataService.updateCompanyDetails(updatedCompanyData).subscribe({
        next: (response) => {
          console.log('Company details update successful', response);

          if (formValue.objectDescription && formValue.objectFrequency && formValue.objectCode) {
            this.processScrapingObject(formValue);
          } else {
            this.snackBar.open('Company details updated successfully!', 'Close', { duration: 3000 });
            this.resetScrapingObjectForm();
          }
        },
        error: (error) => {
          console.error('Failed to update company details', error);
          this.snackBar.open('Failed to update company details', 'Close', { duration: 3000 });
        }
      });
    } else {
      console.error('Form is not valid');
      this.snackBar.open('Please fill all required fields', 'Close', { duration: 3000 });
    }
  }

  private processScrapingObject(formValue: any): void {
    const rruleString = this.constructRRule(formValue);
    const scrapingObject: ScrapingObject = {
      objectDescription: formValue.objectDescription,
      objectFrequency: rruleString,
      objectCode: formValue.objectCode
    };
  
    const payload = {
      companyId: formValue.companyId,
      scrapingObject: scrapingObject,
      categories: formValue.categories,
      companyName: this.selectedCompanyName,
      companyLogo: formValue.companyLogo,
      pipelineLink: formValue.pipelineLink
    };
  
    if (this.selectedObjectIndex !== null) {
      this.updateScrapingObject(payload);
    } else {
      this.addScrapingObject(payload);
    }
  }

  private updateScrapingObject(payload: any): void {
    this.dataService.updateScrapingObject(payload.companyId, payload.scrapingObject.objectCode, payload).subscribe({
      next: (response) => {
        console.log('Update successful', response);
        this.snackBar.open('Details updated successfully!', 'Close', { duration: 3000 });
        if (this.selectedObjectIndex !== null && this.selectedObjectIndex >= 0) {
          this.scrapingObjects[this.selectedObjectIndex] = payload.scrapingObject;
        }
        this.resetScrapingObjectForm();
      },
      error: (error) => {
        console.error('Failed to update data', error);
        this.snackBar.open('Failed to update object', 'Close', { duration: 3000 });
      }
    });
  }

  private addScrapingObject(payload: any): void {
    this.dataService.submitScrapingObject(payload).subscribe({
      next: (response) => {
        console.log('Submission successful', response);
        this.snackBar.open('Details updated successfully!', 'Close', { duration: 3000 });
        this.scrapingObjects.push(payload.scrapingObject);
        this.resetScrapingObjectForm();
      },
      error: (error) => {
        console.error('Failed to submit data', error);
        this.snackBar.open('Failed to save object', 'Close', { duration: 3000 });
      }
    });
  }
  private resetScrapingObjectForm(): void {
    this.companyForm.patchValue({
      objectDescription: '',
      objectFrequency: '',
      customCron: '',
      objectCode: ''
    });
    this.customCronVisible = false;
    this.selectedObjectIndex = null;
  }

  


  deleteObject(companyId: string, objectCode: string): void {
    this.scrapingObjects = this.scrapingObjects.filter(obj => obj.objectCode !== objectCode);
    this.dataService.deleteScrapingObject(companyId, objectCode).subscribe({
      next: (response) => {
        console.log('Object deleted successfully', response);
        this.snackBar.open('Object deleted successfully!', 'Close', { duration: 3000 });
      },
      error: (error) => {
        console.error('Failed to delete object', error);
        this.snackBar.open('Failed to delete object', 'Close', { duration: 3000 });
      }
    });
  }

  cancelEdit(): void {
    this.companyForm.reset({
      companyId: this.companyForm.value.companyId,
    });
    this.companyForm.patchValue({
      objectDescription: '',
      objectFrequency: '',
      customCron: '',
      objectCode: ''
    });
    this.selectedObjectIndex = null;
  }

  logout(): void {
    this.router.navigate(['/login']);
  }

  isScrapingObjectPartiallyFilled(): boolean {
    const description = this.companyForm.get('objectDescription')?.value;
    const frequency = this.companyForm.get('objectFrequency')?.value;
    const code = this.companyForm.get('objectCode')?.value;
    
    return !!(description || frequency || code) && !(description && frequency && code);
  }

}