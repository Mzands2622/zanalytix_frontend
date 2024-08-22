import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { DataService } from '../data.service';
import { CommonModule } from '@angular/common';
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
    companyId: new FormControl(''),
    companyName: new FormControl(''),
    headquartersLocalTime: new FormControl(''),
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

  constructor(private dataService: DataService, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.loadCategories();
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

      if (this.selectedObjectIndex !== null) {
        // Update existing object
        this.scrapingObjects[this.selectedObjectIndex] = scrapingObject;

        if (formValue.companyId && scrapingObject.objectCode) {
          this.dataService.updateScrapingObject(formValue.companyId, scrapingObject.objectCode, {
            companyId: formValue.companyId,
            companyName: formValue.companyName,
            headquartersLocalTime: formValue.headquartersLocalTime,
            scrapingObject: scrapingObject,
            categories: formValue.categories
          }).subscribe({
            next: (response) => {
              console.log('Update successful', response);
              this.snackBar.open('Object updated successfully!', 'Close', { duration: 3000 });
            },
            error: (error) => console.error('Failed to update data', error)
          });
        } else {
          console.error('Company ID or Object Code is missing');
        }

        this.selectedObjectIndex = null;
      } else {
        // Add new object
        this.scrapingObjects.push(scrapingObject);
        this.dataService.submitScrapingObject({
          companyId: formValue.companyId,
          companyName: formValue.companyName,
          headquartersLocalTime: formValue.headquartersLocalTime,
          scrapingObject: scrapingObject,
          categories: formValue.categories
        }).subscribe({
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
      companyName: this.companyForm.value.companyName,
      headquartersLocalTime: this.companyForm.value.headquartersLocalTime
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
