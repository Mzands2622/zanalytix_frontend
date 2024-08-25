import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormControl, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';  
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { DataService } from '../data.service';
import { MatOptionModule } from '@angular/material/core';
import { forkJoin } from 'rxjs';
import { AuthService } from '../auth.service';
import { ActivatedRoute } from '@angular/router';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ChangeDetectorRef } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { AbstractControl } from '@angular/forms';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component'; // Adjust the path as needed
import { MatDialogModule } from '@angular/material/dialog';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';


@Component({
  selector: 'app-user-console',
  templateUrl: './user-console.component.html',
  styleUrls: ['./user-console.component.css'],
  standalone: true,
  imports: [
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatCheckboxModule,
    MatIconModule,
    MatDividerModule,
    CommonModule,
    ReactiveFormsModule,
    MatOptionModule,
    MatSlideToggleModule,
    MatExpansionModule,
    FormsModule,
    MatDialogModule,
    MatMenuModule
  ],
})
export class UserConsoleComponent implements OnInit {
  contactForm: FormGroup;
  categoryList: string[] = [];
  companyList: string[] = [];
  infoTypeList: string[] = [];
  formSubmitted: boolean = false;
  userID: string | null = null;
  editingStates: boolean[] = [];
  editingContactInfo: boolean = false;
  originalPreferenceSets: any[] = [];
  originalContactInfo: {
    firstName: string;
    lastName: string;
    contacts: any[];
  } | null = null;
  editingTitle: number | null = null;
  searchTerm: string = '';
  filteredPreferenceSets: FormGroup[] = [];



