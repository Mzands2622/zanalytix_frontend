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

interface ScrapingObject {
  objectDescription: string;
  objectFrequency: string;
  objectCode: string;
}

interface Company {
  companyId: number;
  companyName: string;
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
    MatListModule         
  ],
  standalone: true
})
export class ProgrammerConsoleComponent implements OnInit {
  companyForm = new FormGroup({
    companyId: new FormControl(''),  // Dropdown for selecting the company
    companyLogo: new FormControl(''),
    pipelineLink: new FormControl(''),
    categories: new FormControl([]),
    objectDescription: new FormControl(''),
    objectFrequency: new FormControl(''),
    customCron: new FormControl(''),
    objectCode: new FormControl('')
  });

  scrapingObjects: ScrapingObject[] = [];
  customCronVisible: boolean = false;
  selectedObjectIndex: number | null = null;

  categoriesList: string[] = [];
  companies: Company[] = [];  // List of companies associated with the programmer
  userId: number | null = null;
  selectedCompanyName: string | null = null; // Property to hold selected company name


  constructor(
    private dataService: DataService, 
    private snackBar: MatSnackBar,
    private route: ActivatedRoute  
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
            next: (companyNames: string[]) => {
                console.log('Fetched companies:', companyNames); // Log fetched companies
                this.companies = companyNames.map((name, index) => ({
                    companyId: index + 1, // Assuming the index can be used as the ID, or change it according to your logic
                    companyName: name
                })) as Company[];
            },
            error: (error) => {
                console.error('Failed to load companies', error);
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
      }
    });
  }

  onCompanySelect(): void {
    const selectedCompanyId = this.companyForm.get('companyId')?.value;

    if (selectedCompanyId) {
        this.dataService.getCompanyDetails(selectedCompanyId).subscribe({
            next: (companyDetails) => {
                this.selectedCompanyName = companyDetails.companyName; 
                this.companyForm.patchValue({
                    companyLogo: companyDetails.companyLogo,
                    pipelineLink: companyDetails.pipelineLink,
                    categories: companyDetails.categories,
                });
            },
            error: (error) => {
                console.error('Failed to load company details', error);
            }
        });
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
      error: (error) => console.error('Failed to update company details', error)
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
        const rruleString = this.constructRRule(formValue);
        const scrapingObject: ScrapingObject = {
            objectDescription: formValue.objectDescription ?? "",
            objectFrequency: rruleString,
            objectCode: formValue.objectCode ?? ""
        };

        const payload = {
            companyId: formValue.companyId,
            scrapingObject: scrapingObject,
            categories: formValue.categories,
            companyName: this.selectedCompanyName,
            companyLogo: formValue.companyLogo,
            pipelineLink: formValue.pipelineLink
        };

        console.log('Payload to be sent:', payload);

        if (this.selectedObjectIndex !== null) {
            this.scrapingObjects[this.selectedObjectIndex] = scrapingObject;
            this.dataService.updateScrapingObject(formValue.companyId ?? '', scrapingObject.objectCode, payload).subscribe({
                next: (response) => {
                    console.log('Update successful', response);
                    this.snackBar.open('Object updated successfully!', 'Close', { duration: 3000 });
                },
                error: (error) => console.error('Failed to update data', error)
            });

            this.selectedObjectIndex = null;
        } else {
            this.scrapingObjects.push(scrapingObject);
            this.dataService.submitScrapingObject(payload).subscribe({
                next: (response) => {
                    console.log('Submission successful', response);
                    this.snackBar.open('Object saved successfully!', 'Close', { duration: 3000 });
                },
                error: (error) => console.error('Failed to submit data', error)
            });
        }
    } else {
        console.error('Form is not valid');
    }
}


  deleteObject(companyId: string, objectCode: string): void {
    this.scrapingObjects = this.scrapingObjects.filter(obj => obj.objectCode !== objectCode);
    this.dataService.deleteScrapingObject(companyId, objectCode).subscribe({
      next: (response) => {
        console.log('Object deleted successfully', response);
        this.snackBar.open('Object deleted successfully!', 'Close', { duration: 3000 });
      },
      error: (error) => console.error('Failed to delete object', error)
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
}
