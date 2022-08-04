import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BlockReasonPercentageReportComponent } from './block-reason-percentage.component';

describe('ReportsBlockReasonPercentageComponent', () => {
  let component: BlockReasonPercentageReportComponent;
  let fixture: ComponentFixture<BlockReasonPercentageReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [BlockReasonPercentageReportComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BlockReasonPercentageReportComponent);
    component = fixture.componentInstance;
    component.latestSprintBlockReason = {
      totalBlockedPercentage: 0.3,
      blockReasonPercentage: [{reasonName: "dependencies_not_work", percentage: 0.2}, {reasonName: "sit_env_down", percentage: 0.1}],
    };
    fixture.detectChanges();
  });

  it('should create block reason percentage component success', () => {
    expect(component).toBeTruthy();
  });
});
