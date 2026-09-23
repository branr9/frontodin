import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultaSeguimiento } from './consulta-seguimiento';

describe('ConsultaSeguimiento', () => {
  let component: ConsultaSeguimiento;
  let fixture: ComponentFixture<ConsultaSeguimiento>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsultaSeguimiento],
    }).compileComponents();

    fixture = TestBed.createComponent(ConsultaSeguimiento);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
