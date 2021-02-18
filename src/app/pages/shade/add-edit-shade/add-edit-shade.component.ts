import { Component, OnInit, Renderer2, ViewContainerRef } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import * as errorData from "app/@theme/json/error.json";
import { QualityListEmpty, Shade, ShadeDataList } from "app/@theme/model/shade";
import { CommonService } from "app/@theme/services/common.service";
import { PartyService } from "app/@theme/services/party.service";
import { QualityService } from "app/@theme/services/quality.service";
import { ShadeService } from "app/@theme/services/shade.service";
import { SupplierService } from "app/@theme/services/supplier.service";
import { ToastrService } from "ngx-toastr";

@Component({
  selector: "ngx-add-edit-shade",
  templateUrl: "./add-edit-shade.component.html",
  styleUrls: ["./add-edit-shade.component.scss"]
})
export class AddEditShadeComponent implements OnInit {
  public loading = false;
  public disableButton = false;
  public errorData: any = (errorData as any).default;

  shadeDataListArray: ShadeDataList[] = [];

  shadeObj: Shade = new Shade();
  shadeDataList: ShadeDataList = new ShadeDataList();
  qualityListEmpty: QualityListEmpty = new QualityListEmpty();

  //Form Validation
  formSubmitted: boolean = false;
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
  qualityList: any[];
  processList: any[];
  qualityId: any;
  color: any = "";
  supplierListRate: any;
  partyList: any[];
  categoryList = [{ name: "light" }, { name: "dark" }];
  refreshFlag: any = 0;
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
  ) {}

  async ngOnInit() {
    await this.getQualityList();
    await this.getPartyList();
    await this.getProcessList();
    await this.getSupplierList();
    this.getUserId();
    if (this.currentShadeId) {
      this.getShadeById();
    } else {
      this.shadeDataListArray.push(this.shadeDataList);
      this.shadeObj.shadeDataList = this.shadeDataListArray;
    }
    
  }

  updateColor() {
    this.shadeObj.colorTone = this.color;
  }

  public getUserId() {
    this.user = this.commonService.getUser();
    this.userHead = this.commonService.getUserHeadId();
    this.currentShadeId = this._route.snapshot.paramMap.get("id");
  }

  public getPartyList() {
    this.loading = true;
    this.partyService.getAllPartyNameList().subscribe(
      data => {
        if (data["success"]) {
          this.partyList = data["data"];
          this.loading = false;
        } else {
          // this.toastr.error(errorData.Internal_Error);
          this.loading = false;
        }
      },
      error => {
        // this.toastr.error(errorData.Serever_Error);
        this.loading = false;
      }
    );
  }

  getSupplierList() {
    this.loading = true;
    this.supplierService.getAllSupplierRates().subscribe(
      data => {
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
      error => {
        // this.toastr.error(errorData.Serever_Error);
        this.loading = false;
      }
    );
  }

  getAllSupplier() {
    this.loading = true;
    this.supplierService.getAllSupplier(0, "all").subscribe(
      data => {
        if (data["success"]) {
          this.supplierListRate = data["data"];
          this.loading = false;
        } else {
          // this.toastr.error(data["msg"]);
          this.loading = false;
        }
      },
      error => {
        // this.toastr.error(errorData.Serever_Error);
        this.loading = false;
      }
    );
  }

  getProcessList() {
    this.loading = true;
    this.shadeService.getAllDyeingProcess().subscribe(
      data => {
        if (data["success"]) {
          this.processList = data["data"];
          this.loading = false;
        } else {
          // this.toastr.error(data["msg"]);
          this.loading = false;
        }
      },
      error => {
        // this.toastr.error(errorData.Serever_Error);
        this.loading = false;
      }
    );
  }

  getQualityList() {
    this.loading = true;
    this.qualityService.getQualityNameData().subscribe(
      data => {
        if (data["success"]) {
          this.qualityList = data["data"];
          this.loading = false;
        } else {
          // this.toastr.error(data["msg"]);
          this.loading = false;
        }
      },
      error => {
        // this.toastr.error(errorData.Serever_Error);
        this.loading = false;
      }
    );
  }

  getShadeById() {
    this.loading = true;
    this.shadeService.getCurrentShadeData(this.currentShadeId).subscribe(
      data => {
        if (data["success"]) {
          let res = data['data'];
          this.shadeObj = res;
          this.color = this.shadeObj.colorTone;
          if (!this.shadeObj.shadeDataList.length) {
            this.shadeDataListArray.push(this.shadeDataList);
            this.shadeObj.shadeDataList = this.shadeDataListArray;
          } else {
            this.shadeDataListArray = this.shadeObj.shadeDataList;
          }
          let qualityIndex =this.qualityList&& this.qualityList.length ? this.qualityList.findIndex(v=> v.id == res.qualityEntryId) : -1;
          if(qualityIndex > -1) {
            this.shadeObj.qualityId = this.qualityList[qualityIndex].qualityId;
            this.shadeObj.qualityName = this.qualityList[qualityIndex].qualityName;
            this.shadeObj.qualityType = this.qualityList[qualityIndex].qualityType;
          }
          this.setProcessName(this.shadeObj.processId);
          this.loading = false;
          this.disableButton = false;
        } else {
          // this.toastr.error(data["msg"]);
          this.loading = false;
          this.disableButton = false;
        }
      },
      error => {
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
      this.shadeObj.partyId = null;
      this.shadeObj.qualityName = null;
      this.shadeObj.qualityType = null;
    } else {
      this.qualityList.forEach(element => {
        if (this.shadeObj.qualityId == element.qualityId) {
          this.shadeObj.qualityId = element.qualityId;
          this.shadeObj.qualityName = element.qualityName;
          this.shadeObj.qualityType = element.qualityType;
          this.shadeObj.partyId = element.partyId;
        }
      });
    }
  }

  getQualityFromParty(event) {
    this.loading = true;
    this.shadeObj.qualityId = null;
    this.shadeObj.qualityName = null;
    this.shadeObj.qualityType = null;
    if (event == undefined) {
      this.getPartyList();
      this.getQualityList();
      this.shadeObj.qualityId = null;
      this.shadeObj.qualityName = null;
      this.shadeObj.qualityType = null;
      this.loading = false;
    } else {
      this.shadeService.getQualityFromParty(this.shadeObj.partyId).subscribe(
        data => {
          if (data["success"]) {
            this.qualityList = data["data"].qualityDataList;
            this.shadeObj.qualityId = this.qualityList[0].qualityId;
            this.shadeObj.qualityName = this.qualityList[0].qualityName;
            this.shadeObj.qualityType = this.qualityList[0].qualityType;
            this.qualityList.forEach(e => {
              e.partyName = data["data"].partyName;
              this.loading = false;
            });
            this.loading = false;
          } else {
            // this.toastr.error(data["msg"]);
            this.qualityList = null;
            this.loading = false;
          }
        },
        error => {
          // this.toastr.error(errorData.Serever_Error);
          this.loading = false;
        }
      );
    }
  }

  // toggle(event){
  //   console.log(event);
  //   this.shadeObj.pending = event;
  // }

  itemSelected(rowIndex, row) {
    if(this.refreshFlag > 10){
      this.refreshFlag = 0;
    }
    this.refreshFlag++;
    let newSupplierId;
    for (let s of this.supplierList) {
      if (row.supplierItemId == s.id) {
        row.rate = s.rate;
        newSupplierId = s.supplierId;
        row.itemName = s.itemName;
        break;
      }
    }
    for (let s1 of this.supplierListRate) {
      if (newSupplierId == s1.id) {
        this.shadeObj.shadeDataList[rowIndex].supplierName = s1.supplierName;
        this.shadeObj.shadeDataList[rowIndex].supplierId = s1.id;
        break;
      }
    }

    this.calculateAmount(rowIndex);
  }

  calculateAmount(rowIndex) {
    let con = this.shadeObj.shadeDataList[rowIndex].concentration;
    let newRate = this.shadeObj.shadeDataList[rowIndex].rate;
    let amount = Number((Number(con) * Number(newRate)).toFixed(2));
    if (amount) this.shadeObj.shadeDataList[rowIndex].amount = amount;
  }

  setProcessName(id) {
    let processIndex = this.processList && this.processList.length ?this.processList.findIndex(v=> v.id == id): -1;
    if(processIndex > -1) {
      this.shadeObj.processName = this.processList[processIndex].name;
    } else {
      this.shadeObj.processName = '';
    }
  }

  onKeyUp(e, rowIndex, colIndex, colName) {
    var keyCode = e.keyCode ? e.keyCode : e.which;
    if (keyCode == 13) {
      this.index = "supplierList" + (rowIndex + 1) + "-" + colIndex;
      if (rowIndex === this.shadeObj.shadeDataList.length - 1) {
        let item = this.shadeObj.shadeDataList[rowIndex];
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
          supplierItemId: null
        };
        let list = this.shadeObj.shadeDataList;
        list.push(obj);
        this.shadeObj.shadeDataList = [...list];
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

  addShade(shadeForm) {
    this.disableButton = true;
    this.formSubmitted = true;

    if (shadeForm.valid) {
      this.shadeObj.createdBy = this.user.userId;
      this.shadeObj.userHeadId = this.userHead.userHeadId;

      if(this.shadeObj.shadeDataList.length && !Object.keys(this.shadeObj.shadeDataList[0]).length){
        this.shadeObj.shadeDataList = [];
      }

      this.shadeService.addShadeData(this.shadeObj).subscribe(
        data => {
          if (data["success"]) {
            this.route.navigate(["/pages/shade"]);
            this.toastr.success(errorData.Add_Success);
          } else {
            this.toastr.error(data["msg"]);
            this.toastr.error(errorData.Add_Error);
          }
          this.disableButton = false;
        },
        error => {
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

        if(this.shadeObj.shadeDataList.length && !Object.keys(this.shadeObj.shadeDataList[0]).length){
          this.shadeObj.shadeDataList = [];
        }

        this.shadeObj.createdBy = this.user.userId;
        this.shadeObj.userHeadId = this.userHead.userHeadId;
        this.shadeService.addShadeData(this.shadeObj).subscribe(
          data => {
            if (data["success"]) {
              this.route.navigate(["/pages/shade"]);
              this.toastr.success(errorData.Add_Success);
            } else {
              this.toastr.error(errorData.Add_Error);
            }
            this.disableButton = false;
          },
          error => {
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
    let idCount = this.shadeObj.shadeDataList.length;
    let item = this.shadeObj.shadeDataList;
    if (idCount == 1) {
      item[0].itemName = null;
      item[0].concentration = null;
      item[0].supplierName = null;
      item[0].rate = null;
      item[0].amount = null;
      let list = item;
      this.shadeObj.shadeDataList = [...list];
    } else {
      let removed = item.splice(id, 1);
      let list = item;
      this.shadeObj.shadeDataList = [...list];
    }
  }
  updateShade(shadeForm) {
    this.disableButton = true;

    this.loading = true;
    this.formSubmitted = true;
    if (shadeForm.valid) {
      this.shadeObj.updatedBy = this.user.userId;
      this.shadeService.updateShadeData(this.shadeObj).subscribe(
        data => {
          if (data["success"]) {
            this.route.navigate(["/pages/shade"]);
            this.toastr.success(errorData.Update_Success);
          } else {
            this.toastr.error(errorData.Update_Error);
          }
          this.loading = false;
        },
        error => {
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
