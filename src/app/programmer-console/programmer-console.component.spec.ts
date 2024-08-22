import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgrammerConsoleComponent } from './programmer-console.component';

describe('ProgrammerConsoleComponent', () => {
  let component: ProgrammerConsoleComponent;
  let fixture: ComponentFixture<ProgrammerConsoleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProgrammerConsoleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProgrammerConsoleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
