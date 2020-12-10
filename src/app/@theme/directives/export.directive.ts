import { Directive, ElementRef, HostListener, Input, SimpleChanges } from '@angular/core';
import {ExportService} from '../services/export.service';
import { ExportPopupComponent } from 'app/@theme/components/export-popup/export-popup.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Directive({
  selector: '[ngxExport]'
})
export class ExportDirective {

  constructor(
    private exportService: ExportService, 
    private el: ElementRef,
    private modalService: NgbModal,
    ) {  }

  @Input('ngxExport') list: any[];

  @Input('headers') headers: any[];

  @Input('flag') flag: boolean;

  @Input() fileType: string;

  @Input() fileName: string;

  @HostListener('click', ['$event']) onClick() {

  console.log(this.fileType);
  console.log(this.fileName);
   
        this.exportService.exportExcel(this.list, this.fileName, this.headers);
    
}
}