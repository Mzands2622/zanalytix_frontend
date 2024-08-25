import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { DataService } from '../data.service';

interface Contact {
  type: string;
  detail: string;
}

@Component({
  selector: 'app-programmer-contact',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule,
    RouterModule,
    MatMenuModule
  ],
  templateUrl: './programmer-contact.component.html',
  styleUrls: ['./programmer-contact.component.css']
})
export class ProgrammerContactComponent implements OnInit {
  contactForm!: FormGroup;
  userId: number | null = null;
  editingContactInfo = false;
  originalContactData: any;

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
    private dataService: DataService
  ) {}

  ngOnInit(): void {
    this.userId = +this.route.snapshot.paramMap.get('userId')!;
    this.initForm();
    this.loadExistingContacts();
  }

  initForm(): void {
    this.contactForm = this.fb.group({
      firstName: [{value: '', disabled: true}, Validators.required],
      lastName: [{value: '', disabled: true}, Validators.required],
      contacts: this.fb.array([])
    });
  }

  get contacts(): FormArray {
    return this.contactForm.get('contacts') as FormArray;
  }

  addContact(): void {
    const contactGroup = this.fb.group({
      type: [{value: '', disabled: !this.editingContactInfo}, Validators.required],
      detail: [{value: '', disabled: !this.editingContactInfo}, Validators.required]
    });

    // Check for duplicate contact types
    contactGroup.get('type')?.valueChanges.subscribe(selectedType => {
        const existingTypes = this.contacts.controls
            .filter(control => control !== contactGroup)
            .map(control => control.get('type')?.value);

        if (existingTypes.includes(selectedType)) {
            this.snackBar.open('This contact type has already been added.', 'Close', { duration: 3000 });
            contactGroup.get('type')?.reset();
        }
    });

    this.contacts.push(contactGroup);
}

  removeContact(index: number): void {
    this.contacts.removeAt(index);
  }

  toggleContactEditMode(): void {
    this.editingContactInfo = !this.editingContactInfo;
    if (this.editingContactInfo) {
      this.originalContactData = this.contactForm.getRawValue();
      this.contactForm.enable();
    } else {
      this.cancelEdit();
    }
  }

  cancelEdit(): void {
    if (this.originalContactData) {
      this.contactForm.patchValue(this.originalContactData);
      
      // Reset contacts array
      const contactsArray = this.contactForm.get('contacts') as FormArray;
      contactsArray.clear();
      this.originalContactData.contacts.forEach((contact: Contact) => {
        const contactGroup = this.fb.group({
          type: [{value: contact.type, disabled: true}, Validators.required],
          detail: [{value: contact.detail, disabled: true}, Validators.required]
        });
        contactsArray.push(contactGroup);
      });
    }
    this.contactForm.disable();
    this.editingContactInfo = false;
  }

  onSubmit(): void {
    if (this.contactForm.valid) {
      const formData = this.contactForm.getRawValue();
      this.dataService.saveProgrammerContacts(this.userId!, formData).subscribe(
        () => {
          this.snackBar.open('Contact preferences saved successfully!', 'Close', { duration: 3000 });
          this.originalContactData = JSON.parse(JSON.stringify(formData));
          this.toggleContactEditMode();
        },
        (error) => {
          console.error('Error saving contact preferences:', error);
          this.snackBar.open('Error saving contact preferences.', 'Close', { duration: 3000 });
        }
      );
    }
  }

  loadExistingContacts(): void {
    if (!this.userId) return;
    
    this.dataService.getProgrammerContacts(this.userId).subscribe(
      (response) => {
        if (response) {
          this.contactForm.patchValue({
            firstName: response.firstName,
            lastName: response.lastName
          });

          const contactsArray = this.contactForm.get('contacts') as FormArray;
          contactsArray.clear();

          response.contacts.forEach((contact: Contact) => {
            const contactGroup = this.fb.group({
              type: [{value: contact.type, disabled: true}, Validators.required],
              detail: [{value: contact.detail, disabled: true}, Validators.required]
            });
            contactsArray.push(contactGroup);
          });

          this.originalContactData = this.contactForm.getRawValue();
        }
      },
      (error) => {
        console.error('Error loading contacts:', error);
        this.snackBar.open('Error loading contact preferences.', 'Close', { duration: 3000 });
      }
    );
  }
}