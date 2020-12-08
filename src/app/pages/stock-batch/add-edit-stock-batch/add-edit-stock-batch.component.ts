import { Component, OnInit } from "@angular/core";
import { StockBatch, BatchData } from "app/@theme/model/stock-batch";

import * as errorData from "app/@theme/json/error.json";
import { PartyService } from "app/@theme/services/party.service";
import { ToastrService } from "ngx-toastr";
import { StockBatchService } from "app/@theme/services/stock-batch.service";
import { ActivatedRoute, Router } from "@angular/router";
import { QualityService } from "app/@theme/services/quality.service";
import { NgbDateAdapter, NgbDateNativeAdapter } from '@ng-bootstrap/ng-bootstrap';
import { CommonService } from 'app/@theme/services/common.service';

@Component({
  selector: "ngx-add-edit-stock-batch",
  templateUrl: "./add-edit-stock-batch.component.html",
  styleUrls: ["./add-edit-stock-batch.component.scss"],
  providers: [{ provide: NgbDateAdapter, useClass: NgbDateNativeAdapter }]

})
export class AddEditStockBatchComponent implements OnInit {
  public errorData: any = (errorData as any).default;
  qualityList: any;

  formSubmitted = false;
  
  party: any[];
  user: any;
  userHead;
  index;
  stockList;
  wtPer100M;
  j=0;
  k=0;
  batch = {
    batchId: 0,
    mtr: 0,
    wt: 0,
  };

  dummy = {
    batchId: 0,
    batchMW: null,

  };

  stockDataValues = [
    {
      batchId: null,
      batchMW: [
        {
          mtr: null,

          wt: null,
        },

      ],
    },
  ];

  stockBatchArray: BatchData[] = [];
  stockBatch: StockBatch = new StockBatch();
  stockBatchData: BatchData = new BatchData();
  blockNumber;
  currentStockBatch;
  isQualitySelected:Boolean = false;
  flag=1;

  constructor(
    private partyService: PartyService,
    private toastr: ToastrService,
    private route: Router,
    private qualityService: QualityService,
    private stockBatchService: StockBatchService,
    private _route: ActivatedRoute,
    private commonService: CommonService
  ) {}

  ngOnInit(): void {
    this.user = this.commonService.getUser();
    this.userHead = this.commonService.getUserHeadId();
    this.getPartyList();
    this.getQualityList();
    this.currentStockBatch = this._route.snapshot.paramMap.get("id");
    if (this.currentStockBatch != null || this.currentStockBatch != undefined)
      this.getUpdateData();
  }

  getUnit() {
    if(this.stockBatch.qualityId==null)
    {
      
      this.flag=1;
      this.toastr.error("Please select quality first");
    }
    else{
      this.flag=0;
    


    this.qualityList.forEach((element) => {
      if (element.id == this.stockBatch.qualityId)
        this.stockBatch.unit = element.unit;
        this.wtPer100M = element.wtPer100m;
    });
  }
  }

  // setQualityByParty(event) {
  //   if (event != undefined) {
  //     if (this.stockBatch.partyId) {
  //       this.shadeService.getQualityFromParty(this.stockBatch.partyId).subscribe(
  //         data => {
  //           this.qualityList = data['data'].qualityDataList;
  //           //this.stockBatch.partyId = data['data'].partyId
  //           console.log(this.qualityList);
  //           this.qualityList.forEach((element) => {
  //             console.log(this.qualityList)
  //             if (element.id == this.stockBatch.qualityId)
  //               this.stockBatch.unit = element.unit;
  //             console.log(element.unit);
  //           });

  //         },
  //         error => {
  //           this.toastr.error(errorData.Serever_Error);
  //         }
  //       )
  //     }
  //   }
  //   else {
  //     this.stockBatch.partyId = null;
  //     this.stockBatch.qualityId = null;
  //     this.stockBatch.unit = null;
  //     this.getPartyList();
  //     this.getQualityList();
  //   }
  // }

