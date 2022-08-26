import { async, TestBed } from '@angular/core/testing';
import { Observable } from 'rxjs';

import { CycleDoneService } from './cycle-done.service';

describe('CycleDoneService', () => {
  let cycleDoneService: CycleDoneService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    cycleDoneService = TestBed.inject(CycleDoneService);
  });

  it('should be created', () => {
    expect(cycleDoneService).toBeTruthy();
  });

  it('should set a new value and then can get the same value', async(() => {
    const testValue: string[] = ['ADM-212'];

    cycleDoneService.setValue(testValue);
    cycleDoneService.getValue().subscribe((res) => {
      expect(res).toEqual(testValue);
    });
  }));
});
