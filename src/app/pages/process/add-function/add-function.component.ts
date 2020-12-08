import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ChemicalReq, Dosing, FunctionObj, OperatorMessage, PumpControl, TempratureControl, WaterControl } from 'app/@theme/model/process';
import { SupplierService } from 'app/@theme/services/supplier.service';
import * as errorData from "app/@theme/json/error.json";
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'ngx-add-function',
  templateUrl: './add-function.component.html',
  styleUrls: ['./add-function.component.scss']
})
export class AddFunctionComponent implements OnInit {
  public errorData: any = (errorData as any).default;
  @Input() position;
  @Input() functionList = [];
  @Input() editFunction: any;
  positionValues = [];
  tempFuncPosition = 1;
  funcObj = new FunctionObj();
  dosing = new Dosing();
  tempDosing: any = [];
  tempratureControl = new TempratureControl();
  tempTemprature: any = [];
  pumpControl = new PumpControl();
  tempPump: any = [];
  waterControl = new WaterControl();
  tempWater: any = [];
  operatorMessage = new OperatorMessage();
  tempOperator: any = [];
  chemicalSubRecordArray: ChemicalReq[] = [];
  chemicalSubRecord: ChemicalReq;
  rowChemicalData: any;
  functionDropdown = [
    { 'id': 'dosing', 'name': 'Dosing' },
    { 'id': 'temperature', 'name': 'Temperature Control' },
    { 'id': 'pump', 'name': 'Pump Control' },
    { 'id': 'water', 'name': 'Water Control' },
    { 'id': 'operator', 'name': 'Operator Message' }];
  waterList = [
    { 'id': 'water1', 'name': 'water1' },
    { 'id': 'water2', 'name': 'water2' }];
  drainTypeList = [
    { 'id': 'Complete Drain (at 0 bar)', 'name': 'Complete Drain (at 0 bar)' },
    { 'id': 'Pressurize Drain (at 1 bar)', 'name': 'Pressurize Drain (at 1 bar)' }];
  fillList = [
    { 'id': 'Post Fill Fresh Water', 'name': 'Post Fill Fresh Water' },
    { 'id': 'Pre Fill Fresh Water', 'name': 'Pre Fill Fresh Water' },
    { 'id': 'Post Fill Machine Water', 'name': 'Post Fill Machine Water' },
    { 'id': 'Pre Fill Machine Water', 'name': 'Pre Fill Machine Water' }]
  fillLevelList = [
    { 'id': 'Level 1', 'name': 'Level 1' },
    { 'id': 'Level 2', 'name': 'Level 2' }];
  operatorMessageList = [
    { 'id': '1', 'name': 'Load Fabric' },
    { 'id': '2', 'name': 'UnLoad Fabric' },
    { 'id': '3', 'name': 'Close the Door' },
    { 'id': '4', 'name': 'Custom Message' }]
  modalSubmitted: boolean = false;
  submitButton = 'ADD';
  chemicalcolumnDefs = [
    { headerName: 'Actions', field: 'index', width: 70 },
    { headerName: 'Item Name', field: 'itemName', width: 90 },
    { headerName: 'Concentration', field: 'concentration', width: 90 },
    { headerName: 'LR/F_WT', field: 'lr_or_fabric_wt', width: 90 },
    { headerName: 'Supplier Name', field: 'supplierName', width: 90 },
  ];
  supplierList: any = [];
  constructor(public activeModal: NgbActiveModal, private supplierService: SupplierService,
    private toastr: ToastrService) {
    this.chemicalSubRecord = new ChemicalReq();
  }

  ngOnInit(): void {
    if (!this.editFunction) {
      if (this.position > 0) {
        this.funcObj.funcPosition = this.position;
        for (let i = 1; i <= this.position; i++) {
          this.positionValues.push(i);
        }
      }
    } else {
      this.submitButton = "Update";
      if (this.position > 0) {
        this.funcObj.funcPosition = this.position;
        let index = this.functionList.findIndex(v => v.funcPosition == this.position);
        if (index > -1) {
          let ele = this.functionList[index];
          this.funcObj.funcName = ele.funcName;
          this.funcObj.funcPosition = ele.funcPosition;
          this.funcObj.funcValue = ele.funcValue;
          this.dosing = ele.dosingFunc;
          // if (this.dosing.dosingChemical.length) {
          //   this.dosing.dosingChemical.forEach((ele, index) => {
          //     ele.index = index + 1;
          //   });
          //   this.chemicalSubRecordArray = this.dosing.dosingChemical;
          //   this.rowChemicalData = [...this.chemicalSubRecordArray];
          // }
          this.waterControl = ele.waterControlFunc;
          this.tempratureControl = ele.tempratureControlFunc;
          this.pumpControl = ele.pumpControlFunc;
          this.operatorMessage = ele.operatorMessageFunc;
        }
        for (let i = 1; i <= this.functionList.length; i++) {
          this.positionValues.push(i);
        }
      }
    }
    this.getItemData()
  }

  getItemData() {
    // this.supplierService.getAllSupplierRates().subscribe(
    //   (data) => {
    //     if (data["success"]) {
    //       if (data["data"] && data["data"].length > 0) {
    //         this.supplierList = data["data"];
    //       } else {
    //         this.toastr.error(data["msg"]);
    //       }
    //     } else {
    //       this.toastr.error(data["msg"]);
    //     }
    //   },
    //   (error) => {
    //     this.toastr.error(errorData.Serever_Error);
    //   }
    // );
  }

  onWaterTypeChange() {
    if (this.waterControl.type == 'water') {
      this.waterControl.drainType = null;
    } else {
      this.waterControl.jetLevel = 0;
      this.waterControl.fabricRatio = null;
      this.waterControl.waterType = null;
    }
  }

  onDoseTypeChange() {
    if (this.dosing.doseType == 'color') {
      this.dosing.doseWhileHeating = false;
    }
  }

  onSubmit(myForm) {
    this.modalSubmitted = true;
    if (myForm.valid) {
      let i = this.functionDropdown.findIndex(v => v.id === this.funcObj.funcValue);
      if (i > -1) {
        this.funcObj.funcName = this.functionDropdown[i].name;
      }
      else {
        this.funcObj.funcName = '';
      }
      if (this.funcObj.funcValue === 'temperature') {
        this.tempTemprature = this.tempratureControl;
        this.funcObj.tempratureControlFunc = this.tempTemprature;
      } else if (this.funcObj.funcValue === 'dosing') {
        this.tempDosing = this.dosing;
        this.funcObj.dosingFunc = this.tempDosing;
      } else if (this.funcObj.funcValue === 'operator') {
        let i = this.operatorMessageList.findIndex(v => v.id === this.operatorMessage.operatorCode);
        if (i > -1 && i != 3) {
          this.operatorMessage.operatorMessage = this.operatorMessageList[i].name;
        }
        this.tempOperator = this.operatorMessage;
        this.funcObj.operatorMessageFunc = this.tempOperator;
      }
      else if (this.funcObj.funcValue === 'water') {
        this.tempWater = this.waterControl;
        this.funcObj.waterControlFunc = this.tempWater
      } else if (this.funcObj.funcValue === 'pump') {
        this.tempPump = this.pumpControl;
        this.funcObj.pumpControlFunc = this.tempPump;
      }
      this.activeModal.close(this.funcObj);
    }
    else {
      return;
    }
  }
}