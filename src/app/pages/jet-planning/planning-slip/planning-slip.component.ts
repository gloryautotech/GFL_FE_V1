import { Component, Input, OnInit } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { DyeingChemicalData } from "app/@theme/model/dyeing-process";
import { DyeingProcessService } from "app/@theme/services/dyeing-process.service";
import { JetPlanningService } from "app/@theme/services/jet-planning.service";
import { PlanningSlipService } from "app/@theme/services/planning-slip.service";
import { ToastrService } from "ngx-toastr";
import * as wijmo from "@grapecity/wijmo";
import { DatePipe } from '@angular/common';

@Component({
  selector: "ngx-planning-slip",
  templateUrl: "./planning-slip.component.html",
  styleUrls: ["./planning-slip.component.scss"],
  providers: [DatePipe]
})
export class PlanningSlipComponent implements OnInit {
  public currentSlipId: any;

  public loading: boolean = false;
  public formSubmitted: boolean = false;
  public disableButton: boolean = false;
  public isPrinting: boolean = true;
  public index: string;
  public myDate:any
  @Input() isPrintDirect: boolean;
  @Input() batchId;
  @Input() stockId;
  public itemListArray: any = [];
  public slipData: any = {};
  // {
  //   batchId: 111,
  //   jetId: 123,
  //   totalWt: 123,
  //   qualityId: 50,
  //   partyShadeNo: 2,
  //   batchCount: 1,
  //   colorTone: "Blue",
  //   dyeingSlipDataList: [
  //     {
  //       id: 14497,
  //       controlId: 14496,
  //       processType: "Dyeing",
  //       temp: 0,
  //       holdTime: 12,
  //       sequence: 1,
  //       isColor: null,
  //       liquerRation: null,
  //       dyeingSlipItemData: [
  //         {
  //           id: 14498,
  //           controlId: 14497,
  //           itemId: 642,
  //           itemName: "Item 3",
  //           byChemical: "L",
  //           concentration: 4,
  //         },
  //         {
  //           id: 14498,
  //           controlId: 14497,
  //           itemId: 642,
  //           itemName: "Item 3",
  //           byChemical: "L",
  //           concentration: 4,
  //         },
  //         {
  //           id: 14498,
  //           controlId: 14497,
  //           itemId: 642,
  //           itemName: "Item 3",
  //           byChemical: "L",
  //           concentration: 4,
  //         },
  //       ],
  //     },
  //     {
  //       id: 14521,
  //       controlId: 14496,
  //       processType: "Scouring",
  //       temp: 12,
  //       holdTime: 12,
  //       sequence: 2,
  //       isColor: null,
  //       liquerRation: null,
  //       dyeingSlipItemData: [
  //         {
  //           id: 14522,
  //           controlId: 14521,
  //           itemId: 13884,
  //           itemName: "Test_Item2",
  //           byChemical: "L",
  //           concentration: 10,
  //         },
  //         {
  //           id: 14523,
  //           controlId: 14521,
  //           itemId: 13812,
  //           itemName: "itemKushal2",
  //           byChemical: "L",
  //           concentration: 20,
  //         },
  //       ],
  //     },
  //     {
  //       id: 14530,
  //       controlId: 14496,
  //       processType: "RC",
  //       temp: 213,
  //       holdTime: 3125,
  //       sequence: 3,
  //       isColor: null,
  //       liquerRation: null,
  //       dyeingSlipItemData: [
  //         {
  //           id: 14531,
  //           controlId: 14530,
  //           itemId: 640,
  //           itemName: "Item 1",
  //           byChemical: "L",
  //           concentration: 3,
  //         },
  //       ],
  //     },
  //     {
  //       id: 14532,
  //       controlId: 14496,
  //       processType: "Cold Wash",
  //       temp: 5,
  //       holdTime: 5,
  //       sequence: 4,
  //       isColor: null,
  //       liquerRation: null,
  //       dyeingSlipItemData: [
  //         {
  //           id: 14533,
  //           controlId: 14532,
  //           itemId: 640,
  //           itemName: "Item 1",
  //           byChemical: "L",
  //           concentration: 5,
  //         },
  //       ],
  //     },
  //   ],
  // };

  constructor(
    public activeModal: NgbActiveModal,
    private toastr: ToastrService,
    private datePipe: DatePipe,
    private DyeingProcessService: DyeingProcessService,
    private planningSlipService: PlanningSlipService
  ) {
    this.myDate = new Date();
    this.myDate = this.datePipe.transform(this.myDate, 'dd-MM-yyyy');
  }

  ngOnInit(): void {
    
    this.getItemData();
    if (this.batchId && this.stockId) this.getSlipDataFromBatch();
    if (this.isPrintDirect) {
      //directly print slip
      this.printSlip();
    }
  }