  constructor(
    private fb: FormBuilder, 
    private dataService: DataService, 
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,  // Inject MatDialog here
    private router: Router

  ) {
    this.contactForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      preferenceSets: this.fb.array([]),
      contacts: this.fb.array([])  // Initialize contacts FormArray here
    });
  }

  ngOnInit(): void {
    console.log('ngOnInit started');
    this.route.paramMap.subscribe(params => {
      console.log('Route params:', params);
      const userId = params.get('userId');
      this.userID = userId;
      console.log('UserID set:', this.userID);
      
      if (userId) {
        this.authService.setUserId(userId);
        console.log('UserId set in AuthService:', userId);
  
        // Initialize categories first
        this.loadCategories(() => {
          console.log('Categories loaded, calling loadPreferences');
          // After categories are loaded, initialize preferences
          this.loadPreferences(userId);
        });
      } else {
        console.error('No user ID available in route parameters.');
        this.snackBar.open('Error: User not authenticated.', 'Close', { duration: 3000 });
      }
    });
    this.filteredPreferenceSets = this.preferenceSets.controls as FormGroup[];

  }

  getCategoryErrorMessage(index: number): string {
    const preferenceSet = this.getPreferenceSetAsFormGroup(index);
    const categoriesGroup = preferenceSet.get('categories') as FormGroup;
    return Object.values(categoriesGroup.value).some(value => value === true) 
      ? '' : 'Please select at least one category.';
  }
  
  getCompanyErrorMessage(index: number): string {
    const preferenceSet = this.getPreferenceSetAsFormGroup(index);
    const companiesGroup = preferenceSet.get('companies') as FormGroup;
    return Object.values(companiesGroup.value).some(value => value === true) 
      ? '' : 'Please select at least one company.';
  }
  
  getInfoTypeErrorMessage(index: number): string {
    const preferenceSet = this.getPreferenceSetAsFormGroup(index);
    const infoTypesGroup = preferenceSet.get('infoTypes') as FormGroup;
    return Object.values(infoTypesGroup.value).some(value => value === true) 
      ? '' : 'Please select at least one information type.';
  }
  
  getDetailsErrorMessage(index: number): string {
    const preferenceSet = this.getPreferenceSetAsFormGroup(index);
    const infoTypesGroup = preferenceSet.get('infoTypes') as FormGroup;
    let errorMessage = '';
  
    if (infoTypesGroup.get('Pipeline Info')?.value) {
      const pipelineDetails = preferenceSet.get('pipelineDetails') as FormGroup;
      if (!Object.values(pipelineDetails.value).some(value => value === true)) {
        errorMessage += 'Please select at least one pipeline detail. ';
      }
    }
    if (infoTypesGroup.get('Financial Info')?.value) {
      const financialDetails = preferenceSet.get('financialDetails') as FormGroup;
      if (!Object.values(financialDetails.value).some(value => value === true)) {
        errorMessage += 'Please select at least one financial detail. ';
      }
    }
    if (infoTypesGroup.get('Personnel Info')?.value) {
      const personnelDetails = preferenceSet.get('personnelDetails') as FormGroup;
      if (!Object.values(personnelDetails.value).some(value => value === true)) {
        errorMessage += 'Please select at least one personnel detail. ';
      }
    }
  
    return errorMessage;
  }

  isPreferenceSetValid(index: number): boolean {
    const preferenceSet = this.getPreferenceSetAsFormGroup(index);
    
    // Check if at least one category is selected
    const categoriesGroup = preferenceSet.get('categories') as FormGroup;
    const hasCategory = Object.values(categoriesGroup.value).some(value => value === true);
  
    // Check if at least one company is selected
    const companiesGroup = preferenceSet.get('companies') as FormGroup;
    const hasCompany = Object.values(companiesGroup.value).some(value => value === true);
  
    // Check if at least one info type is selected
    const infoTypesGroup = preferenceSet.get('infoTypes') as FormGroup;
    const hasInfoType = Object.values(infoTypesGroup.value).some(value => value === true);
  
    // Check if at least one detail is selected for each selected info type
    let detailsValid = true;
    if (infoTypesGroup.get('Pipeline Info')?.value) {
      const pipelineDetails = preferenceSet.get('pipelineDetails') as FormGroup;
      detailsValid = detailsValid && Object.values(pipelineDetails.value).some(value => value === true);
    }
    if (infoTypesGroup.get('Financial Info')?.value) {
      const financialDetails = preferenceSet.get('financialDetails') as FormGroup;
      detailsValid = detailsValid && Object.values(financialDetails.value).some(value => value === true);
    }
    if (infoTypesGroup.get('Personnel Info')?.value) {
      const personnelDetails = preferenceSet.get('personnelDetails') as FormGroup;
      detailsValid = detailsValid && Object.values(personnelDetails.value).some(value => value === true);
    }
  
    return hasCategory && hasCompany && hasInfoType && detailsValid;
  }


  private initializeFilteredPreferenceSets(): void {
    this.filteredPreferenceSets = this.preferenceSets.controls as FormGroup[];
  }


  searchPreferenceSets(): void {
    if (!this.searchTerm.trim()) {
      this.filteredPreferenceSets = this.preferenceSets.controls as FormGroup[];
    } else {
      this.filteredPreferenceSets = this.preferenceSets.controls.filter((preferenceSet: AbstractControl) => {
        const title = (preferenceSet as FormGroup).get('SetTitle')?.value.toLowerCase();
        return title.includes(this.searchTerm.toLowerCase());
      }) as FormGroup[];
    }
  }

  startEditingTitle(index: number): void {
    this.editingTitle = index;
  }

  saveTitle(index: number): void {
    const preferenceSet = this.getPreferenceSetAsFormGroup(index);
    const newTitle = preferenceSet.get('SetTitle')?.value;
    if (newTitle && newTitle.trim() !== '') {
      // Here you would typically call a method to save the new title to the backend
      console.log(`Saving new title for preference set ${index}: ${newTitle}`);
      this.editingTitle = null;
    } else {
      // If the title is empty, revert to the original title
      preferenceSet.patchValue({ SetTitle: this.originalPreferenceSets[index].SetTitle });
    }
  }

  cancelEditingTitle(index: number): void {
    const preferenceSet = this.getPreferenceSetAsFormGroup(index);
    preferenceSet.patchValue({ SetTitle: this.originalPreferenceSets[index].SetTitle });
    this.editingTitle = null;
  }


  toggleContactEditMode(): void {
    this.editingContactInfo = !this.editingContactInfo;
    
    if (this.editingContactInfo) {
      // Enable editing
      this.contactForm.get('firstName')?.enable();
      this.contactForm.get('lastName')?.enable();
      this.contacts.controls.forEach(contact => contact.enable());
    } else {
      // Cancel editing: reset form to original values and disable
      if (this.originalContactInfo) {
        this.contactForm.patchValue({
          firstName: this.originalContactInfo.firstName,
          lastName: this.originalContactInfo.lastName
        });
        
        // Reset contacts
        const contactsArray = this.contactForm.get('contacts') as FormArray;
        contactsArray.clear();
        this.originalContactInfo.contacts.forEach(contact => {
          contactsArray.push(this.fb.group({
            type: [contact.type, Validators.required],
            detail: [contact.detail, Validators.required],
            preferred: [contact.preferred]
          }));
        });
      }
      
      this.contactForm.get('firstName')?.disable();
      this.contactForm.get('lastName')?.disable();
      this.contacts.controls.forEach(contact => contact.disable());
    }
  }


  editContactInfo(): void {
    this.editingContactInfo = true;
    this.contactForm.get('firstName')?.enable();
    this.contactForm.get('lastName')?.enable();
    this.contacts.controls.forEach(contact => contact.enable());
  }
  

  isEditing(index: number): boolean {
    return this.editingStates[index] || false;
  }

  editPreferenceSet(index: number): void {
    if (this.editingStates[index]) {
      // If currently editing, cancel the edit
      this.cancelEdit(index);
    } else {
      // If not editing, start editing
      this.editingStates[index] = true;
      const currentSet = this.getPreferenceSetAsFormGroup(index);
      
      // Create a deep copy of the current state
      this.originalPreferenceSets[index] = this.deepCopyFormGroup(currentSet);
      
      console.log('Original state saved:', this.originalPreferenceSets[index]);
      
      this.enablePreferenceSet(index);
    }
  }

  cancelEdit(index: number): void {
    console.log('Canceling edit for index:', index);
    const originalSet = this.originalPreferenceSets[index];
    if (originalSet) {
      const currentSet = this.getPreferenceSetAsFormGroup(index);
      
      // Restore all values from the original set
      this.restoreFormGroupValues(currentSet, originalSet);
  
      console.log('Restored preference set:', currentSet.value);
    } else {
      // This is a new preference set that hasn't been saved
      this.preferenceSets.removeAt(index);
      this.editingStates.splice(index, 1);
      this.originalPreferenceSets.splice(index, 1);
      this.initializeFilteredPreferenceSets();
      this.searchPreferenceSets();
      return; // Exit the method early as we've removed the set
    }
    this.editingStates[index] = false;
    this.disablePreferenceSet(index);
    console.log('Edit canceled, current state:', this.getPreferenceSetAsFormGroup(index).value);
  }

  private deepCopyFormGroup(formGroup: FormGroup): any {
    const copy: any = {};
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      if (control instanceof FormGroup) {
        copy[key] = this.deepCopyFormGroup(control);
      } else if (control instanceof FormArray) {
        copy[key] = control.controls.map(ctrl => 
          ctrl instanceof FormGroup ? this.deepCopyFormGroup(ctrl) : ctrl.value
        );
      } else {
        copy[key] = control?.value;
      }
    });
    return copy;
  }

  private restoreFormGroupValues(formGroup: FormGroup, values: any): void {
    Object.keys(values).forEach(key => {
      const control = formGroup.get(key);
      if (control instanceof FormGroup) {
        this.restoreFormGroupValues(control, values[key]);
      } else if (control instanceof FormArray) {
        control.clear();
        values[key].forEach((item: any) => {
          if (typeof item === 'object' && !Array.isArray(item)) {
            control.push(this.fb.group(item));
          } else {
            control.push(this.fb.control(item));
          }
        });
      } else {
        control?.setValue(values[key]);
      }
    });
  }

  savePreferenceSet(index: number): void {
    if (this.contactForm.valid && this.isPreferenceSetValid(index)) {
      const preferenceSet = this.getPreferenceSetAsFormGroup(index).value;
  
      const checkedPreferredContacts = preferenceSet.preferredContacts.filter(
        (contact: any) => contact.checked
      );
      
      // Prepare the data to be sent to the server
      const saveData = {
        UserID: this.userID,
        SetID: preferenceSet.SetID, // Include the SetID if it exists
        SetTitle: preferenceSet.SetTitle,
        Priority: preferenceSet.Priority,
        categories: preferenceSet.categories,
        companies: preferenceSet.companies,
        infoTypes: preferenceSet.infoTypes,
        pipelineDetails: preferenceSet.pipelineDetails,
        financialDetails: preferenceSet.financialDetails,
        personnelDetails: preferenceSet.personnelDetails,
        preferredContacts: checkedPreferredContacts,
        FirstName: this.contactForm.get('firstName')?.value,
        LastName: this.contactForm.get('lastName')?.value      
      };
  
      this.dataService.saveOrUpdateNotificationPreferences(saveData).subscribe({
        next: (response) => {
          console.log('Preference set updated successfully:', response);
          if (!preferenceSet.SetID && response.SetID) {
            this.getPreferenceSetAsFormGroup(index).patchValue({ SetID: response.SetID });
          }
          this.snackBar.open('Preference set updated successfully!', 'Close', { duration: 3000 });
          
          // Update the editing state and disable fields (except SetTitle)
          this.editingStates[index] = false;
          this.disablePreferenceSet(index);
          
          // Update the original state after successful save
          this.originalPreferenceSets[index] = {...this.getPreferenceSetAsFormGroup(index).value};
          
          // Ensure SetTitle remains enabled
          this.getPreferenceSetAsFormGroup(index).get('SetTitle')?.enable();
          this.searchPreferenceSets(); // Refresh the filtered list
        },
        error: (error) => {
          console.error('Error updating preference set:', error);
          this.snackBar.open('Error updating preference set.', 'Close', { duration: 3000 });
        }
      });
    } else {
      this.snackBar.open('Please ensure at least one option is selected in each section.', 'Close', { duration: 3000 });
    }
  
    this.disablePreferredContacts();
  }

  deletePreferenceSet(index: number): void {
    console.log('deletePreferenceSet called with index:', index);
    const preferenceSet = this.getPreferenceSetAsFormGroup(index).value;
    console.log('Preference set to delete:', preferenceSet);
  
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Confirm Deletion',
        message: 'Are you sure you want to delete this preference set?'
      }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      console.log('Dialog result:', result);
      if (result === true) {
        if (preferenceSet.SetID) {
          console.log('Calling deleteNotificationPreference with SetID:', preferenceSet.SetID);
          this.dataService.deleteNotificationPreference(preferenceSet.SetID).subscribe({
            next: (response) => {
              console.log('Preference set deleted successfully:', response);
              this.snackBar.open('Preference set deleted successfully!', 'Close', { duration: 3000 });
              this.preferenceSets.removeAt(index);
              this.initializeFilteredPreferenceSets();
              this.searchPreferenceSets();
            },
            error: (error) => {
              console.error('Error deleting preference set:', error);
              this.snackBar.open('Error deleting preference set.', 'Close', { duration: 3000 });
            }
          });
        } else {
          console.log('Removing new preference set (not saved to backend)');
          this.preferenceSets.removeAt(index);
          this.snackBar.open('Preference set removed.', 'Close', { duration: 3000 });
          this.initializeFilteredPreferenceSets();
          this.searchPreferenceSets();
        }
      } else {
        console.log('Deletion cancelled');
      }
    });
  }

  getPreferenceSetAsFormGroup(index: number): FormGroup {
    return this.preferenceSets.at(index) as FormGroup;
  }


  private loadCategories(callback?: () => void): void {
    this.dataService.getCategories().subscribe(
      data => {
        this.categoryList = data;
        this.initializeCategoryControls();

        // Initialize company and info type controls
        this.initializeCompanyControls();
        this.initializeInfoTypeControls();

        if (callback) {
          callback(); // Load preferences after everything is initialized
        }
      },
      error => {
        console.error('Error loading categories', error);
      }
    );
  }

  private initializeCategoryControls(): void {
    const categoriesGroup = this.fb.group({});
    this.categoryList.forEach(category => {
      console.log('Initializing category control:', category);
      categoriesGroup.addControl(category, new FormControl(false));
    });
    this.contactForm.setControl('categories', categoriesGroup);
    console.log('Initialized categories:', this.contactForm.get('categories')?.value);
  }

  private initializeCompanyControls(): void {
    const companiesGroup = this.fb.group({});
    this.companyList.forEach(company => {
      companiesGroup.addControl(company, new FormControl(false));
    });
    this.contactForm.setControl('companies', companiesGroup);
    console.log('Initialized companies:', this.contactForm.get('companies')?.value);
  }

  private initializeInfoTypeControls(): void {
    const infoTypesGroup = this.fb.group({});
    this.infoTypeList.forEach(infoType => {
        infoTypesGroup.addControl(infoType, new FormControl(false));
    });
    this.contactForm.setControl('infoTypes', infoTypesGroup);
    console.log('Initialized infoTypes:', this.contactForm.get('infoTypes')?.value);
  }

  private loadPreferences(userId: string): void {
    this.dataService.getUserPreferences(userId).subscribe(
      (preferences) => {
        console.log("Preferences fetched:", preferences);
        this.populateFormWithPreferences(preferences);
      },
      (error) => {
        console.error("Error fetching preferences:", error);
      }
    ).add(() => {
      // This will run regardless of success or failure of getUserPreferences
      this.loadContactInformation(userId);
    });
  }
  
  

  private populateFormWithPreferences(preferences: any): void {
    if (!preferences || !preferences.preferenceSets || preferences.preferenceSets.length === 0) {
      console.warn('Invalid or empty preferences object');
      this.loadContactInformation(this.userID);
      return;
    }
  
    // Populate contact information
    this.populateContactInformation(preferences.contactInfo);
  
    const preferenceSetsFormArray = this.contactForm.get('preferenceSets') as FormArray;
    preferenceSetsFormArray.clear();
  
    preferences.preferenceSets.forEach((set: any, index: number) => {
      console.log(`Processing preference set #${index + 1}`, set);
  
      const preferenceSetForm = this.createPreferenceSet();
  
      // Populate preferred contacts
      const preferredContactsArray = preferenceSetForm.get('preferredContacts') as FormArray;
      if (set.preferredContacts && Array.isArray(set.preferredContacts)) {
        set.preferredContacts.forEach((contact: any) => {
          preferredContactsArray.push(this.fb.group({
            contactType: contact.contactType,
            contactDetail: contact.contactDetail,
            checked: contact.preferred
          }));
        });
      }
  
      // Initialize and patch categories
      const categoriesGroup = preferenceSetForm.get('categories') as FormGroup;
      this.categoryList.forEach(category => {
        if (!categoriesGroup.get(category)) {
          categoriesGroup.addControl(category, new FormControl(false));
        }
        if (set[category] !== undefined) {
          categoriesGroup.get(category)?.setValue(set[category]);
          console.log(`Category '${category}' set to`, set[category]);
        }
      });
  
      // Initialize and patch companies
      const companiesGroup = preferenceSetForm.get('companies') as FormGroup;
      this.companyList.forEach(company => {
        if (!companiesGroup.get(company)) {
          companiesGroup.addControl(company, new FormControl(false));
        }
        if (set.hasOwnProperty(company)) {
          companiesGroup.get(company)?.setValue(set[company]);
          console.log(`Company '${company}' set to ${set[company]}`);
        }
      });
  
      // Initialize and patch infoTypes
      const infoTypesGroup = preferenceSetForm.get('infoTypes') as FormGroup;
      ['Pipeline Info', 'Financial Info', 'Personnel Info'].forEach(infoType => {
        if (!infoTypesGroup.get(infoType)) {
          infoTypesGroup.addControl(infoType, new FormControl(false));
        }
        if (set[infoType] !== undefined) {
          infoTypesGroup.get(infoType)?.setValue(set[infoType]);
          console.log(`InfoType '${infoType}' set to`, set[infoType]);
        } else if (infoType === 'Personnel Info' && set['Personell Info'] !== undefined) {
          infoTypesGroup.get(infoType)?.setValue(set['Personell Info']);
          console.log(`InfoType 'Personnel Info' set to`, set['Personell Info']);
        }
      });
  
      // Set other details
      preferenceSetForm.patchValue({
        SetID: set.SetID,
        SetTitle: set.SetTitle || 'Untitled Set',
        Priority: (set.Priority || '3').toString(),
        pipelineDetails: {
          TherapyApproval: set.TherapyApproval || false,
          IndicationChange: set.IndicationChange || false
        },
        financialDetails: {
          EarningsReport: set.EarningsReport || false,
          MAndA: set.MAndA || false
        },
        personnelDetails: {
          Layoffs: set.Layoffs || false,
          NewHires: set.NewHires || false
        }
      });
  
      console.log(`Set Priority to: ${preferenceSetForm.get('Priority')?.value}`);
  
      preferenceSetsFormArray.push(preferenceSetForm);
      console.log('Populated preference set form:', preferenceSetForm.value);
  
      this.originalPreferenceSets[index] = preferenceSetForm.value;
  
      this.fetchAndUpdateCompaniesAfterInitialization(set, index);
      this.onCategoryChange(index);
    });
  
    this.preferenceSets.controls.forEach((preferenceSet, index) => {
      this.disablePreferenceSet(index);
    });
  
    // Disable form fields
    this.contactForm.get('firstName')?.disable();
    this.contactForm.get('lastName')?.disable();
    this.contacts.controls.forEach(contact => contact.disable());
  
    this.formSubmitted = true;
  
    setTimeout(() => {
      this.cdr.detectChanges();
    });
  
    this.disablePreferredContacts();
    this.initializeFilteredPreferenceSets();
    this.searchPreferenceSets();
  
    console.log('Final form structure after populating with preferences:', this.contactForm.value);
  }



  private loadContactInformation(userId: string | null): void {
    if (!userId) {
      console.error('No user ID available to fetch contact information');
      return;
    }
  
    this.dataService.getUserContactInformation(userId).subscribe(
      (contactInfo) => {
        console.log("Contact information fetched:", contactInfo);
        this.populateContactInformation(contactInfo);
      },
      (error) => {
        console.error("Error fetching contact information:", error);
      }
    );
  }

  private populateContactInformation(contactInfo: any): void {
    if (!contactInfo) {
      console.warn('No contact information available');
      return;
    }
  
    this.contactForm.patchValue({
      firstName: contactInfo.firstName || '',
      lastName: contactInfo.lastName || ''
    });
  
    const contactsArray = this.contactForm.get('contacts') as FormArray;
    contactsArray.clear();
  
    const contactTypes = ['email', 'text', 'call', 'instagram', 'facebook'];
    contactTypes.forEach(type => {
      if (contactInfo[type]) {
        this.addContactToForm(type, contactInfo[type]);
      }
    });
  
    this.originalContactInfo = {
      firstName: this.contactForm.get('firstName')?.value,
      lastName: this.contactForm.get('lastName')?.value,
      contacts: this.contacts.value
    };
  
    // Disable contact form fields
    this.contactForm.get('firstName')?.disable();
    this.contactForm.get('lastName')?.disable();
    this.contacts.controls.forEach(contact => contact.disable());
  
    console.log('Contact form after population:', this.contactForm.value);
  }


  private disablePreferenceSet(index: number): void {
    console.log(`Disabling preference set at index ${index}`);
    const preferenceSet = this.getPreferenceSetAsFormGroup(index);
    Object.keys(preferenceSet.controls).forEach(key => {
      if (key !== 'SetTitle') {
        const control = preferenceSet.get(key);
        if (control instanceof FormGroup) {
          Object.keys(control.controls).forEach(subKey => {
            control.get(subKey)?.disable();
          });
        } else if (control instanceof FormArray) {
          control.controls.forEach(arrayControl => {
            if (arrayControl instanceof FormGroup) {
              Object.keys(arrayControl.controls).forEach(subKey => {
                arrayControl.get(subKey)?.disable();
              });
            } else {
              arrayControl.disable();
            }
          });
        } else {
          control?.disable();
        }
      }
    });
  
    // Explicitly disable company controls
    const companiesGroup = preferenceSet.get('companies') as FormGroup;
    if (companiesGroup) {
      Object.keys(companiesGroup.controls).forEach(company => {
        companiesGroup.get(company)?.disable();
      });
    }
  
    console.log(`Preference set at index ${index} disabled`);
  }

