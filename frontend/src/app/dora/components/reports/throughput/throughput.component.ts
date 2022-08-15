import { Component, Input, OnInit } from '@angular/core';
import * as echarts from 'echarts';
import { EChartsOption } from 'echarts';
import { CompletedCardsNumber } from 'src/app/dora/types/reportResponse';
import * as ss from 'simple-statistics';

@Component({
  selector: 'app-throughput-report',
  templateUrl: './throughput.component.html',
  styleUrls: ['./throughput.component.scss'],
})
export class ThroughputReportComponent implements OnInit {
  @Input() completedCardsNumber: CompletedCardsNumber[];

  ngOnInit(): void {
    const sprintNumber = this.completedCardsNumber.length;
    const cardsNumber = [];
    const sprintName = [];
    this.completedCardsNumber.forEach((curSprint) => {
      cardsNumber.push(curSprint.value);
      sprintName.push(curSprint.sprintName);
    });
    const arrayRegression = [];
    let x = 0;
    for (let i = 0; i < sprintNumber; i++) {
      const cur = cardsNumber[i];
      x += 1;
      arrayRegression.push([x, cur]);
    }

    const model = ss.linearRegression(arrayRegression);
    const myCharts = echarts.init(document.getElementById('throughput'));
    const lastRegressionValue = this.calculateEndPoint(model, sprintNumber);
    const myOption: EChartsOption = {
      title: {
        text: 'Throughput - Completed Cards By Sprint',
        left: '50%',
        textAlign: 'center',
        textStyle: {
          fontSize: 30,
        },
        top: '3%',
      },

      grid: {
        bottom: '3%',
        top: '20%',
        left: '14%',
        right: '14%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: sprintName,
        boundaryGap: true,
        axisTick: {
          alignWithLabel: true,
        },
      },
      yAxis: {
        type: 'value',
        axisLine: {
          show: true,
        },
        splitLine: {
          show: false,
        },
      },

      series: [
        {
          data: cardsNumber,
          type: 'line',
          smooth: true,
          symbolSize: 0.1,
          label: { show: true, fontSize: 14 },
          lineStyle: {
            width: 5,
            color: '#0070c0',
          },
          markLine: {
            symbol: 'none',
            lineStyle: {
              type: 'dotted',
              width: 5,
              color: '#39bcd2',
            },
            data: [
              [
                {
                  coord: [this.completedCardsNumber[0].sprintName, model.m + model.b],
                },
                {
                  coord: [this.completedCardsNumber[lastRegressionValue.x].sprintName, lastRegressionValue.y],
                },
              ],
            ],
          },
        },
      ],
      toolbox: {
        feature: {
          saveAsImage: { backgroundColor: '#FFF' },
        },
      },
    };
    myCharts.setOption(myOption);
  }
  calculateEndPoint(model: { m: number; b: number }, sprintNumber: number): { x: number; y: number } {
    const yTemp = model.m * sprintNumber + model.b;
    if (yTemp >= 0 || model.m === 0) {
      return {
        x: sprintNumber,
        y: yTemp,
      };
    }
    const x = parseInt(((0 - model.b) / model.m).toFixed(0)) - 1;
    return {
      x,
      y: x * model.m + model.b,
    };
  }
}
