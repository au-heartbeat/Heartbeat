import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ApiService } from 'src/app/dora/service/api.service';
import moment from 'moment';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-export-excel',
  templateUrl: './export-excel.component.html',
  styleUrls: ['./export-excel.component.scss'],
})
export class ExportExcelComponent implements OnInit {
  @Input() includeBoardData: boolean;
  @Input() csvTimeStamp: number;

  constructor(private apiService: ApiService) {}

  ngOnInit() {}
  parseTimeStampToHumanDate(): string {
    return moment(this.csvTimeStamp).format('YYYY-MM-DD-kk-mm-ss');
  }

  downloadBoardExcel() {
    this.apiService.fetchExportSprintData(this.csvTimeStamp).subscribe((res) => {
      const exportedFilename = `board-data-${this.parseTimeStampToHumanDate()}.xlsx`;
      console.log(res);
      const blob = new Blob([res], {type: "application/vnd.ms.excel"});
      saveAs(blob, exportedFilename);
    })
}}
