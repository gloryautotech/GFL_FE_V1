import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { CdkDragDrop, moveItemInArray } from "@angular/cdk/drag-drop";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import {
  DyeingProcess,
  DyeingProcessData,
} from "../../../@theme/model/dyeing-process";
import { CommonService } from "../../../@theme/services/common.service";
import { DyeingProcessService } from "../../../@theme/services/dyeing-process.service";
import { ToastrService } from "ngx-toastr";
import { AddDyeingProcessStepComponent } from "../add-dyeing-process-step/add-dyeing-process-step.component";
import { PartyService } from "../../../@theme/services/party.service";

@Component({
  selector: "ngx-add-edit-dyeing-process",
  templateUrl: "./add-edit-dyeing-process.component.html",
  styleUrls: ["./add-edit-dyeing-process.component.scss"],
})
export class AddEditDyeingProcessComponent implements OnInit, OnDestroy {
  public dyeingProcess: DyeingProcess;
  public dyeingProcessSteps: DyeingProcessData[] = [];
  public formSubmitted: boolean = false;
  public addFlag: boolean = true;
  public updateFlag: boolean = false;
  public processNameExist: boolean = false;
  public selectedStep: any;
  public currentDyeingProcessId: any;
  public disableButton = false;
  public itemList: any[];
  public master: any[];
  public loading: boolean = false;
  attributesArray =[];

  public destroy$ : Subject<void> = new Subject<void>();
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  constructor(
    private _modalService: NgbModal,
    private toastr: ToastrService,
    private commonService: CommonService,
    private dyeingProcessService: DyeingProcessService,
    private route: Router,
    private currentRoute: ActivatedRoute,
    private partyService: PartyService
  ) {
    this.dyeingProcess = new DyeingProcess();
    this.getItemList();
    this.getMaster();
  }

  ngOnInit(): void {
    this.getAllAttributes();
    this.currentDyeingProcessId = this.currentRoute.snapshot.paramMap.get("id");
    if (this.currentDyeingProcessId) {
      this.getDyeingProcessById(this.currentDyeingProcessId);
      this.addFlag = false;
      this.updateFlag = true;
    }
  }

  public getMaster() {
    this.loading = true;
    this.master = [];
    this.partyService.getAllMaster().pipe(takeUntil(this.destroy$)).subscribe(
      (data) => {
        if (data["success"]) {
          this.master = data["data"];
          this.loading = false;
        } else {
          this.loading = false;
        }
      },
      (error) => {
        this.loading = false;
      }
    );
  }

  getItemList() {
    this.dyeingProcessService.getAllItemWithSupplier().pipe(takeUntil(this.destroy$)).subscribe(
      (data) => {
        if (data["success"]) {
          this.itemList = data["data"];
        }
      },
      (error) => {}
    );
  }

  getAllAttributes() {
    this.dyeingProcessService.getAttributes().subscribe(
      result => {
        if (result['success']) {
          this.attributesArray = result['data'];
          
        }
      }, error => {
      }
    )
  }

  getDyeingProcessById(id) {
    this.dyeingProcessService.getDyeingProcessById(id).pipe(takeUntil(this.destroy$)).subscribe(
      (data) => {
        if (data["success"]) {
          this.dyeingProcess = data["data"];
          this.dyeingProcessSteps = this.dyeingProcess.dyeingProcessData;
          this.setChemicalData();
        } else {
          this.toastr.error(data["msg"]);
        }
      },
      (error) => {
      }
    );
  }

  setChemicalData() {
    let inter = setInterval(() => {
      if (this.itemList) {
        this.dyeingProcessSteps.forEach((step) => {
          step.dyeingChemicalData.forEach((item) => {
            this.itemList.forEach((element) => {
              if (item.itemId == element.itemId) {
                item.supplierName = element.supplierName;
              }
            });
          });
        });
        clearInterval(inter);
      }
    }, 10);
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(
      this.dyeingProcessSteps,
      event.previousIndex,
      event.currentIndex
    );
  }

  onStepClick(step) {
    this.selectedStep = step.sequence;
  }

  onEditStep(step) {
    const modalRef = this._modalService.open(AddDyeingProcessStepComponent, {
      size: "lg",
    });
    modalRef.componentInstance.position = step.sequence;
    modalRef.componentInstance.id = this.dyeingProcess.id;
    modalRef.componentInstance.stepList = JSON.parse(
      JSON.stringify(this.dyeingProcessSteps)
    );
    modalRef.componentInstance.editStep = true;
    modalRef.result.then((result) => {
      if (result) {
        this.dyeingProcessSteps[step.sequence - 1].processType =
          result.processType;
        this.dyeingProcessSteps[step.sequence - 1].dyeingChemicalData =
          result.chemicalList;
        this.dyeingProcessSteps[step.sequence - 1].liquerRation =
          result.liquerRation;
        this.dyeingProcessSteps[step.sequence - 1].holdTime = result.holdTime;
        this.dyeingProcessSteps[step.sequence - 1].temp = result.temp;
        this.dyeingProcessSteps[step.sequence - 1].sequence = result.position;
        this.dyeingProcessSteps[step.sequence - 1].dyeingplcMast = result.dyeingplcMast?result.dyeingplcMast:null;
      }
    });
  }

