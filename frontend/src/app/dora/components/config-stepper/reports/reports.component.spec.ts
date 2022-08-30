import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExportComponent } from './reports.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NgModule, SimpleChange, SimpleChanges } from '@angular/core';
import { ReportParams } from 'src/app/dora/models/reportParams';
import { element } from 'protractor';
import { metrics } from '../../../utils/config';
import { Metric } from 'src/app/dora/types/metric';
import { MetricsSource } from 'src/app/dora/types/metricsSource';

describe('ExportComponent', () => {
  let exportComponent: ExportComponent;
  let fixture: ComponentFixture<ExportComponent>;
  let element: any;

  const metrics: Metric[] = [
    {
      name: 'Classification',
      roles: ['board'],
    },
    {
      name: 'Lead time for changes',
      roles: ['sourceControl', 'pipelineTool'],
    },
    {
      name: 'Mean time to recovery',
      roles: ['pipelineTool'],
    },
  ];
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [ExportComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExportComponent);
    exportComponent = fixture.componentInstance;
    element = fixture.nativeElement;
    exportComponent.params;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(exportComponent).toBeTruthy();
  });

  it('should call ngOnChanges', () => {
    const date = new Date();
    const params = {
      metrics: ['metrics'],
      startDate: '00:00:00',
      endDate: '23:59:59',
      considerHoliday: true,
    };

    const simpleChange = new SimpleChange('pre', 'cur', true);

    const simpleChanges: SimpleChanges = { simpleChange };

    exportComponent.ngOnChanges({
      params: new SimpleChange(null, 'test', true),
    });

    spyOn(exportComponent, 'ngOnChanges').and.callThrough();
    exportComponent.ngOnChanges(simpleChanges);
    fixture.detectChanges();
    expect(exportComponent.includeBoardData).toBeTrue;
    expect(exportComponent.includePipelineData).toBeTrue;

    // expect(
    //   exportComponent.ngOnChanges({
    //     params: new SimpleChange(null, 'test', true),
    //   })
    // ).toHaveBeenCalled;
  });
});
