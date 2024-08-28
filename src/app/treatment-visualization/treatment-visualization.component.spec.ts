import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TreatmentVisualizationComponent } from './treatment-visualization.component';

describe('TreatmentVisualizationComponent', () => {
  let component: TreatmentVisualizationComponent;
  let fixture: ComponentFixture<TreatmentVisualizationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TreatmentVisualizationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TreatmentVisualizationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
