import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionTramites } from './gestion-tramites';

describe('GestionTramites', () => {
  let component: GestionTramites;
  let fixture: ComponentFixture<GestionTramites>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionTramites],
    }).compileComponents();

    fixture = TestBed.createComponent(GestionTramites);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