private enablePreferenceSet(index: number): void {
  const preferenceSet = this.getPreferenceSetAsFormGroup(index);
  preferenceSet.enable();
}

private disablePreferredContacts(): void {
  console.log('Disabling preferred contacts');
  this.preferenceSets.controls.forEach((preferenceSetGroup: AbstractControl) => {
      const preferredContacts = preferenceSetGroup.get('preferredContacts') as FormArray;
      preferredContacts.controls.forEach(contact => contact.disable());
  });
}

private enablePreferredContacts(): void {
  this.preferenceSets.controls.forEach((preferenceSetGroup: AbstractControl) => {
      const preferredContacts = preferenceSetGroup.get('preferredContacts') as FormArray;
      preferredContacts.controls.forEach(contact => contact.enable());
  });
}

togglePreferenceSetEditMode(index: number): void {
  if (this.editingStates[index]) {
      this.disablePreferredContacts();
  } else {
      this.enablePreferredContacts();
  }
  this.editingStates[index] = !this.editingStates[index];
}



getPreferredContacts(index: number): FormArray {
  const preferenceSet = this.getPreferenceSetAsFormGroup(index);
  return (preferenceSet.get('preferredContacts') as FormArray) || this.fb.array([]);
}

  onPreferredContactChange(setIndex: number, contactIndex: number): void {
    const preferenceSet = this.getPreferenceSetAsFormGroup(setIndex);
    const preferredContacts = preferenceSet.get('preferredContacts') as FormArray;
    const contact = preferredContacts.at(contactIndex);
    contact.patchValue({ checked: contact.value.checked });
  }

  private addContactToForm(type: string, detail: string): void {
    const contactsArray = this.contactForm.get('contacts') as FormArray;
    contactsArray.push(this.fb.group({
      type: [type, Validators.required],
      detail: [detail, Validators.required],
      preferred: [false]
    }));
  }
  