  // get activeModel() {

  //   return this.activeModal;
  // }

  getItemData() {
    this.DyeingProcessService.getAllItemWithSupplier().subscribe(
      (data) => {
        if (data["success"]) {
          this.itemListArray = data["data"];
        } else {
        }
      },
      (error) => {}
    );
  }

  getSlipDataFromBatch() {
    this.planningSlipService
      .getSlipDataByBatchStockId(this.batchId, this.stockId)
      .subscribe(
        (data) => {
          if (data["success"]) {
            this.slipData = data["data"];
          } else {
            this.toastr.error(data["msg"]);
          }
        },
        (error) => {}
      );
  }

  onKeyUp(e, rowIndex, colIndex, colName, parentDataIndex) {
    var keyCode = e.keyCode ? e.keyCode : e.which;
    if (keyCode == 13) {
      this.index = "itemList" + (rowIndex + 1) + "-" + colIndex;
      if (
        rowIndex ===
        this.slipData.dyeingSlipDataList[parentDataIndex].dyeingSlipItemData.length - 1
      ) {
        let item = this.slipData.dyeingSlipDataList[parentDataIndex].dyeingSlipItemData[rowIndex];

        if (colName == "concentration") {
          if (!item.concentration) {
            // this.toastr.error("Enter concentration");
            return;
          }
        } else if (colName == "byChemical") {
          if (!item.byChemical) {
            // this.toastr.error("Enter concentration");
            return;
          }
        }
        let obj = new DyeingChemicalData();
        //let list = this.dyeingChemicalData;
        this.slipData.dyeingSlipDataList[parentDataIndex].dyeingSlipItemData.push(obj);
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
    }
  }

  removeItem(rowIndex, parentDataIndex) {
    let idCount = this.slipData.dyeingSlipDataList[parentDataIndex].dyeingSlipItemData.length;
    if (idCount == 1) {
      this.slipData.dyeingSlipDataList[parentDataIndex].dyeingSlipItemData[0].byChemical = null;
      this.slipData.dyeingSlipDataList[parentDataIndex].dyeingSlipItemData[0].concentration = null;
      this.slipData.dyeingSlipDataList[parentDataIndex].dyeingSlipItemData[0].controlId = null;
      this.slipData.dyeingSlipDataList[parentDataIndex].dyeingSlipItemData[0].id = null;
      this.slipData.dyeingSlipDataList[parentDataIndex].dyeingSlipItemData[0].itemId = null;
      this.slipData.dyeingSlipDataList[parentDataIndex].dyeingSlipItemData[0].itemName = null;
      this.slipData.dyeingSlipDataList[parentDataIndex].dyeingSlipItemData[0].supplierName = null;
    } else {
      let removed = this.slipData.dyeingSlipDataList[parentDataIndex].dyeingSlipItemData.splice(
        rowIndex,
        1
      );
    }
  }

  itemSelected(rowIndex, parentIndex) {
    this.itemListArray.forEach((e) => {
      if (
        e.itemId ==
        this.slipData.dyeingSlipDataList[parentIndex].dyeingSlipItemData.itemId
      ) {
        this.slipData.dyeingSlipDataList[parentIndex].dyeingSlipItemData.supplierName =
          e.supplierName;
          this.slipData.dyeingSlipDataList[parentIndex].dyeingSlipItemData.itemName =
          e.itemName;
      }
    });
  }

  saveSlipData(myForm) {
    this.formSubmitted = true;
    this.disableButton = true;
    if (myForm.valid) {
      this.planningSlipService.updateSlipData(this.slipData).subscribe(
        (data) => {
          if (data["success"]) {
            this.toastr.success(data["msg"]);
          } else {
            this.toastr.error(data["msg"]);
          }
          this.activeModal.close();
        },
        (error) => {
          this.toastr.error("Internal server error!");
          this.activeModal.close();
        }
      );
    }
  }

  printSlip(myForm?) {
    this.isPrinting = false;
    if (!this.isPrintDirect) {
      this.saveSlipData(myForm);
    }
    let doc = new wijmo.PrintDocument({
      title: "",
    });
    doc.append(
      '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/paper-css/0.3.0/paper.css">'
    );
    doc.append(
      '<link href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" rel="stylesheet">'
    );
    doc.append(
      '<link href="https://cdn.grapecity.com/wijmo/5.latest/styles/wijmo.min.css" rel="stylesheet">'
    );
    doc.append(
      '<link href="./planning-slip.component.scss" rel="stylesheet">'
    )
    let inter = setInterval(() => {
      let element = <HTMLElement>document.getElementById("print-slip");
      if (element) {
        doc.append(element);
        doc.print();
        clearInterval(inter);
        this.activeModal.close();
      }
    }, 10);
  }
}