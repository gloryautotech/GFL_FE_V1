import {
  Component,
  ElementRef,
  OnInit,
  Renderer2,
  ViewChild,
} from "@angular/core";
import * as errorData from "../../../@theme/json/error.json";
import { ToastrService } from "ngx-toastr";
import { ActivatedRoute, Router } from "@angular/router";
import * as _ from "lodash";
import {
  NgbDateAdapter,
  NgbDateNativeAdapter,
} from "@ng-bootstrap/ng-bootstrap";
import {
  StockBatch,
  BatchCard,
  BatchMrtWt,
  BatchData,
} from "../../..//@theme/model/stock-batch";
import { PartyService } from "../../..//@theme/services/party.service";
import { QualityService } from "../../..//@theme/services/quality.service";
import { StockBatchService } from "../../..//@theme/services/stock-batch.service";
import { CommonService } from "../../..//@theme/services/common.service";

@Component({
  selector: "ngx-add-edit-stock-batch",
  templateUrl: "./add-edit-stock-batch.component.html",
  styleUrls: ["./add-edit-stock-batch.component.scss"],
  providers: [{ provide: NgbDateAdapter, useClass: NgbDateNativeAdapter }],
})
export class AddEditStockBatchComponent implements OnInit {
  @ViewChild("forFocus") searchElement: ElementRef;
  public loading = false;
  public disableButton = false;
  public formSubmitted = false;
  public addFlag = true;
  public zeroValueBatch = false;
  production_flag: any = [];

  public errorData: any = (errorData as any).default;
  qualityList: any = [];
  partyList: any = [];

  user: any;
  userHead;
  index;
  wtPer100M;
  maxDate: any;
  currentStockBatchId;
  rearrangeStartIndex: any;
  dateForPicker = new Date();

  deleteFlag = 0;
  validationCardRowIndex = 0;
  flag = 0;