private fetchAndUpdateCompaniesAfterInitialization(set: any, setIndex: number): void {
  this.preferenceSets.controls.forEach((preferenceSetGroup: AbstractControl, index: number) => {
    if (index === setIndex) {
      const categoriesGroup = preferenceSetGroup.get('categories') as FormGroup;
      const selectedCategories = Object.keys(categoriesGroup.controls)
        .filter(category => categoriesGroup.get(category)?.value);

      if (selectedCategories.length > 0) {
        selectedCategories.forEach(category => {
          this.dataService.getCompaniesByCategory(category).subscribe(companies => {
            this.updateCompaniesInForm(setIndex, companies, set);
          }, error => {
            console.error(`Error fetching companies for category '${category}':`, error);
          });
        });
      }
    }
  });
}

  private updateCompaniesInForm(setIndex: number, companies: string[], set: any): void {
    const preferenceSetGroup = this.getPreferenceSetAsFormGroup(setIndex);
    const companiesGroup = preferenceSetGroup.get('companies') as FormGroup;

    companies.forEach(company => {
      if (!companiesGroup.get(company)) {
        companiesGroup.addControl(company, new FormControl(false));
      }

      // Use the passed set object to check if the company exists
      if (set.hasOwnProperty(company)) {
        companiesGroup.get(company)?.setValue(set[company]);
      }
    });
  }


  private createPreferenceSet(): FormGroup {
    return this.fb.group({
      SetID: [null],
      SetTitle: ['New Preference Set', Validators.required],
      Priority: ['3', Validators.required],
      categories: this.fb.group({}),
      companies: this.fb.group({}),
      infoTypes: this.fb.group({}),
      pipelineDetails: this.fb.group({
        TherapyApproval: [false],
        IndicationChange: [false]
      }),
      financialDetails: this.fb.group({
        EarningsReport: [false],
        MAndA: [false]
      }),
      personnelDetails: this.fb.group({
        Layoffs: [false],
        NewHires: [false]
      }),
      preferredContacts: this.fb.array([])
    });
  }

  addPreferenceSet(): void {
    const newSet = this.createPreferenceSet();
    this.initializeCategories(newSet);
    this.initializeCompanies(newSet);
    this.initializeInfoTypes(newSet);
    
    // Populate preferred contacts
    this.populatePreferredContacts(newSet);
    
    const newIndex = this.preferenceSets.length;
    (this.contactForm.get('preferenceSets') as FormArray).push(newSet);
    this.editingStates[newIndex] = false; // Start in non-editing state
    this.originalPreferenceSets[newIndex] = this.deepCopyFormGroup(newSet);
    
    this.disablePreferenceSet(newIndex);
    
    // Trigger category change to populate companies and info types
    this.onCategoryChange(newIndex);
    
    // Scroll to the newly added preference set
    setTimeout(() => {
      const newSetElement = document.getElementById(`preference-set-${newIndex}`);
      if (newSetElement) {
        newSetElement.scrollIntoView({ behavior: 'smooth' });
      }
      this.cdr.detectChanges(); // Trigger change detection
    });
  
    this.initializeFilteredPreferenceSets();
    this.searchPreferenceSets(); // Refresh the filtered list
  }

  private populatePreferredContacts(preferenceSet: FormGroup): void {
    const preferredContactsArray = preferenceSet.get('preferredContacts') as FormArray;
    const clientContacts = this.contactForm.get('contacts') as FormArray;
  
    clientContacts.controls.forEach(contact => {
      preferredContactsArray.push(this.fb.group({
        contactType: contact.get('type')?.value,
        contactDetail: contact.get('detail')?.value,
        checked: false
      }));
    });
  }

  private initializeCategories(preferenceSet: FormGroup): void {
    const categoriesGroup = preferenceSet.get('categories') as FormGroup;
    this.categoryList.forEach(category => {
      categoriesGroup.addControl(category, new FormControl(false));
    });
  }

  private initializeCompanies(preferenceSet: FormGroup): void {
    const companiesGroup = preferenceSet.get('companies') as FormGroup;
    this.companyList.forEach(company => {
      companiesGroup.addControl(company, new FormControl(false));
    });
    preferenceSet.setControl('companyList', this.fb.control([]));
  }

  private initializeInfoTypes(preferenceSet: FormGroup): void {
    const infoTypesGroup = preferenceSet.get('infoTypes') as FormGroup;
    ['Pipeline Info', 'Financial Info', 'Personnel Info'].forEach(infoType => {
      infoTypesGroup.addControl(infoType, new FormControl(false));
    });
    preferenceSet.setControl('infoTypeList', this.fb.control(['Financial Info', 'Personnel Info']));
  }


  get preferenceSets(): FormArray {
    return this.contactForm.get('preferenceSets') as FormArray;
  }


  onCategoryChange(setIndex: number): void {
    const preferenceSetGroup = this.getPreferenceSetAsFormGroup(setIndex);
    const categoriesGroup = preferenceSetGroup.get('categories') as FormGroup;
    const selectedCategories = Object.keys(categoriesGroup.controls)
      .filter(category => categoriesGroup.get(category)?.value);
  
    if (selectedCategories.length > 0) {
      forkJoin(selectedCategories.map(category => this.dataService.getCompaniesByCategory(category)))
        .subscribe(
          (responses: string[][]) => {
            const companies = Array.from(new Set(responses.flat()));
            this.updateCompanies(preferenceSetGroup, companies);
            this.updateInfoTypes(preferenceSetGroup, selectedCategories);
            this.cdr.detectChanges();
          },
          error => console.error('Error loading companies', error)
        );
    } else {
      this.updateCompanies(preferenceSetGroup, []);
      this.updateInfoTypes(preferenceSetGroup, []);
      this.cdr.detectChanges();
    }
  }
  
  private updateCompanies(preferenceSetGroup: FormGroup, companies: string[]): void {
    const companiesGroup = preferenceSetGroup.get('companies') as FormGroup;
    
    // Remove old controls
    Object.keys(companiesGroup.controls)
      .filter(company => !companies.includes(company))
      .forEach(company => companiesGroup.removeControl(company));
  
    // Add new controls
    companies.forEach(company => {
      if (!companiesGroup.contains(company)) {
        companiesGroup.addControl(company, new FormControl(false));
      }
    });
  
    // Update the companyList for this specific preference set
    preferenceSetGroup.setControl('companyList', this.fb.control(companies));
  }
  
  private updateInfoTypes(preferenceSetGroup: FormGroup, selectedCategories: string[]): void {
    const infoTypesGroup = preferenceSetGroup.get('infoTypes') as FormGroup;
    const showPipeline = selectedCategories.some(category => 
      ['Pharmaceutical companies', 'Biotechnology companies'].includes(category)
    );
  
    const infoTypes = ['Financial Info', 'Personnel Info'];
    if (showPipeline) {
      infoTypes.unshift('Pipeline Info');
    }
  
    // Remove old controls and uncheck associated details
    Object.keys(infoTypesGroup.controls)
      .forEach(infoType => {
        if (!infoTypes.includes(infoType)) {
          infoTypesGroup.removeControl(infoType);
          this.uncheckAssociatedDetails(preferenceSetGroup, infoType);
        } else if (!infoTypesGroup.get(infoType)?.value) {
          this.uncheckAssociatedDetails(preferenceSetGroup, infoType);
        }
      });
  
    // Add new controls
    infoTypes.forEach(infoType => {
      if (!infoTypesGroup.contains(infoType)) {
        infoTypesGroup.addControl(infoType, new FormControl(false));
      }
    });
  
    // Update the infoTypeList for this specific preference set
    preferenceSetGroup.setControl('infoTypeList', this.fb.control(infoTypes));
  }

  private uncheckAssociatedDetails(preferenceSetGroup: FormGroup, infoType: string): void {
    switch (infoType) {
      case 'Pipeline Info':
        const pipelineDetails = preferenceSetGroup.get('pipelineDetails') as FormGroup;
        Object.keys(pipelineDetails.controls).forEach(key => {
          pipelineDetails.get(key)?.setValue(false);
        });
        break;
      case 'Financial Info':
        const financialDetails = preferenceSetGroup.get('financialDetails') as FormGroup;
        Object.keys(financialDetails.controls).forEach(key => {
          financialDetails.get(key)?.setValue(false);
        });
        break;
      case 'Personnel Info':
        const personnelDetails = preferenceSetGroup.get('personnelDetails') as FormGroup;
        Object.keys(personnelDetails.controls).forEach(key => {
          personnelDetails.get(key)?.setValue(false);
        });
        break;
    }
  }

  onInfoTypeChange(setIndex: number, infoType: string): void {
    console.log(`Info type changed for set ${setIndex}: ${infoType}`);
    const preferenceSetGroup = this.getPreferenceSetAsFormGroup(setIndex);
    const infoTypesGroup = preferenceSetGroup.get('infoTypes') as FormGroup;
    
    if (!infoTypesGroup.get(infoType)?.value) {
      console.log(`Unchecking details for ${infoType}`);
      this.uncheckAssociatedDetails(preferenceSetGroup, infoType);
    }
  }
  

  selectAllCategories(setIndex: number): void {
    const preferenceSetGroup = this.getPreferenceSetAsFormGroup(setIndex);
    const categoriesGroup = preferenceSetGroup.get('categories') as FormGroup;
    const allSelected = Object.keys(categoriesGroup.controls).every(key => categoriesGroup.get(key)?.value);
    
    Object.keys(categoriesGroup.controls).forEach(key => {
      categoriesGroup.get(key)?.setValue(!allSelected);
    });
    
    this.onCategoryChange(setIndex); // To trigger any dependent updates
  }

  selectAllCompanies(setIndex: number): void {
    const preferenceSetGroup = this.getPreferenceSetAsFormGroup(setIndex);
    const companiesGroup = preferenceSetGroup.get('companies') as FormGroup;
    if (companiesGroup) {
      const allSelected = Object.keys(companiesGroup.controls).every(key => companiesGroup.get(key)?.value);
      Object.keys(companiesGroup.controls).forEach(key => {
        companiesGroup.get(key)?.setValue(!allSelected);
      });
    }
  }
  

  selectAllInfoTypes(setIndex: number): void {
    const preferenceSetGroup = this.getPreferenceSetAsFormGroup(setIndex);
    const infoTypesGroup = preferenceSetGroup.get('infoTypes') as FormGroup;
    if (infoTypesGroup) {
      const allSelected = Object.keys(infoTypesGroup.controls).every(key => infoTypesGroup.get(key)?.value);
      Object.keys(infoTypesGroup.controls).forEach(key => {
        infoTypesGroup.get(key)?.setValue(!allSelected);
      });
    }
  }

  selectAllPipelineDetails(setIndex: number): void {
    const preferenceSetGroup = this.getPreferenceSetAsFormGroup(setIndex);
    const pipelineControls = ['TherapyApproval', 'IndicationChange'];
    const allSelected = pipelineControls.every(control => preferenceSetGroup.get(control)?.value);
    
    pipelineControls.forEach(control => {
      preferenceSetGroup.get(control)?.setValue(!allSelected);
    });
  }

  selectAllFinancialDetails(setIndex: number): void {
    const preferenceSetGroup = this.getPreferenceSetAsFormGroup(setIndex);
    const allSelected = preferenceSetGroup.get('earningsReport')?.value && preferenceSetGroup.get('maActivity')?.value;
    preferenceSetGroup.get('earningsReport')?.setValue(!allSelected);
    preferenceSetGroup.get('maActivity')?.setValue(!allSelected);
  }

  selectAllPersonnelDetails(setIndex: number): void {
    const preferenceSetGroup = this.getPreferenceSetAsFormGroup(setIndex);
    const allSelected = preferenceSetGroup.get('layoffs')?.value && preferenceSetGroup.get('newHires')?.value;
    preferenceSetGroup.get('layoffs')?.setValue(!allSelected);
    preferenceSetGroup.get('newHires')?.setValue(!allSelected);
  }

  showPipelineDetails(index: number): boolean {
    const infoTypesGroup = this.getPreferenceSetAsFormGroup(index).get('infoTypes') as FormGroup;
    return infoTypesGroup.get('Pipeline Info')?.value === true;
  }
  
  showFinancialDetails(index: number): boolean {
    const infoTypesGroup = this.getPreferenceSetAsFormGroup(index).get('infoTypes') as FormGroup;
    return infoTypesGroup.get('Financial Info')?.value === true;
  }
  
  showPersonnelDetails(index: number): boolean {
    const infoTypesGroup = this.getPreferenceSetAsFormGroup(index).get('infoTypes') as FormGroup;
    return infoTypesGroup.get('Personnel Info')?.value === true;
  }

  get contacts(): FormArray {
    return this.contactForm.get('contacts') as FormArray || this.fb.array([]);
  }

  addContact(): void {
    if (this.editingContactInfo) {
      const contactGroup = this.fb.group({
        type: ['', Validators.required],
        detail: ['', Validators.required],
        preferred: [false]
      });
      this.contacts.push(contactGroup);
    }
  }

  removeContact(index: number): void {
    this.contacts.removeAt(index);
  }

  onSubmit(): void {
    if (this.contactForm.valid) {
        this.formSubmitted = true;

        const userId = this.authService.getUserId(); // Fetch the userId
        console.log('Auth userId:', userId);

        if (!userId) {
            this.snackBar.open('Error: User not authenticated.', 'Close', { duration: 3000 });
            return;
        }

        const formValue = this.contactForm.value;

        const contactData = {
            userID: userId,  // Include userID here
            firstName: formValue.firstName,
            lastName: formValue.lastName,
            contacts: formValue.contacts,
            categories: formValue.categories,
            companies: formValue.companies,
            infoTypes: formValue.infoTypes,
            notificationMethods: formValue.notificationMethods
        };

        console.log('Contact data being sent:', contactData);

        this.dataService.saveOrUpdateContactPreference(contactData).subscribe({
            next: (response) => {
                console.log('Contact preference saved/updated successfully:', response);
                this.userID = response.userID || this.userID; // Ensure userID is retained
                this.snackBar.open('Contact preference saved successfully!', 'Close', { duration: 3000 });

                // Update the preferred contacts in each notification preference set
                this.updatePreferredContactsInAllPreferenceSets();
                
                // Disable editing after saving
                this.editingContactInfo = false;
                this.contactForm.get('firstName')?.disable();
                this.contactForm.get('lastName')?.disable();
                this.contacts.controls.forEach(contact => contact.disable());
            },
            error: (error) => {
                console.error('Error saving contact preference:', error);
                this.snackBar.open('Error saving contact preference.', 'Close', { duration: 3000 });
            }
        });
    }
}

