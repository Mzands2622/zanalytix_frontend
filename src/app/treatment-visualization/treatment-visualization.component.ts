import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { DataService } from '../data.service';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-treatment-visualization',
  templateUrl: './treatment-visualization.component.html',
  styleUrls: ['./treatment-visualization.component.css'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatMenuModule,
    MatIconModule
  ]
})
export class TreatmentVisualizationComponent implements OnInit {
  searchTerm: string = '';
  searchCategory: string = 'treatment_name';
  phases: string[] = ['Phase 1', 'Phase 2', 'Phase 3', 'Registration', 'Other'];  // Added 'Registration'
  filteredTreatments: { [key: string]: any[] } = {};
  companies: string[] = [];
  selectedCompanies: string[] = [];

  userId: string | null = null;

  constructor(
    private dataService: DataService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // Capture the userId from the route parameters
    this.route.paramMap.subscribe(params => {
      this.userId = params.get('userId');
      if (this.userId) {
        // You can use this.userId to make API calls or for other purposes
        console.log('User ID:', this.userId);
        // Initialize your component data here
        this.loadCompanies();
        // ... other initialization code
      } else {
        console.error('No user ID provided');
        // Handle the case where no user ID is provided, perhaps redirect to login
      }
    });
  }

  isAllSelected(): boolean {
    return this.selectedCompanies.length === this.companies.length;
  }


  loadCompanies() {
    this.dataService.getAllCompanies().subscribe(
      data => {
        this.companies = data;
      },
      error => {
        console.error('Error fetching companies:', error);
      }
    );
  }

  toggleAllCompanies(checked: boolean) {
    this.selectedCompanies = checked ? [...this.companies] : [];
  }

  isSomeSelected(): boolean {
    return this.selectedCompanies.length > 0 && !this.isAllSelected();
  }

  
  

  searchTreatments() {
    this.dataService.getTreatments(this.searchTerm, this.searchCategory, this.selectedCompanies)
      .subscribe(
        data => {
          this.phases.forEach(phase => {
            this.filteredTreatments[phase] = data[phase] || [];
          });
        },
        error => {
          console.error('Error fetching treatments:', error);
        }
      );
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  
  getEnglishText(jsonString: string): string {
    try {
      const parsedArray: { en?: string }[] = JSON.parse(jsonString);
      const englishText = parsedArray.find((item: { en?: string }) => item.en)?.en || '';
      return englishText;
    } catch (error) {
      console.error('Error parsing JSON:', error);
      return '';
    }
  }

  logout(): void {
    // Implement logout logic here
    this.router.navigate(['/login']);
  }

  goToMainConsole(): void {
    if (this.userId) {
      this.router.navigate(['/user-console', this.userId]);
    } else {
      console.error('No user ID available for navigation');
      // Handle this case, perhaps by redirecting to a default page
    }
  }

}