import { Component, OnInit, Renderer2, ViewContainerRef } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import * as errorData from "../../../@theme/json/error.json";
import {
  QualityListEmpty,
  Shade,
  ShadeDataList,
} from "../../../@theme/model/shade";
import { CommonService } from "../../../@theme/services/common.service";
import { PartyService } from "../../../@theme/services/party.service";
import { QualityService } from "../../../@theme/services/quality.service";
import { ShadeService } from "../../../@theme/services/shade.service";
import { SupplierService } from "../../../@theme/services/supplier.service";
import { ToastrService } from "ngx-toastr";

@Component({
  selector: "ngx-add-edit-shade",
  templateUrl: "./add-edit-shade.component.html",
  styleUrls: ["./add-edit-shade.component.scss"],
})
export class AddEditShadeComponent implements OnInit {
  public loading = false;
  public disableButton = false;
  public errorData: any = (errorData as any).default;

  shadeDataListArray: ShadeDataList[] = [];

  shades: Shade = new Shade();
  shadeDataList: ShadeDataList = new ShadeDataList();
  qualityListEmpty: QualityListEmpty = new QualityListEmpty();

  //Form Validation
  formSubmitted: boolean = false;
  pendingFlag = true;
  index: any;
  //to Store UserId
  user: any;
  userHead;
  //To store current Shade Id
  currentShadeId: any;
  //to Store Current Shade data
  currentShade: [];
  //To store Supplier data
  supplierList: any;
  checked = true;
  quality: any[];
  processList: any[];
  qualityId: any;
  color: any = "";
  supplierListRate: any;
  partyList: any[];
  categoryList = [{ name: "light" }, { name: "dark" }];
  constructor(
    private _route: ActivatedRoute,
    private partyService: PartyService,
    private commonService: CommonService,
    private qualityService: QualityService,
    private supplierService: SupplierService,
    private shadeService: ShadeService,
    private route: Router,
    public vcRef: ViewContainerRef,
    private toastr: ToastrService,
    private renderer: Renderer2
  ) {
    this.shadeDataListArray.push(this.shadeDataList);
    this.shades.shadeDataList = this.shadeDataListArray;
  }

  ngOnInit(): void {

    this.getUserId();
    this.getQualityList();
    this.getPartyList();
    this.getProcessList();
    this.getSupplierList();
    if (this.currentShadeId != null) {
      this.pendingFlag = false;
      //this.shades.pending = this.pen
      this.getUpdateData();
    }
    this.shades.pending = this.pendingFlag;

  }

  updateColor() {
    this.shades.colorTone = this.color;
  }

  public getUserId() {
    this.user = this.commonService.getUser();
    this.userHead = this.commonService.getUserHeadId();
    this.currentShadeId = this._route.snapshot.paramMap.get("id");
  }

  public getPartyList() {
    this.loading = true;
    this.partyService.getAllPartyNameList().subscribe(
      (data) => {
        if (data["success"]) {
          this.partyList = data["data"];
          this.loading = false;
        } else {
          // this.toastr.error(errorData.Internal_Error);
          this.loading = false;
        }
      },
      (error) => {
        // this.toastr.error(errorData.Serever_Error);
        this.loading = false;
      }
    );
  }

  getSupplierList() {
    this.loading = true;
    this.supplierService.getAllSupplierRates().subscribe(
      (data) => {
        if (data["success"]) {
          if (data["data"] && data["data"].length > 0) {
            this.supplierList = data["data"];
            this.getAllSupplier();
            this.loading = false;
          } else {
            // this.toastr.error(data["msg"]);
            this.loading = false;
          }
        } else {
          // this.toastr.error(data["msg"]);
          this.loading = false;
        }
      },
      (error) => {
        // this.toastr.error(errorData.Serever_Error);
        this.loading = false;
      }
    );
  }

  getAllSupplier() {
    this.loading = true;
    this.supplierService.getAllSupplier(0, "all").subscribe(
      (data) => {
        if (data["success"]) {
          this.supplierListRate = data["data"];
          this.loading = false;
        } else {
          // this.toastr.error(data["msg"]);
          this.loading = false;
        }
      },
      (error) => {
        // this.toastr.error(errorData.Serever_Error);
        this.loading = false;
      }
    );
  }