  getUpdateData() {
    this.stockBatchService.getStockBatchById(this.currentStockBatch).subscribe(
      (data) => {
        if (data["success"]) {
          this.stockBatch.billDate = new Date(data["data"].billDate);
          this.stockBatch.qualityId = data["data"].qualityId;
          this.qualityList.forEach(element => {
            if(element.id==this.stockBatch.qualityId)
            {
              this.wtPer100M = element.wtPer100m;
              
            }
          
            
          });

          this.stockBatch.unit = data["data"].unit;
          this.stockBatch.stockInType = data["data"].stockInType;
          this.stockBatch.billNo = data["data"].billNo;
          this.stockBatch.chlDate = new Date(data["data"].chlDate);
          this.stockBatch.chlNo = data["data"].chlNo;
          this.stockBatch.partyId = data["data"].partyId;
         
          this.stockBatch.createdBy = data["data"].createdBy;
          this.stockBatch.createdDate = data["data"].createdDate;
          this.stockBatch.userHeadId = data["data"].userHeadId;
          this.stockBatch.remark = data["data"].remark;
          this.stockBatch.isProductionPlanned = data["data"].isProductionPlanned;
          this.stockBatch.batchData = data["data"].batchData;
          this.stockBatch.createdBy = data["data"].createdBy;
          this.stockBatch.createdDate = data["data"].createdDate;
          this.stockBatch.userHeadId = data["data"].userHeadId;
          this.setStockDataValues();
        } else this.toastr.error(data['msg']);
      },
      (error) => {
        this.toastr.error(errorData.Serever_Error);
      }
    );
  }

  setStockDataValues() {
    var prev = this.stockBatch.batchData[0].batchId;
    let k = 0;
    let i = 0;
    this.stockDataValues[0].batchId = prev;
    this.stockBatch.batchData.forEach((element) => {
      if (prev == element.batchId) {
        if (!this.stockDataValues[k])
          this.stockDataValues.push({ batchId: 0, batchMW: [] });
        if (!this.stockDataValues[k].batchMW[i])
          this.stockDataValues[k].batchMW.push({ mtr: 0, wt: 0 });
        this.stockDataValues[k].batchMW[i].mtr = element.mtr;
        this.stockDataValues[k].batchMW[i].wt = element.wt;
        i++;
      } else {
        i = 0;
        ++k;
        prev = element.batchId;
        if (!this.stockDataValues[k])
          this.stockDataValues.push({ batchId: 0, batchMW: [] });
        this.stockDataValues[k].batchId = prev;
        this.stockDataValues[k].batchMW.push({ mtr: 0, wt: 0 });
        this.stockDataValues[k].batchMW[i].mtr = element.mtr;
        this.stockDataValues[k].batchMW[i].wt = element.wt;
        i++;
      }
    });

    this.flag=0;

  }

  getQualityList() {
    this.qualityService.getQualityNameData().subscribe(
      (data) => {
        if (data["success"]) {
          if (data["data"] && data["data"].length > 0) {
            this.qualityList = data["data"];
          } else {
            this.toastr.error(errorData.Not_added);
          }
        } else {
          this.toastr.error(errorData.Internal_Error);
        }
      },
      (error) => {
        this.toastr.error(errorData.Serever_Error);
      }
    );
  }

  getPartyList() {
    this.partyService.getAllPartyNameList().subscribe(
      (data) => {
        if (data["success"]) {
          this.party = data["data"];
        } else {
          this.toastr.error(data['msg']);
        }
      },
      (error) => {
        this.toastr.error(errorData.Serever_Error);
      }
    );
  }
  batchInsertCheck(){
    if(this.stockBatch.qualityId==null)
    {
      
      this.flag=1;
      this.toastr.error("Please select quality first");
    }
    else{
      this.flag=0;
    }
  }

  // displayCondition(){

  // }

  onKeyUp(e, rowIndex, colIndex, colName, idx) {
    
    var keyCode = e.keyCode ? e.keyCode : e.which;
    if (keyCode == 13) {
      this.k=this.k+1;
      this.index = "grData" + (rowIndex + 1) + "-" + colIndex + "" + idx;
      if (rowIndex === this.stockDataValues[idx].batchMW.length - 1) {
        let item = this.stockDataValues[idx].batchMW[rowIndex];
        if (colName == "mtr") {
          if (!item.mtr) {
            this.toastr.error("Enter Meter", "Meter Field required");
            return;
          }
        } else if (colName == "wt") {
          if (!item.wt) {
            this.toastr.error("Enter Weight", "Weight Field required");
            return;
          }
        }
        let obj = {
          mtr: null,
          wt: null,
        };
        let list = this.stockDataValues[idx].batchMW;
        list.push({ ...obj });
        this.stockDataValues[idx].batchMW = [...list];
        let interval = setInterval(() => {
          let field = document.getElementById(this.index);
          if (field != null) {
            field.focus();
            clearInterval(interval);
          }
        }, 50);
      } else {
        let interval = setInterval(() => {
          let field = document.getElementById(this.index);
          if (field != null) {
            field.focus();
            clearInterval(interval);
          }
        }, 50);
        /* this.toastr.error(
           "go to any last row input to add new row",
           "Empty Field"
         );*/
      }
    }
  }

