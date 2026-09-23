import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Radicaion } from './radicaion';

describe('Radicaion', () => {
  let component: Radicaion;
  let fixture: ComponentFixture<Radicaion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Radicaion],
    }).compileComponents();

    fixture = TestBed.createComponent(Radicaion);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
