import {Component, Input, OnInit} from '@angular/core';
import * as echarts from 'echarts';
import {EChartsOption} from "echarts";
import {BlockedAndDevelopingPercentage} from "../../../types/reportResponse";

@Component({
  selector: 'app-average-cycle-time-report',
  templateUrl: './average-cycle-time.component.html',
  styleUrls: ['./average-cycle-time.component.scss'],
})
export class AverageCycleTimeReportComponent implements OnInit {
  ngOnInit(): void {
    const myCharts = echarts.init(document.getElementById('averageCycleTime'));
    const myOption: EChartsOption = {};
    myCharts.setOption(myOption);
  }
}