  removeCard($event, index) {
    let idCount = this.stockDataValues.length;
    let item = this.stockDataValues;
    if (idCount == 1) {
      item = null;
      let obj = {
        batchId: null,
        batchMW: [
          {
            mtr: null,
            wt: null,
          },
        ],
      };
      this.stockDataValues = [obj];
    } else {
      let removed = item.splice(index, 1);
      let list = item;
      this.stockDataValues = [...list];
    }
  }

  removeItem(id, row) {
    let idCount = this.stockDataValues[row].batchMW.length;
    let item = this.stockDataValues[row].batchMW;
    if (idCount == 1) {
      item[0].mtr = null;
      item[0].wt = null;

      let list = item;
      this.stockDataValues[row].batchMW = [...list];
    } else {
      let removed = item.splice(id, 1);
      let list = item;
      this.stockDataValues[row].batchMW = [...list];
    }
  }

  addStockBatch(myForm) {
    this.formSubmitted = true;
    if (myForm.valid ) {
      this.stockBatch.createdBy = this.user.userId;
      this.stockBatch.userHeadId = this.userHead.userHeadId;
      let k = 0;
      for (let i = 0; i < this.stockDataValues.length; i++) {
        for (let j = 0; j < this.stockDataValues[i].batchMW.length; j++) {
          this.stockBatchArray.push({ batchId: 0, mtr: 0, wt: 0 });
          this.stockBatchArray[k].batchId = this.stockDataValues[i].batchId;
          this.stockBatchArray[k].mtr = this.stockDataValues[i].batchMW[j].mtr;
          this.stockBatchArray[k].wt = this.stockDataValues[i].batchMW[j].wt;
          k++;
        }
      }
      this.stockBatch.batchData = this.stockBatchArray;
      this.stockBatchService.addStockBatch(this.stockBatch).subscribe(
        (data) => {
          if (data["success"]) {
            this.route.navigate(["/pages/stock-batch"]);
            this.toastr.success(errorData.Add_Success);
          } else {
            this.stockBatchArray = [];
            this.toastr.error(data['msg']);

          }
        },
        (error) => {
          this.stockBatchArray = [];
          this.toastr.error(errorData.Serever_Error);
        }
      );
    }
  }

  updateStockBatch(stockBatch) {
    this.formSubmitted = true;
    if (stockBatch.valid) {
      this.stockBatch.updatedBy = this.user.userId;
      let k = 0;
      for (let i = 0; i < this.stockDataValues.length; i++) {
        for (let j = 0; j < this.stockDataValues[i].batchMW.length; j++) {
          this.stockBatchArray.push({ batchId: 0, mtr: 0, wt: 0 });
          this.stockBatchArray[k].batchId = this.stockDataValues[i].batchId;
          this.stockBatchArray[k].mtr = this.stockDataValues[i].batchMW[j].mtr;
          this.stockBatchArray[k].wt = this.stockDataValues[i].batchMW[j].wt;
          k++;
        }
      }
      this.stockBatch.batchData = this.stockBatchArray;
      this.stockBatch.id = parseInt(this.currentStockBatch);
      this.stockBatchService.updateStockBatch(this.stockBatch).subscribe(
        (data) => {
          if (data["success"]) {
            this.route.navigate(["/pages/stock-batch"]);
            this.toastr.success(errorData.Update_Success);
          }
          else {
            this.stockBatchArray = [];
            this.toastr.error(data["msg"]);
          }
        },
        (error) => {
          this.stockBatchArray = [];
          this.toastr.error(errorData.Update_Error);
        }
      );
    }
  }

  addNew(e, myForm) {
    //event.preventDefault();
  
    let item = this.stockDataValues;
    var ob = {
      batchId: null,
      batchMW: [
        {
          mtr: null,

          wt: null,
        },

      ],
    };
    if(this.flag==1 || this.stockDataValues[this.j].batchId==null||this.stockDataValues[this.j].batchMW[this.k].mtr==null  )
    {
      this.toastr.error("Please fill all the required fields");
    }
    else{
      //item.unshift({...ob});
      item.push({ ...ob });
      this.stockDataValues = item;
      const className = "collapsible-panel--expanded";
      if (e.target.classList.contains(className)) {
        e.target.classList.remove(className);
      } else {
        e.target.classList.add(className);
      }
      this.j=this.j+1;
      this.k=0;
    }
    
    
  }

  calculateWt(meter, i, j, col) {
    let w;
    w = (meter / 100) * this.wtPer100M;
    this.stockDataValues[i].batchMW[j].wt = parseInt(w);
  }

  calculateMtr(weight, i, j, col) {
    let m;
    console.log(this.wtPer100M)
    m = (weight * 100) / this.wtPer100M;
    this.stockDataValues[i].batchMW[j].mtr = parseInt(m);
  }
}