  onDeleteStep(step) {
    let i = this.dyeingProcessSteps.findIndex(
      (v) => v.sequence == step.sequence
    );
    if (i > -1) {
      this.dyeingProcessSteps.splice(i, 1);
      //re-arrange Sequence no for all steps...
      this.dyeingProcessSteps.forEach((element, i) => {
        element.sequence = i + 1;
      });
    }
  }

  addProcessStep() {
    if (this.dyeingProcessSteps.length == 5) {
      this.toastr.warning("You are done with all the steps!");
    } else {
      const modalRef = this._modalService.open(AddDyeingProcessStepComponent, {
        size: "lg",
      });
      modalRef.componentInstance.position = this.dyeingProcessSteps.length + 1;
      modalRef.componentInstance.stepList = this.dyeingProcessSteps;
      modalRef.componentInstance.editStep = false;
      modalRef.result.then((result) => {
        if (result) {
          let step = new DyeingProcessData();
          step.processType = result.processType;
          step.liquerRation = result.liquerRation;
          step.sequence = result.position;
          step.dyeingChemicalData = result.chemicalList;
          step.temp = result.temp;
          step.holdTime = result.holdTime;
          step.dyeingplcMast = result.dyeingplcMast?result.dyeingplcMast:null;
          // step.functionList = [];
          if (
            !this.dyeingProcessSteps.length ||
            result.position == this.dyeingProcessSteps.length + 1
          ) {
            this.dyeingProcessSteps.push(step);
          } else {
            this.dyeingProcessSteps.splice(result.position - 1, 0, step);
          }
        }
      });
    }
  }

  addUpdateDyeingProcess(myForm) {
    this.disableButton = true;
    this.formSubmitted = true;
    if (myForm.valid && !this.processNameExist) {
      if (this.addFlag) {
        if (this.dyeingProcessSteps.length != 0) {
          //this.dyeingProcess.userHeadId = this.commonService.getUserHeadId().userHeadId;
          this.dyeingProcess.createdBy = this.commonService.getUser().userId;
          this.dyeingProcess.dyeingProcessData = this.dyeingProcessSteps;
          this.dyeingProcessService
            .saveDyeingProcess(this.dyeingProcess)
            .pipe(takeUntil(this.destroy$)).subscribe(
              (data) => {
                if (data["success"]) {
                  //reset form and other values
                  this.resetFormValues(myForm);
                  this.toastr.success(data["msg"]);
                } else {
                  this.disableButton = false;
                  this.toastr.error(data["msg"]);
                }
              },
              (error) => {
                this.disableButton = false;
              }
            );
        } else {
          this.disableButton = false;
          this.toastr.error("Please enter steps");
          return;
        }
      } else if (this.updateFlag) {
        if (this.dyeingProcessSteps.length != 0) {
          this.dyeingProcess.updatedBy = this.commonService.getUser().userId;
          this.dyeingProcess.dyeingProcessData = this.dyeingProcessSteps;
          this.dyeingProcessService
            .updateDyeingProcess(this.dyeingProcess)
            .pipe(takeUntil(this.destroy$)).subscribe(
              (data) => {
                if (data["success"]) {
                  this.disableButton = false;
                  this.route.navigate(["/pages/dyeing-process"]);
                  this.toastr.success(data["msg"]);
                } else {
                  this.disableButton = false;
                  this.toastr.error(data["msg"]);
                }
              },
              (error) => {
                this.disableButton = false;
              }
            );
        } else {
          this.disableButton = false;
          this.toastr.error("Please enter steps");
          return;
        }
      }
    } else {
      this.disableButton = false;
    }
  }

  isProcessNameAlreadyExist() {
    this.processNameExist = false;
    if (this.dyeingProcess.processName) {
      let id = 0;
      if (this.dyeingProcess.id) id = this.dyeingProcess.id;
      this.dyeingProcessService
        .isProcessNameExist(this.dyeingProcess.processName, id)
        .pipe(takeUntil(this.destroy$)).subscribe(
          (data) => {
            if (data["success"]) {
              this.processNameExist = data["data"];
            }
          },
          (error) => {}
        );
    }
  }

  resetFormValues(myForm) {
    this.formSubmitted = false;
    myForm.reset();
    this.dyeingProcessSteps = [];
    this.addFlag = true;
    this.updateFlag = false;
  }

  tableChange(event){
    switch(event){
      case "view table": 
      this.route.navigate(['/pages/dyeing-process/view']);
      break;

      case "add tag": 
      this.route.navigate(['/pages/dyeing-process/tag']);
      break;

      case "show tag": 
      this.route.navigate(['/pages/dyeing-process/tag/view']);
      break;

      default: break;

    }
  }
}