private updatePreferredContactsInAllPreferenceSets(): void {
  const contactsArray = this.contactForm.get('contacts') as FormArray;
  
  this.preferenceSets.controls.forEach((preferenceSetGroup: AbstractControl) => {
    const preferredContacts = preferenceSetGroup.get('preferredContacts') as FormArray;
    
    // Clear the current preferred contacts
    preferredContacts.clear();

    // Add each contact from the contact form to the preferred contacts
    contactsArray.controls.forEach(contact => {
      const existingPreferredContact = this.originalPreferenceSets[0]?.preferredContacts.find(
        (pc: any) => pc.contactType === contact.get('type')?.value && pc.contactDetail === contact.get('detail')?.value
      );

      preferredContacts.push(this.fb.group({
        contactType: contact.get('type')?.value,
        contactDetail: contact.get('detail')?.value,
        checked: existingPreferredContact ? existingPreferredContact.checked : false
      }));
    });
  });
}

// Method to save notification preferences
onSubmitNotificationPreferences(): void {
  if (this.contactForm.valid) {
      const userId = this.authService.getUserId(); // Fetch the userId again
      console.log('UserID fetched:', userId);

      if (!userId) {
          this.snackBar.open('Error: User not authenticated.', 'Close', { duration: 3000 });
          return;
      }

      const formValue = this.contactForm.value;

      const notificationData = {
          UserID: userId,  // Ensure userID is included
          FirstName: formValue.firstName,
          LastName: formValue.lastName,
          Priority: formValue.priority,
          ...formValue.categories,
          ...formValue.infoTypes,
          TherapyApproval: formValue.therapyApproval,
          IndicationChange: formValue.indicationChange,
          EarningsReport: formValue.earningsReport,
          MAndA: formValue.maActivity,
          Layoffs: formValue.layoffs,
          NewHires: formValue.newHires,
          ...this.companyList.reduce((acc, company) => {
              acc[company] = formValue.companies[company] || false;
              return acc;
          }, {} as Record<string, boolean>)
      };

      notificationData.contacts = this.contacts.value.map((contact: { type: string, detail: string }) => ({
          contactType: contact.type,
          contactDetail: contact.detail
      }));

      this.dataService.getAllCompanies().subscribe(allCompanies => {
          allCompanies.forEach(company => {
              if (!(company in notificationData)) {
                  notificationData[company] = false;
              }
          });

          console.log('Final Notification Preferences Object:', notificationData);

          this.dataService.saveOrUpdateNotificationPreferences(notificationData).subscribe({
              next: (response) => {
                  console.log('Notification preference saved/updated successfully:', response);
                  this.snackBar.open('Notification preference saved successfully!', 'Close', { duration: 3000 });
              },
              error: (error) => {
                  console.error('Error saving notification preference:', error);
                  this.snackBar.open('Error saving notification preference.', 'Close', { duration: 3000 });
              }
          });
      });
  } else {
      console.error('Form is invalid');
  }
}

logout(): void {
  // Clear any stored user data (if applicable)
  // Redirect to the login page
  this.router.navigate(['/login']);
}

}