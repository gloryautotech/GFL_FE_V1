import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { CommonService } from './common.service';
@Injectable({
  providedIn: 'root'
})
export class PrintInvoiceService {

  isPrinting = false;
  isExport = true;
  isPrint = false;
  pdfContent: BehaviorSubject<any> = new BehaviorSubject('');
  constructor(private router: Router, 
    private httpClient: HttpClient, 
    private commonService: CommonService) { }


  printDocument(documentName: string, documentData: string[], isPdf) {
    this.isPrinting = true;
    let url: any;
    if (isPdf) {
      this.router.navigate(['/export/invoice']);
    } else {
      this.isExport = false;
      this.isPrint = true;
      this.router.navigate(['/',
        {
          outlets: {
            'print': ['print', documentName, documentData.join()]
          }
        }]);
    }
  }

  onDataReady() {
    setTimeout(() => {
      window.print();
      this.isPrinting = false;
      this.router.navigate([{ outlets: { print: null } }]);
    });
  }

  getInvoiceByNoToPrint(id) {
    return this.httpClient.get(
      this.commonService.envUrl() + 'api/dispatch/getPartyWithQualityDispatchBy/' + id);
  }
}
