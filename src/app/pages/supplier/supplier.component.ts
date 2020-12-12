import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from 'app/@theme/services/common.service';
import { SupplierService } from 'app/@theme/services/supplier.service';
import { ToastrService } from 'ngx-toastr';
import * as errorData from 'app/@theme/json/error.json';
import { ExportService } from 'app/@theme/services/export.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ExportPopupComponent } from 'app/@theme/components/export-popup/export-popup.component';
import { JwtTokenService } from 'app/@theme/services/jwt-token.service';
import { SupplierGuard } from 'app/@theme/guards/supplier.guard';

@Component({
  selector: 'ngx-supplier',
  templateUrl: './supplier.component.html',
  styleUrls: ['./supplier.component.scss']
})
export class SupplierComponent implements OnInit {
  tableStyle="bootstrap";

  public errorData: any = (errorData as any).default;

  //to get SupplierList
  supplierList=[];
  supplier=[];
  headers=["Supplier Name", "Discount%", "GST%", "Payment Terms", "Remark" ];
  radioSelect = 1;
  flag = false;

  radioArray = [
    {id:1, value:"View Own"  , disabled:false},
    {id:2, value:"View Group"  , disabled:false},
    {id:3, value:"View All"  , disabled:false}
  ];
  userHeadId;
  userId;
  permissions: Number;
 
  hidden :boolean=true;
  hiddenEdit:boolean=true;
  hiddenView:boolean=true;

  ownDelete=true;
  allDelete=true;
  groupDelete=true;

  ownEdit=true;
  allEdit=true;
  groupEdit=true;
  
  constructor(
    private commonService:CommonService, 
    private supplierService:SupplierService, 
    public supplierGuard: SupplierGuard,
    private jwtToken: JwtTokenService,
    private router:Router, 
    private toastr: ToastrService,
    private exportService: ExportService,
    private modalService: NgbModal,

    ) { }
 
  ngOnInit(): void {

    this.userId = this.commonService.getUser();
    this.userId = this.userId['userId'];
    this.userHeadId = this.commonService.getUserHeadId();
    this.userHeadId = this.userHeadId['userHeadId'];
    this.getViewAccess();
    this.getSupplierList(this.userId,"own");
    this.getDeleteAccess();
    this.getEditAccess();
  }

  onChange(event){
    this.supplierList=[];
    switch(event){
      case 1: 
              this.getSupplierList(this.userId,"own");
              this.hidden=this.ownDelete; 
              this.hiddenEdit=this.ownEdit;
              break;

      case 2: 
              this.getSupplierList(this.userHeadId,"group");
              this.hidden=this.groupDelete;
              this.hiddenEdit=this.groupEdit;
              break;

      case 3:
              this.getSupplierList(0,"all");
              this.hidden=this.allDelete;
              this.hiddenEdit=this.allEdit;
              break;
    }
  }

  open(){
    this.flag=true;
   
    const modalRef = this.modalService.open(ExportPopupComponent);
     modalRef.componentInstance.headers = this.headers;
     modalRef.componentInstance.list = this.supplier;
  }

  public getSupplierList(id,getBy){
    this.supplierService.getAllSupplier(id,getBy).subscribe(
      data=>{
        this.supplierList=data['data']
        this.supplier=this.supplierList.map((element)=>({supplierName:element.supplierName, discountPercentage: element.discountPercentage,
          gstPercentage: element.gstPercentage, paymentTerms:element.paymentTerms, remark:element.remark }))
          console.log(this.supplier);
        //this.router.navigate(['pages/supplier']);
      },
      error=>{
        //toaster
        this.toastr.error(errorData.Serever_Error);
      }
    )
  }

  getViewAccess(){
    if(!this.supplierGuard.accessRights('view')){
      this.radioArray[0].disabled=true;
    }
    else
    this.radioArray[0].disabled=false;
     if(!this.supplierGuard.accessRights('view group')){
      this.radioArray[1].disabled=true;
    }
    else
    this.radioArray[1].disabled=false;
     if(!this.supplierGuard.accessRights('view all')){
      this.radioArray[2].disabled=true;
    }
    else
    this.radioArray[2].disabled=false;

  }

  getDeleteAccess(){
    if(this.supplierGuard.accessRights('delete')){
      this.ownDelete=false;
    }
     if(this.supplierGuard.accessRights('delete group')){
      this.groupDelete=false;
    }
     if(this.supplierGuard.accessRights('delete all')){
      this.allDelete=false;
    }
  }

  getEditAccess(){
    if(this.supplierGuard.accessRights('edit')){
      this.ownEdit=false;
    }
     if(this.supplierGuard.accessRights('edit group')){
      this.groupEdit=false;

    }
     if(this.supplierGuard.accessRights('edit all')){
      this.allEdit=false;
    }
  }


}