  stockDataValues = [
    {
      batchId: null,
      totalWt: null,
      totalMt: null,
      isProductionPlanned: false,
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
  batchIdArray = [];
  totalMtr: number = 0;
  wtArray: any[] = [];
  mtArray: any[] = [];
  totalWt: number = 0;
  dateRange: any;
  weightFlag: boolean = false;
  weight = {};
  MtWtIndex = 0;
  constructor(
    private partyService: PartyService,
    private toastr: ToastrService,
    private route: Router,
    private qualityService: QualityService,
    private stockBatchService: StockBatchService,
    private _route: ActivatedRoute,
    private commonService: CommonService,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    this.getQualityList();
    this.getPartyList();
    this.getQualityList();
    this.currentStockBatchId = this._route.snapshot.paramMap.get("id");
    if (this.currentStockBatchId) {
      this.addFlag = false;
      this.getStockBatchById();
    }
    this.maxDate = new Date(
      this.dateForPicker.getFullYear(),
      this.dateForPicker.getMonth(),
      this.dateForPicker.getDate(),
      23,
      59
    );
    this.stockBatch.billDate = this.maxDate;
    this.stockBatch.chlDate = this.maxDate;
    this.user = this.commonService.getUser();
    this.userHead = this.commonService.getUserHeadId();
  }

  getPartyList() {
    this.loading = true;
    this.partyService.getAllPartyNameList().subscribe(
      (data) => {
        if (data["success"]) {
          this.partyList = data["data"];
        } else {
          this.toastr.error(data["msg"]);
        }
        this.loading = false;
      },
      (error) => {
        // this.toastr.error(errorData.Serever_Error);
        this.loading = false;
      }
    );
  }
  getQualityList() {
    this.loading = true;
    this.qualityService.getQualityNameData().subscribe(
      (data) => {
        if (data["success"]) {
          if (data["data"] && data["data"].length > 0) {
            this.qualityList = data["data"];
          } else {
            // this.toastr.error(errorData.Not_added);
          }
        } else {
          //this.toastr.error(errorData.Internal_Error);
        }
        this.loading = false;
      },
      (error) => {
        // this.toastr.error(errorData.Serever_Error);
        this.loading = false;
      }
    );
  }
  setQualityByParty(event) {
    this.loading = true;
    if (event != undefined) {
      if (this.stockBatch.partyId) {
        this.qualityList = [];
        this.qualityService
          .getQualityByParty(this.stockBatch.partyId)
          .subscribe(
            (data) => {
              if (data["success"])
                this.qualityList = data["data"].qualityDataList;
              if (this.qualityList && !this.qualityList.length)
                this.stockBatch.qualityId = null;
              // else
              // {
              //   this.stockBatch.qualityId = this.qualityList[0].qualityEntryId;
              // }
            },
            (error) => {
              this.loading = false;
            }
          );
        this.loading = false;
      } else {
        this.loading = false;
      }
    } else {
      this.stockBatch.partyId = null;
      this.stockBatch.qualityId = null;
      this.stockBatch.unit = null;
      this.getPartyList();
      this.getQualityList();
      this.loading = false;
    }
  }
  getUnit(event) {
    this.weightFlag = false;
    if (event != undefined) {
      if (this.stockBatch.qualityId == null) {
        this.flag = 1;
        this.toastr.error("Please select quality first");
      } else {
        this.flag = 0;
        this.weightFlag = false;
        this.qualityList.forEach((element) => {
          element.id ? (this.stockBatch.partyId = element.partyId) : null;
          let id = element.id ? element.id : element.qualityEntryId;
          if (id == this.stockBatch.qualityId) {
            this.stockBatch.unit = element.unit;
            if (this.stockBatch.unit === "weight") {
              this.weightFlag = true;
            } else {
              this.weightFlag = false;
            }
            this.wtPer100M = element.wtPer100m;
          }
        });

        //re-calculate mtr/wt when quality changed
        this.reCalcMTWTValue();
      }
    } else {
      this.stockBatch.partyId = null;
      this.stockBatch.unit = null;
      this.getQualityList();
    }
  }
  reCalcMTWTValue() {
    this.weight = {};
    this.stockDataValues.forEach((e, i) => {
      e.batchMW.forEach((e1, j) => {
        if (this.stockBatch.unit == "meter") {
          this.calculateWt(e1.mtr, i, j, 1);
        } else {
          this.calculateMtr(e1.wt, i, j, 1);
        }
      });
    });
  }
  getStockBatchById() {
    this.loading = true;
    this.stockBatchService
      .getStockBatchById(this.currentStockBatchId)
      .subscribe(
        (data) => {
          if (data["success"]) {
            this.stockBatch.billDate = new Date(data["data"].billDate);
            this.stockBatch.qualityId = data["data"].qualityId;
            //check quality list and get wtPer100Mtr
            let inter = setInterval(() => {
              if (this.qualityList.length != 0) {
                this.qualityList.forEach((element) => {
                  if (element.id == this.stockBatch.qualityId) {
                    this.wtPer100M = element.wtPer100m;
                  }
                });
                clearInterval(inter);
              }
            }, 10);
            this.stockBatch = data["data"];
            this.stockBatch.chlDate = new Date(this.stockBatch.chlDate);
            this.stockBatch.billDate = new Date(this.stockBatch.billDate);
            if (!this.stockBatch.batchData.length) {
              //this.zeroValueBatch = true;
            } else {
              this.stockBatch.batchData = _.sortBy(
                data["data"].batchData,
                "batchId"
              );
              let batch1 = this.stockBatch.batchData.map(element => {
                element.batchId
              })
             
              this.setStockDataValues1();
            }
          } else {
            this.toastr.error(data["msg"]);
          }
          this.loading = false;
        },
        (error) => {
          this.loading = false;
        }
      );
  }
  setStockDataValues1() {
    let batchIDs = [
      ...new Set(this.stockBatch.batchData.map((x) => x.batchId)),
    ];
    this.stockDataValues = [];
    batchIDs.forEach((x) => {
      this.stockDataValues.push(new BatchCard(x));
    });
    this.qualityList.forEach((element) => {
      element.id ? (this.stockBatch.partyId = element.partyId) : null;
      let id = element.id ? element.id : element.qualityEntryId;
      if (id == this.stockBatch.qualityId) {
        this.stockBatch.unit = element.unit;
        if (this.stockBatch.unit === "weight") {
          this.weightFlag = true;
        } else {
          this.weightFlag = false;
        }
        this.wtPer100M = element.wtPer100m;
      }
    });
    this.stockDataValues.forEach((batch, i) => {
      this.stockBatch.batchData.forEach((x, j) => {
        if (x.batchId == batch.batchId) {
          batch.batchMW.push(new BatchMrtWt(x.mtr, x.wt));
          batch.isProductionPlanned = x.isProductionPlanned;
        }
      });
      this.production_flag[i] = batch.isProductionPlanned
    });
    // console.log(this.production_flag);

    this.reCalcMTWTValue();
  }

  batchInsertCheck() {
    if (this.stockBatch.qualityId == null) {
      this.flag = 1;
      this.toastr.error("Please select quality first");
    } else {
      this.flag = 0;
    }
  }
  onKeyUp(e, rowIndex, colIndex, colName, idx) {
    var keyCode = e.keyCode ? e.keyCode : e.which;
    if (keyCode == 13) {
      if (this.weightFlag) {
        this.index = "grData" + (rowIndex + 1) + "-" + 1 + "" + idx;
      } else if (!this.weightFlag) {
        this.index = "grData" + (rowIndex + 1) + "-" + 0 + "" + idx;
      }
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
        //let obj:BatchMrtWt  = new BatchMrtWt();
        let obj = { mtr: null, wt: null, totalMt: null, totalWt: null };
        let list = this.stockDataValues[idx].batchMW;
        list.push({ ...obj });
        this.stockDataValues[idx].batchMW = [...list];
        let interval = setInterval(() => {
          let field = document.getElementById(this.index);
          if (field != null) {
            field.focus();
            clearInterval(interval);
          }
        }, 10);
      } else {
        let interval = setInterval(() => {
          let field = document.getElementById(this.index);
          if (field != null) {
            field.focus();
            clearInterval(interval);
          }
        }, 10);
      }
    } else {
      //count total mtr wt...
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
      this.reCalcMTWTValue();
    } else {
      item.splice(id, 1);
      this.stockDataValues[row].batchMW = [...item];
      this.reCalcMTWTValue();
    }
  }

  addNewBatch(e) {
    var ob = new BatchCard();
    ob.batchMW.push(new BatchMrtWt());
    if (this.stockDataValues.length) {
      let index = this.stockDataValues.findIndex((v) => v.batchId == null);
      if (index > -1 || this.flag) {
        this.toastr.error("Please fill all the required fields");
      } else {
        let itemList = [...this.stockDataValues];
        itemList = _.sortBy(itemList, "batchId", "asc");
        let nextBatchId = itemList[itemList.length - 1].batchId;
        ob.batchId = ++nextBatchId;
        this.wtArray = [];
        this.mtArray = [];
        this.stockDataValues.push({ ...ob });
        const className = "collapsible-panel--expanded";
        if (e.target.classList.contains(className)) {
          e.target.classList.remove(className);
        } else {
          e.target.classList.add(className);
        }
      }
    }
  }

  removeBatch(index) {
    if (this.stockDataValues.length == 1) {
      this.stockDataValues[0] = new BatchCard();
      this.stockDataValues[0].batchMW.push(new BatchMrtWt());
    } else {
      this.stockDataValues.splice(index, 1);
    }
  }

  checkDuplicates(index) {
    if (this.stockDataValues && this.stockDataValues.length) {
      let i = this.stockDataValues.findIndex(
        (v) => v.batchId == this.stockDataValues[index].batchId
      );
      if (i > -1 && i != index) {
        this.toastr.error("Cannot add duplicate batch No.");
        this.stockDataValues[index].batchId = null;
      }
    }
  }

  rearrangeBatchNo() {
    if (this.stockDataValues) {
      this.stockDataValues = _.sortBy(this.stockDataValues, "batchId", "asc");
      let initialStockBatchNo = 0;
      this.stockDataValues.forEach((ele, index) => {
        if (!index) {
          initialStockBatchNo = ele.batchId;
        } else {
          ele.batchId = ++initialStockBatchNo;
        }
      });
    }
  }

  calculateWt(meter: number, i, j, col) {
    let w: number;
    w = (meter / 100) * this.wtPer100M;
    this.stockDataValues[i].batchMW[j].wt = w.toFixed(2);
    if (this.MtWtIndex == i) {
      this.weight[j] = {
        w,
        meter,
      };
      this.calculateTotalMtrWt("meter");
      this.stockDataValues[i].totalMt = Number(
        Number(this.totalMtr).toFixed(2)
      );
      this.stockDataValues[i].totalWt = Number(Number(this.totalWt).toFixed(2));
    } else {
      this.weight = {};
      this.MtWtIndex = i;
      this.weight[j] = {
        w,
        meter,
      };
      this.calculateTotalMtrWt("meter");
      this.stockDataValues[this.MtWtIndex].totalMt = Number(
        Number(this.totalMtr).toFixed(2)
      );
      this.stockDataValues[this.MtWtIndex].totalWt = Number(
        Number(this.totalWt).toFixed(2)
      );
    }
  }
  calculateTotalMtrWt(MW): any {
    (this.totalWt = 0), (this.totalMtr = 0);
    if (MW === "meter") {
      Object.keys(this.weight).forEach((element: any) => {
        this.totalWt += +this.weight[element].w;
        this.totalMtr += +this.weight[element].meter;
      });
    } else {
      Object.keys(this.weight).forEach((element: any) => {
        this.totalWt += +this.weight[element].weight;
        this.totalMtr += +this.weight[element].m;
      });
    }
  }
  calculateMtr(weight: number, i, j, col) {
    let m: number;
    m = (weight * 100) / this.wtPer100M;
    this.stockDataValues[i].batchMW[j].mtr = m.toFixed(2);
    if (this.MtWtIndex == i) {
      this.weight[j] = {
        m,
        weight,
      };
      this.calculateTotalMtrWt("weight");
      this.stockDataValues[i].totalMt = Number(
        Number(this.totalMtr).toFixed(2)
      );
      this.stockDataValues[i].totalWt = Number(Number(this.totalWt).toFixed(2));
    } else {
      this.weight = {};
      this.MtWtIndex = i;
      this.weight[j] = {
        m,
        weight,
      };
      this.calculateTotalMtrWt("weight");
      this.stockDataValues[this.MtWtIndex].totalMt = Number(
        Number(this.totalMtr).toFixed(2)
      );
      this.stockDataValues[this.MtWtIndex].totalWt = Number(
        Number(this.totalWt).toFixed(2)
      );
    }
  }

  checkValidation(myForm) {
    let returnValue = true;
    if (this.stockDataValues && this.stockDataValues.length) {
      if (this.stockDataValues.length == 1) {
        if (
          !this.stockDataValues[0].batchId &&
          !this.stockDataValues[0].batchMW[0].mtr &&
          !this.stockDataValues[0].batchMW[0].wt
        ) {
          returnValue = false;
          if (this.stockBatch.billDate)
            if (this.stockBatch.billNo)
              if (this.stockBatch.chlDate)
                if (this.stockBatch.chlNo)
                  if (this.stockBatch.stockInType)
                    if (this.stockBatch.partyId)
                      if (this.stockBatch.qualityId) {
                        returnValue = true;
                        return returnValue;
                      }
        }
      }
      this.stockDataValues.forEach((ele) => {
        let isNullOrUndefineFlag = ele.batchId ? false : true;
        if (isNullOrUndefineFlag) {
          returnValue = false;
          return false;
        }
        if (ele.batchMW && ele.batchMW.length && ele.batchMW.length == 1) {
          let index = ele.batchMW.findIndex(
            (v) =>
              (v.wt == null || v.wt == undefined || v.wt == "") &&
              (v.mtr == null || v.mtr == undefined || v.mtr == "")
          );
          if (index > -1) {
            this.toastr.warning("Batch should have mtr/wt.");
            returnValue = false;
            return false;
          }
        }
        if (ele.batchMW && ele.batchMW.length) {
          let index = ele.batchMW.findIndex((v) => v.wt == 0 || v.mtr == 0);
          if (index > -1) {
            this.toastr.warning("Batch mtr/wt. cannot be 0.");
            returnValue = false;
            return false;
          }
        }
      });
    }
    if (returnValue) {
      returnValue = false;
      if (this.stockBatch.billDate)
        if (this.stockBatch.billNo)
          if (this.stockBatch.chlDate)
            if (this.stockBatch.chlNo)
              if (this.stockBatch.stockInType)
                if (this.stockBatch.partyId)
                  if (this.stockBatch.qualityId) returnValue = true;
    }
    return returnValue;
  }
  addUpdateStockBatch(myForm) {
    this.disableButton = true;
    this.formSubmitted = true;
    if (myForm.valid || this.checkValidation(myForm)) {
      this.loading = true;
      this.stockBatchArray = [];
      this.stockBatch.createdBy = this.user.userId;
      this.stockBatch.userHeadId = this.userHead.userHeadId;
      this.stockDataValues.forEach((ele) => {
        if (ele.batchMW && ele.batchMW.length) {
          ele.batchMW.forEach((subele) => {
            if (!!subele.mtr && !!subele.wt) {
              let obj = {
                batchId: 0,
                mtr: 0,
                wt: 0,
                totalMt: 0,
                totalWt: 0,
                isProductionPlanned: false,
              };
              obj.batchId = ele.batchId;
              obj.mtr = subele.mtr;
              obj.wt = subele.wt;
              obj.totalMt = ele.totalMt;
              obj.totalWt = ele.totalWt;
              obj.isProductionPlanned = ele.isProductionPlanned;
              this.stockBatchArray.push(obj);
            }
          });
        }
      });
      this.stockBatch.batchData = this.stockBatchArray;
      if (this.addFlag) {
        this.stockBatchService.addStockBatch(this.stockBatch).subscribe(
          (data) => {
            if (data["success"]) {
              this.loading = false;
              this.route.navigate(["/pages/stock-batch"]);
              this.toastr.success(errorData.Add_Success);
            } else {
              this.loading = false;
              this.stockBatchArray = [];
            }
          },
          (error) => {
            this.loading = false;
            this.disableButton = false;
            this.stockBatchArray = [];
            this.toastr.error(errorData.Serever_Error);
          }
        );
      } else {
        this.stockBatch.updatedBy = this.user.userId;
        this.stockBatchService.updateStockBatch(this.stockBatch).subscribe(
          (data) => {
            if (data["success"]) {
              this.route.navigate(["/pages/stock-batch"]);
              this.toastr.success(errorData.Update_Success);
            } else {
              this.stockBatchArray = [];
              this.toastr.error(data["msg"]);
            }
            this.loading = false;
          },

          (error) => {
            this.stockBatchArray = [];
            this.toastr.error(errorData.Update_Error);
            this.loading = false;
            this.disableButton = false;
            this.loading = false;
          }
        );
        this.loading = false;
      }
    } else {
      this.disableButton = false;
      const errorField = this.renderer.selectRootElement("#target");
      errorField.scrollIntoView();
      this.loading = false;
    }
  }
}
