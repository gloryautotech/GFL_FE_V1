import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { ShadeService } from "app/@theme/services/shade.service";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { ConfirmationDialogComponent } from "app/@theme/components/confirmation-dialog/confirmation-dialog.component";
import * as errorData from "app/@theme/json/error.json";

import { ToastrService } from "ngx-toastr";
import { CommonService } from "app/@theme/services/common.service";
import { ExportService } from "app/@theme/services/export.service";
import { ExportPopupComponent } from "app/@theme/components/export-popup/export-popup.component";
import { JwtTokenService } from "app/@theme/services/jwt-token.service";
import { ShadeGuard } from "app/@theme/guards/shade.guard";

@Component({
  selector: "ngx-shade",
  templateUrl: "./shade.component.html",
  styleUrls: ["./shade.component.scss"],
})
export class ShadeComponent implements OnInit {
  public errorData: any = (errorData as any).default;

  tableStyle = "bootstrap";
  shadeList = [];
  shade = [];
  headers = [
    "Party Shade No",
    "Process Name",
    "Quality Id",
    "Quality Name",
    "Party Name",
    "Color Tone",
  ];
  radioSelect = 1;
  flag = false;

  radioArray = [
    { id: 1, value: "View Own", disabled: false },
    { id: 2, value: "View Group", disabled: false },
    { id: 3, value: "View All", disabled: false },
  ];
  userHeadId;
  userId;
  permissions: Number;

  hidden: boolean = true;
  delete: Boolean = false;
  delete_group: Boolean = false;
  delete_all: Boolean = false;

  hiddenEdit: boolean = true;
  edit: Boolean = false;
  edit_group: Boolean = false;
  edit_all: Boolean = false;

  hiddenView: boolean = true;
  view: Boolean = false;
  view_group: Boolean = false;
  view_all: Boolean = false;

  hiddenCol: boolean = true;

  ownDelete = true;
  allDelete = true;
  groupDelete = true;

  ownEdit = true;
  allEdit = true;
  groupEdit = true;

  constructor(
    private shadeService: ShadeService,
    private route: Router,
    private modalService: NgbModal,
    private toastr: ToastrService,
    public shadeGuard: ShadeGuard,
    private jwtToken: JwtTokenService,
    private commonService: CommonService,
    private exportService: ExportService
  ) {}

  ngOnInit(): void {
    this.userId = this.commonService.getUser();
    this.userId = this.userId["userId"];
    this.userHeadId = this.commonService.getUserHeadId();
    this.userHeadId = this.userHeadId["userHeadId"];
    this.getViewAccess();
    this.getallShades(this.userId, "own");
    this.getDeleteAccess();
    this.getEditAccess();
  }

  onChange(event){
    this.shadeList=[];
    switch(event){
      case 1: 
              this.getallShades(this.userId,"own");
              this.hidden=this.ownDelete; 
              this.hiddenEdit=this.ownEdit;
              break;

      case 2: 
              this.getallShades(this.userHeadId,"group");
              this.hidden=this.groupDelete;
              this.hiddenEdit=this.groupEdit;
              break;

      case 3:
        this.getallShades(0, "all");
        this.hidden = this.allDelete;
        this.hiddenEdit = this.allEdit;
        break;
    }
  }

  open() {
    this.flag = true;

    const modalRef = this.modalService.open(ExportPopupComponent);
    modalRef.componentInstance.headers = this.headers;
    modalRef.componentInstance.list = this.shade;
  }

  getallShades(id, getBy) {
    this.shadeService.getShadeMastList(id, getBy).subscribe(
      (data) => {
        this.shadeList = data["data"];
        if(this.shadeList){
          this.shade = this.shadeList.map((element) => ({
            partyShadeNo: element.partyShadeNo,
            processName: element.processName,
            qualityId: element.qualityId,
            qualityName: element.qualityName,
            partyName: element.partyName,
            colorTone: element.colorTone,
          }));
        }
      },
      (error) => {
        this.toastr.error(errorData.Serever_Error);
      }
    );
  }

  deleteShade(id) {
    const modalRef = this.modalService.open(ConfirmationDialogComponent, {
      size: "sm",
    });
    modalRef.result.then((result) => {
      if (result) {
        this.shadeService.deleteShadeData(id).subscribe(
          (data) => {
            this.onChange(this.radioSelect);
            this.toastr.success(errorData.Delete);
          },
          (error) => {
            this.toastr.error(errorData.Serever_Error);
          }
        );
      }
    });
  }


  getViewAccess(){
    if(!this.shadeGuard.accessRights('view')){
      this.radioArray[0].disabled=true;
    }
    else
    this.radioArray[0].disabled=false;
     if(!this.shadeGuard.accessRights('view group')){
      this.radioArray[1].disabled=true;
    }
    else
    this.radioArray[1].disabled=false;
     if(!this.shadeGuard.accessRights('view all')){
      this.radioArray[2].disabled=true;
    }
    else
    this.radioArray[2].disabled=false;

  }

  getDeleteAccess(){
    if(this.shadeGuard.accessRights('delete')){
      this.ownDelete=false;
    }
     if(this.shadeGuard.accessRights('delete group')){
      this.groupDelete=false;
    }
     if(this.shadeGuard.accessRights('delete all')){
      this.allDelete=false;
    }
  }

  getEditAccess(){
    if(this.shadeGuard.accessRights('edit')){
      this.ownEdit=false;
    }
     if(this.shadeGuard.accessRights('edit group')){
      this.groupEdit=false;

    }
     if(this.shadeGuard.accessRights('edit all')){
      this.allEdit=false;
    }
  }
}