  getProcessList() {
    this.loading = true;
    this.shadeService.getAllDyeingProcess().subscribe(
      (data) => {
        if (data["success"]) {
          this.processList = data["data"];
          this.loading = false;
        } else {
          // this.toastr.error(data["msg"]);
          this.loading = false;
        }
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
          this.quality = data["data"];
          this.loading = false;
        } else {
          // this.toastr.error(data["msg"]);
          this.loading = false;
        }
      },
      (error) => {
        // this.toastr.error(errorData.Serever_Error);
        this.loading = false;
      }
    );
  }

  getUpdateData() {
    this.loading = true;
    this.shadeService.getCurrentShadeData(this.currentShadeId).subscribe(
      (data) => {
        this.shades = data["data"];
        this.color = this.shades.colorTone;
        if (this.shades.shadeDataList.length == 0) {
          this.shadeDataListArray.push(this.shadeDataList);
          this.shades.shadeDataList = this.shadeDataListArray;
        }
        if (!data["success"]) {
          this.shades = data["data"];
          this.color = this.shades.colorTone;
          this.shades.pending = false;
          let inter = setInterval(() => {
            if (this.quality) {
              clearInterval(inter);
              this.quality.forEach((e) => {
                if (e.id == data["data"].qualityEntryId) {
                  this.shades.qualityId = e.qualityId;
                  this.shades.qualityName = e.qualityName;
                  this.shades.qualityType = e.qualityType;
                }
                this.loading = false;
              });
            }
          }, 10);
          if (this.shades.shadeDataList.length == 1) {
            this.shadeDataListArray.push(this.shadeDataList);
            this.shades.shadeDataList = this.shadeDataListArray;
          }
          this.setProcessName(this.shades.processId);
          this.loading = false;
          this.disableButton = false;
        } else {
          // this.toastr.error(data["msg"]);
          this.loading = false;
          this.disableButton = false;
        }
      },
      (error) => {
        // this.toastr.error(errorData.Serever_Error);
        this.loading = false;
        this.disableButton = false;
      }
    );
    this.disableButton = false;
  }

  qualityIdSelected(event) {
    if (event == undefined) {
      this.getPartyList();
      this.getQualityList();
      this.shades.partyId = null;
      this.shades.qualityName = null;
      this.shades.qualityType = null;
    } else {
      this.quality.forEach((element) => {
        if (this.shades.qualityId == element.qualityId) {
          this.shades.qualityId = element.qualityId;
          this.shades.qualityName = element.qualityName;
          this.shades.qualityType = element.qualityType;
          this.shades.partyId = element.partyId;
        }
      });
    }
  }

  getQualityFromParty(event) {
    this.loading = true;
    this.shades.qualityId = null;
    this.shades.qualityName = null;
    this.shades.qualityType = null;
    if (event == undefined) {
      this.getPartyList();
      this.getQualityList();
      this.shades.qualityId = null;
      this.shades.qualityName = null;
      this.shades.qualityType = null;
      this.loading = false;
    } else {
      this.shadeService.getQualityFromParty(this.shades.partyId).subscribe(
        (data) => {
          if (data["success"]) {
            this.quality = data["data"].qualityDataList;
            this.shades.qualityId = this.quality[0].qualityId;
            this.shades.qualityName = this.quality[0].qualityName;
            this.shades.qualityType = this.quality[0].qualityType;
            this.quality.forEach((e) => {
              e.partyName = data["data"].partyName;
              this.loading = false;
            });
            this.loading = false;
          } else {
            // this.toastr.error(data["msg"]);
            this.quality = null;
            this.loading = false;
          }
        },
        (error) => {
          // this.toastr.error(errorData.Serever_Error);
          this.loading = false;
        }
      );
    }
  }

  // toggle(event){
  //   console.log(event);
  //   this.shades.pending = event;
  // }

  itemSelected(rowIndex, row, elementId) {
    let id = this.shades.shadeDataList[rowIndex].itemName;
    // let flag = false;
    let count = 0;
    this.shades.shadeDataList.forEach((e) => {
      if (count != rowIndex) {
        if (e.itemName == id)
          // flag = true;
          count++;
      } else count++;
    });
    // if (!flag) {
    let newSupplierId;
    for (let s of this.supplierList) {
      if (id == s.itemName) {
        this.shades.shadeDataList[rowIndex].rate = s.rate;
        newSupplierId = s.supplierId;
        this.shades.shadeDataList[rowIndex].supplierItemId = s.id;
        break;
      }
    }
    for (let s1 of this.supplierListRate) {
      if (newSupplierId == s1.id) {
        this.shades.shadeDataList[rowIndex].supplierName = s1.supplierName;
        this.shades.shadeDataList[rowIndex].supplierId = s1.id;
        break;
      }
    }
    // } else {
    //   this.toastr.error("This item name is already selected");

    //   // this.shades.shadeDataList[rowIndex].itemName = "";
    //   this.shades.shadeDataList[rowIndex].itemName=undefined;
    //   this.shades.shadeDataList[rowIndex].concentration = null;
    //   this.shades.shadeDataList[rowIndex].supplierId = 0;
    //   this.shades.shadeDataList[rowIndex].rate = null;
    //   this.shades.shadeDataList[rowIndex].amount = null;
    //   // .splice(rowIndex,1);

    // let obj = {
    //   itemName: null,
    //   concentration: null,
    //   supplierName: null,
    //   rate: null,
    //   amount: null,
    //   supplierId: null,
    //   supplierItemId: null,
    // };
    // let list = this.shades.shadeDataList;
    // list.push(obj);
    // this.shades.shadeDataList = [...list];

    this.calculateAmount(rowIndex);
  }

  calculateAmount(rowIndex) {
    let con = this.shades.shadeDataList[rowIndex].concentration;
    let newRate = this.shades.shadeDataList[rowIndex].rate;
    let amount = Number((Number(con) * Number(newRate)).toFixed(2));
    if (amount) this.shades.shadeDataList[rowIndex].amount = amount;
  }

  setProcessName(id) {
    this.processList.forEach((element) => {
      if (id == element.id) {
        this.shades.processName = element.name;
      }
    });
  }

  onKeyUp(e, rowIndex, colIndex, colName) {
    var keyCode = e.keyCode ? e.keyCode : e.which;
    if (keyCode == 13) {
      this.index = "supplierList" + (rowIndex + 1) + "-" + colIndex;
      if (rowIndex === this.shades.shadeDataList.length - 1) {
        let item = this.shades.shadeDataList[rowIndex];
        if (colName == "itemName") {
          if (!item.itemName) {
            this.toastr.error("Enter item name", "item name required");
            return;
          }
        } else if (colName == "concentration") {
          if (!item.concentration) {
            this.toastr.error("Enter concentration", "concentration required");
            return;
          }
        } else if (colName == "supplierName") {
          if (!item.supplierName) {
            this.toastr.error("Enter supplier name", "supplier name required");
            return;
          }
        } else if (colName == "rate") {
          if (!item.rate) {
            this.toastr.error("Enter rate", "rate is required");
            return;
          }
        } else if (colName == "amount") {
          if (!item.amount) {
            this.toastr.error("Enter amount", "amount is required");
            return;
          }
        }
        let obj = {
          itemName: null,
          concentration: null,
          supplierName: null,
          rate: null,
          amount: null,
          supplierId: null,
          supplierItemId: null,
        };
        let list = this.shades.shadeDataList;
        list.push(obj);
        this.shades.shadeDataList = [...list];
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
        }, 50); //alert("go to any last row input to add new row");
      }
    }
  }
  checkedChange(event) {
    this.pendingFlag = event;

    this.shades.pending = event;
  }
  addShade(shadeForm) {
    this.disableButton = true;
    this.formSubmitted = true;

    if (shadeForm.valid) {
      this.shades.createdBy = this.user.userId;
      this.shades.userHeadId = this.userHead.userHeadId;
      if (this.currentShadeId != null) {
        this.shades.pending = this.pendingFlag;
      }
      this.shadeService.addShadeData(this.shades).subscribe(
        (data) => {
          if (data["success"]) {
            this.route.navigate(["/pages/shade"]);
            this.toastr.success(errorData.Add_Success);
          } else {
            this.toastr.error(data["msg"]);
            this.toastr.error(errorData.Add_Error);
          }
          this.disableButton = false;
        },
        (error) => {
          this.toastr.error(errorData.Serever_Error);
          this.disableButton = false;
        }
      );
    } else {
      if (
        shadeForm.value.apcNo &&
        shadeForm.value.partyName &&
        shadeForm.value.processName &&
        shadeForm.value.qualityName
      ) {
        this.shades.createdBy = this.user.userId;
        this.shades.userHeadId = this.userHead.userHeadId;
        console.log(this.shades);
        this.shadeService.addShadeData(this.shades).subscribe(
          (data) => {
            if (data["success"]) {
              this.route.navigate(["/pages/shade"]);
              this.toastr.success(errorData.Add_Success);
            } else {
              this.toastr.error(errorData.Add_Error);
            }
            this.disableButton = false;
          },
          (error) => {
            this.toastr.error(errorData.Serever_Error);
            this.disableButton = false;
          }
        );
      }
      this.disableButton = false;
      const errorField = this.renderer.selectRootElement("#target");
      errorField.scrollIntoView();
    }
  }

  removeItem(id) {
    //remove row
    let idCount = this.shades.shadeDataList.length;
    let item = this.shades.shadeDataList;
    if (idCount == 1) {
      item[0].itemName = null;
      item[0].concentration = null;
      item[0].supplierName = null;
      item[0].rate = null;
      item[0].amount = null;
      let list = item;
      this.shades.shadeDataList = [...list];
    } else {
      let removed = item.splice(id, 1);
      let list = item;
      this.shades.shadeDataList = [...list];
    }
  }
  updateShade(shadeForm) {
    this.disableButton = true;

    this.loading = true;
    this.formSubmitted = true;
    if (shadeForm.valid) {
      this.shades.updatedBy = this.user.userId;
      this.shadeService.updateShadeData(this.shades).subscribe(
        (data) => {
          if (data["success"]) {
            this.route.navigate(["/pages/shade"]);
            this.toastr.success(errorData.Update_Success);
          } else {
            this.toastr.error(errorData.Update_Error);
          }
          this.loading = false;
        },
        (error) => {
          this.toastr.error(errorData.Serever_Error);
          this.loading = false;
          this.disableButton = false;
        }
      );
    } else {
      this.disableButton = false;
      this.loading = false;
      const errorField = this.renderer.selectRootElement("#target");
      errorField.scrollIntoView();
    }
  }
}
