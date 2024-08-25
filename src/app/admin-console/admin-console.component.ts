import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { DataService } from '../data.service';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';


export interface Programmer {
  userId: number;
  programmerId: number;
  firstName: string;
  lastName: string;
  companyList: string[];
}

@Component({
  selector: 'app-admin-console',
  templateUrl: './admin-console.component.html',
  styleUrls: ['./admin-console.component.css'],
  imports: [
    ReactiveFormsModule,
    CommonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatMenuModule,
    MatIconModule
  ],
  standalone: true
})
export class AdminConsoleComponent implements OnInit {
  companyForm: FormGroup;
  programmerAssignmentForm: FormGroup;
  programmers: Programmer[] = [];
  companies: string[] = [];
  selectedProgrammer: Programmer | null = null;

  constructor(
    private dataService: DataService,
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.companyForm = this.fb.group({
      companyName: [''],
      headquartersLocalTime: ['']
    });
  
    this.programmerAssignmentForm = this.fb.group({
      selectedProgrammer: [''],
      assignedCompanies: [{ value: [], disabled: true }]
    });
  }

  ngOnInit(): void {
    this.loadProgrammers();
    this.loadCompanies();
  }

  loadProgrammers(): void {
    this.dataService.getProgrammers().subscribe({
      next: (programmers) => {
        console.log('Loaded programmers:', programmers);
        this.programmers = programmers;
      },
      error: (error) => {
        console.error('Failed to load programmers', error);
      }
    });
  }

  loadCompanies(): void {
    this.dataService.getAllCompanies().subscribe({
      next: (companies) => {
        this.companies = companies;
      },
      error: (error) => {
        console.error('Failed to load companies', error);
      }
    });
  }

  onCompanySubmit(): void {
    const companyData = this.companyForm.value;
    this.dataService.addCompany(companyData).subscribe({
      next: (response) => {
        console.log('Company inserted successfully', response);
        this.snackBar.open('Company inserted successfully!', 'Close', { duration: 3000 });
        this.loadCompanies();
        this.companyForm.reset();
      },
      error: (error) => console.error('Failed to insert company', error)
    });
  }

  onProgrammerSelect(): void {
    const selectedProgrammerId = this.programmerAssignmentForm.get('selectedProgrammer')?.value;
    console.log('Selected Programmer ID:', selectedProgrammerId);
  
    if (selectedProgrammerId) {
      this.selectedProgrammer = this.programmers.find(p => p.userId === +selectedProgrammerId) || null;
      console.log('Found Programmer:', this.selectedProgrammer);
  
      if (this.selectedProgrammer && this.selectedProgrammer.companyList) {
        console.log('Programmer Company List:', this.selectedProgrammer.companyList);
        this.programmerAssignmentForm.get('assignedCompanies')?.setValue(this.selectedProgrammer.companyList);
        this.programmerAssignmentForm.get('assignedCompanies')?.enable(); // Enable the control
      } else {
        console.warn('Selected programmer not found or has no company list');
        this.programmerAssignmentForm.get('assignedCompanies')?.setValue([]);
        this.programmerAssignmentForm.get('assignedCompanies')?.enable(); // Enable the control
      }
    } else {
      console.log('No programmer selected');
      this.selectedProgrammer = null;
      this.programmerAssignmentForm.get('assignedCompanies')?.setValue([]);
      this.programmerAssignmentForm.get('assignedCompanies')?.disable(); // Disable the control
    }
  }
  

  onProgrammerAssign(): void {
    if (this.selectedProgrammer) {
      const selectedCompanies = this.programmerAssignmentForm.get('assignedCompanies')?.value;

      this.dataService.updateProgrammerCompanies(this.selectedProgrammer.userId, selectedCompanies).subscribe({
        next: (response) => {
          console.log('Companies assigned successfully', response);
          this.snackBar.open('Companies assigned successfully!', 'Close', { duration: 3000 });
          this.loadProgrammers(); // Refresh programmer list to get updated assignments
        },
        error: (error) => console.error('Failed to assign companies', error)
      });
    } else {
      console.error('No programmer selected');
    }
  }

  logout(): void {
    // Clear any stored user data (if applicable)
    // Redirect to the login page
    this.router.navigate(['/login']);
  }
}