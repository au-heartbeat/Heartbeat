import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ExportComponent } from './reports.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { SimpleChange } from '@angular/core';
import { ApiService } from 'src/app/dora/service/api.service';
import { ReportParams } from '../../../models/reportParams';
import { BoardParams } from 'src/app/dora/models/boardParams';
import { of } from 'rxjs';
import { ReportResponse } from '../../../types/reportResponse';

describe('ExportComponent', () => {
  let exportComponent: ExportComponent;
  let fixture: ComponentFixture<ExportComponent>;
  let apiService: ApiService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [ExportComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExportComponent);
    apiService = TestBed.inject(ApiService);
    exportComponent = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(exportComponent).toBeTruthy();
  });

  it('should change includeBoardData and includePipelineData status when call ngOnChanges', () => {
    const kanbanSetting = new BoardParams({
      type: 'jira',
      token: 'test-token',
      site: 'site',
      projectKey: 'ADM',
      boardId: '2',
      teamName: '',
      teamId: '',
      email: '',
    });
    const commonReportParams = new ReportParams({
      metrics: ['Velocity', 'Cycle time'],
      startDate: new Date('2020-11-1'),
      endDate: new Date('2020-11-30'),
      considerHoliday: true,
    });
    const reportParams = {
      kanbanSetting: kanbanSetting,
      ...commonReportParams,
    };
    exportComponent.csvTimeStamp = 1467302400000;
    exportComponent.params = commonReportParams;

    exportComponent.ngOnChanges({
      params: new SimpleChange(null, reportParams, true),
    });
    fixture.detectChanges();
    expect(exportComponent.includeBoardData).toBeTrue;
    expect(exportComponent.includePipelineData).toBeTrue;
  });

  describe('should fetch report', () => {
    const response: ReportResponse = {};
    it('should set loading and reportResponse when getting response ', () => {
      spyOn(apiService, 'generateReporter').and.returnValue(of(response));
      exportComponent.fetchReports();
      fixture.detectChanges();
      expect(exportComponent.loading).toBeFalse;
      expect(exportComponent.reportResponse).toBe(response);
    });

    it('should only set loading when response is null', () => {
      spyOn(apiService, 'generateReporter').and.returnValue(of(null));
      exportComponent.fetchReports();
      fixture.detectChanges();
      expect(exportComponent.loading).toBeFalse;
    });
  });
});
