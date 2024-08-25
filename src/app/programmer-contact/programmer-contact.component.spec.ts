import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgrammerContactComponent } from './programmer-contact.component';

describe('ProgrammerContactComponent', () => {
  let component: ProgrammerContactComponent;
  let fixture: ComponentFixture<ProgrammerContactComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProgrammerContactComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProgrammerContactComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
