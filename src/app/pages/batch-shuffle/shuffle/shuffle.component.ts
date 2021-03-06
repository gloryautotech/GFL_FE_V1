import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from "@angular/cdk/drag-drop";
import { Component, OnDestroy, OnInit } from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import * as errorData from "../../../@theme/json/error.json";
import { BatchByQualityPartyService } from "../../../@theme/services/batch-by-quality-party.service";
import { BatchListService } from "../../../@theme/services/batch-list.service";
import { PartyService } from "../../../@theme/services/party.service";
import { ProgramService } from "../../../@theme/services/program.service";
import { QualityService } from "../../../@theme/services/quality.service";
import { ShuffleService } from "../../../@theme/services/shuffle.service";
import { ToastrService } from "ngx-toastr";
import { StockBatchService } from "../../../@theme/services/stock-batch.service";
@Component({
  selector: "ngx-shuffle",
  templateUrl: "./shuffle.component.html",
  styleUrls: ["./shuffle.component.scss"],
})
export class ShuffleComponent implements OnInit, OnDestroy {
  public flag = 0;
  public rval = 1;
  public btnFlag = 0;
  public setBatchFlag = 0;
  shuffleForm: FormGroup;

  //form Validation
  formSubmitted = false;

  //to store party info
  party: any[];
  private pId: any;

  //to store quality info
  private qId: any;
  quality: any[];

  part1 = [];

  part2 = [];
  updateFlag = 0;
  //to store batch info based on party and quality
  qualityParty: any[];
  qualityParty2 = [];
  qualityPartyLeft = [];
  bId1 = [];
  bId2 = [];
  batches: any[];
  i: number;
  sum = 0;
  batchDataList = [];
  mergeArray = [];
  objectOfBatch1 = {};
  objectOfBatch2 = {};
  cId1: any;
  cId2: any;
  batchId1: any;
  batchId2: any;
  index: number;
  currentBatchSequence;
  currentBatchSeqId;
  public destroy$ : Subject<void> = new Subject<void>();
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  constructor(
    private partyService: PartyService,
    private shuffleService: ShuffleService,
    private qualityService: QualityService,
    private toastr: ToastrService,
    private programService: ProgramService,
    private formBuilder: FormBuilder,
    private batchByQualityPartyService: BatchByQualityPartyService,
    private batchList: BatchListService,
    private stockBatchService: StockBatchService
  ) {
    this.shuffleForm = this.formBuilder.group({
      partyName: new FormControl(null, Validators.required),
      qualityName: new FormControl(null, Validators.required),
      batchName1: new FormControl(null, Validators.required),
      batchName2: new FormControl(null, Validators.required),
      totalmtr1: new FormControl(),
      totalmtr2: new FormControl(),
      totalwt1: new FormControl(),
      totalwt2: new FormControl(),
      updatedBy: new FormControl(null),
      newBatchName: new FormControl(),
      totalrowsPart2: new FormControl(),
      totalrowsPart1: new FormControl(),
    });
  }

  ngOnInit() {
    this.flag = 1;
    this.getPartyList();
    this.getQualtiyList();
    this.btnFlag = 0;

    this.getCurrentBatchSequence();
  }

  getCurrentBatchSequence() {
    this.stockBatchService.getBatchSequence(true).pipe(takeUntil(this.destroy$)).subscribe((data) => {
      if (data["success"]) {
        this.currentBatchSequence = data["data"]["sequence"];
        this.currentBatchSeqId = data["data"]["id"];
        this.shuffleForm.controls["newBatchName"].setValue(
          this.currentBatchSequence
        );
      }
    });
  }

  //party drop down validation
  hasDropDownError() {
    if (
      this.shuffleForm.controls["partyName"].invalid &&
      this.shuffleForm.controls["partyName"].touched
    ) {
      this.flag = 1;
      return true;
    } else if (this.shuffleForm.controls["partyName"].valid && this.rval == 2) {
      this.flag = 0;
      return false;
    }
  }

  //quality drop down validation
  hasDropDownError1() {
    if (
      this.shuffleForm.controls["qualityName"].invalid &&
      this.shuffleForm.controls["qualityName"].touched
    ) {
      this.flag = 1;
      return true;
    } else if (
      this.shuffleForm.controls["qualityName"].valid &&
      this.rval == 2
    ) {
      this.flag = 0;
      return false;
    }
  }

  getPartyList() {
    this.partyService.getAllPartyNameList().pipe(takeUntil(this.destroy$)).subscribe((data) => {
      if (data["success"]) {
        this.party = data["data"];
      }
    });
  }

  getQualtiyList() {
    this.qualityService.getAllQualityWithNameOnly().pipe(takeUntil(this.destroy$)).subscribe((data) => {
      if (data["success"]) {
        this.quality = data["data"];
      }
    });
  }

  //get party and qulaity Id
  dropSelectParty(event) {
    this.formSubmitted = true;
    this.pId = this.shuffleForm.controls["partyName"].value;

    if (event == undefined) {
      this.shuffleForm.controls["batchName1"].reset();
      this.shuffleForm.controls["batchName2"].reset();

      this.batches = [];
      this.part1 = [];
      this.part2 = [];
      this.qualityParty = [];
      this.qualityParty2 = [];
      this.qualityParty2[0] = [];
      this.quality = [];
      this.shuffleForm.controls["totalrowsPart1"].reset();
      this.shuffleForm.controls["totalrowsPart2"].reset();
      this.shuffleForm.controls["totalwt1"].reset();
      this.shuffleForm.controls["totalwt2"].reset();
      this.shuffleForm.controls["totalmtr1"].reset();
      this.shuffleForm.controls["totalmtr2"].reset();
      this.shuffleForm.controls["qualityName"].reset();
      this.getQualtiyList();
      this.getPartyList();
    }

    if (this.pId != null) {
      this.qualityService.getQualityByParty(this.pId).pipe(takeUntil(this.destroy$)).subscribe(
        (data) => {
          if (data["success"]) {
            this.shuffleForm.controls["qualityName"].reset();
            this.quality = data.data.qualityDataList;
            this.shuffleForm.controls["batchName1"].reset();
            this.shuffleForm.controls["batchName2"].reset();

            this.shuffleForm.controls["totalrowsPart1"].reset();
            this.shuffleForm.controls["totalrowsPart2"].reset();
            this.shuffleForm.controls["totalwt1"].reset();
            this.shuffleForm.controls["totalwt2"].reset();
            this.shuffleForm.controls["totalmtr1"].reset();
            this.shuffleForm.controls["totalmtr2"].reset();
            this.part2 = [];
            this.qualityParty2 = [];
            this.qualityParty2[0] = [];
            this.batches = [];
          } else {
            this.toastr.error(data["msg"]);
          }
        },
        (error) => {
          this.toastr.error(errorData.Serever_Error);
        }
      );
    }

    if (
      this.shuffleForm.controls["partyName"].valid &&
      this.shuffleForm.controls["qualityName"].valid
    ) {
      this.getVal();
    }
  }

  dropSelectQuality(event) {
    this.formSubmitted = true;

    this.qId = this.shuffleForm.controls["qualityName"].value;
    if (event == undefined) {
      this.shuffleForm.controls["batchName1"].reset();
      this.shuffleForm.controls["batchName2"].reset();

      this.batches = [];
      this.part1 = [];
      this.part2 = [];
      this.qualityParty = [];
      this.qualityParty2 = [];
      this.qualityParty2[0] = [];
      this.shuffleForm.controls["totalrowsPart1"].reset();
      this.shuffleForm.controls["totalrowsPart2"].reset();
      this.shuffleForm.controls["totalwt1"].reset();
      this.shuffleForm.controls["totalwt2"].reset();
      this.shuffleForm.controls["totalmtr1"].reset();
      this.shuffleForm.controls["totalmtr2"].reset();

      this.getPartyList();
    }

    if (this.qId != null) {
      let temp;
      this.programService.getPartyByQuality(this.qId).pipe(takeUntil(this.destroy$)).subscribe(
        (data) => {
          if (data["success"]) {
            temp = data.data.partyName;
            this.shuffleForm.controls["partyName"].setValue(temp);
            this.pId = data.data.partyId;
          } else {
            this.toastr.error(data["msg"]);
          }
        },
        (error) => {
          this.toastr.error(errorData.Serever_Error);
        }
      );
    }
    if (
      this.shuffleForm.controls["partyName"].valid &&
      this.shuffleForm.controls["qualityName"].valid
    ) {
      this.getVal();
    }
  }

  //raido select for split and merge
  onChange(event) {
    this.formSubmitted = true;
    switch (event) {
      case 1:
        this.rval = 1;
        this.flag = 1;
        this.btnFlag = 0;
        this.part2 = [];
        this.qualityParty2 = [];
        this.qualityParty2[0] = [];
        this.shuffleForm.controls["totalrowsPart2"].reset();
        this.shuffleForm.controls["totalwt2"].reset();
        this.shuffleForm.controls["totalmtr2"].reset();
        this.getBatches(this.cId1, this.batchId1);
        break;

      case 2:
        this.rval = 2;
        this.btnFlag = 1;
        if (
          this.shuffleForm.controls["partyName"].invalid &&
          this.shuffleForm.controls["qualityName"].invalid
        ) {
          this.flag = 1;
        } else {
          this.flag = 0;
          this.shuffleForm.controls["batchName2"].reset();
          this.part2 = [];

          this.qualityParty2[0] = [];
          this.shuffleForm.controls["totalrowsPart2"].reset();
          this.shuffleForm.controls["totalwt2"].reset();
          this.shuffleForm.controls["totalmtr2"].reset();
          this.getVal();
          this.getBatches(this.cId1, this.batchId1);
        }
        break;
    }
  }

  getQualityParty() {
    this.batchByQualityPartyService
      .getBatchById(this.qId, this.pId)
      .pipe(takeUntil(this.destroy$)).subscribe((data) => {
        if (data["success"]) {
          this.qualityParty = data["data"];

          //to avoid merging of same batches
          if (this.shuffleForm.controls["batchName1"].valid) {
            this.index = this.qualityParty.findIndex(
              (x) => x.batchId === this.bId1["batchId"]
            );
            this.qualityParty2 = [];
            this.qualityParty2.push(this.qualityParty);
            this.qualityParty2[0].splice(this.index, 1);
          }
          if (this.shuffleForm.controls["batchName2"].valid) {
            this.index = this.qualityParty2.findIndex(
              (x) => x.batchId === this.bId2["batchId"]
            );
            this.qualityParty = [];
            this.qualityParty.push(this.qualityParty);
            this.qualityParty[0].splice(this.index, 1);
          }
        }
      });
  }

  //get list of batches based on partId and batchId
  getVal() {
    if (this.shuffleForm.controls["qualityName"].value == null) {
      this.toastr.error("Please select a Quality");
    } else if (this.shuffleForm.controls["partyName"].value == null) {
      this.toastr.error("Please select a Party");
    } else {
      this.getQualityParty();
    }
  }
  findmtrsum() {
    this.sum = 0;
    for (this.i = 0; this.i <= this.batches.length - 1; this.i++) {
      this.sum += this.batches[this.i].mtr;
      this.shuffleForm.patchValue({ totalmtr1: this.sum.toFixed(2) });
    }
    if (this.batches.length == 0) {
      this.shuffleForm.patchValue({ totalmtr1: this.sum.toFixed(2) });
    }
    this.sum = 0;
    for (this.i = 0; this.i <= this.part2.length - 1; this.i++) {
      this.sum += this.part2[this.i].mtr;
      this.shuffleForm.patchValue({ totalmtr2: this.sum.toFixed(2) });
    }
    if (this.part2.length == 0) {
      this.shuffleForm.patchValue({ totalmtr2: this.sum.toFixed(2) });
    }
  }
  findwtsum() {
    this.sum = 0;
    for (this.i = 0; this.i <= this.batches.length - 1; this.i++) {
      this.sum += this.batches[this.i].wt;
      this.shuffleForm.patchValue({ totalwt1: this.sum.toFixed(2) });
    }
    if (this.batches.length == 0) {
      this.shuffleForm.patchValue({ totalwt1: this.sum.toFixed(2) });
    }
    this.sum = 0;
    for (this.i = 0; this.i <= this.part2.length - 1; this.i++) {
      this.sum += this.part2[this.i].wt;
      this.shuffleForm.patchValue({ totalwt2: this.sum.toFixed(2) });
    }
    if (this.part2.length == 0) {
      this.shuffleForm.patchValue({ totalwt2: this.sum.toFixed(2) });
    }
  }
  // get list of all batches(meter-weight) inside selected batch based on control Id and batch Id
  temp() {
    this.bId1 = this.shuffleForm.controls["batchName1"].value;

    if (this.shuffleForm.controls["batchName1"].value == null) {
      this.shuffleForm.controls["batchName2"].reset();
      this.shuffleForm.controls["totalrowsPart1"].reset();
      this.shuffleForm.controls["totalrowsPart2"].reset();
      this.shuffleForm.controls["totalwt1"].reset();
      this.shuffleForm.controls["totalwt2"].reset();
      this.shuffleForm.controls["totalmtr1"].reset();
      this.shuffleForm.controls["totalmtr2"].reset();

      this.part2 = [];
      this.qualityParty2 = [];
      this.batches = [];
    }

    this.cId1 = this.bId1["controlId"];
    this.batchId1 = this.bId1["batchId"];

    this.getBatches(this.cId1, this.batchId1);

    if (this.shuffleForm.controls["batchName2"].valid)
      this.getBatches1(this.cId2, this.batchId2);
    else {
      this.part2 = [];
      this.qualityParty2 = [];
      this.qualityParty2[0] = [];
    }
  }
  temp1() {
    this.bId2 = this.shuffleForm.controls["batchName2"].value;

    if (this.shuffleForm.controls["batchName2"].value == null) {
      this.part2 = [];
      //this.qualityParty2 = [];
      this.shuffleForm.controls["totalrowsPart2"].reset();
      this.shuffleForm.controls["totalwt2"].reset();
      this.shuffleForm.controls["totalmtr2"].reset();
    }

    this.cId2 = this.bId2["controlId"];
    this.batchId2 = this.bId2["batchId"];
    this.getBatches(this.cId1, this.batchId1);
    this.getBatches1(this.cId2, this.batchId2);
  }

  getBatches(currentCId, currentbId) {
    if (this.shuffleForm.controls["batchName1"].valid && this.rval == 1) {
      this.batchList.getBatchById(currentCId, currentbId).pipe(takeUntil(this.destroy$)).subscribe((data) => {
        if (data["success"]) {
          this.batches = data["data"];
          this.findmtrsum();
          this.findwtsum();
          this.shuffleForm.controls["totalrowsPart1"].setValue(
            this.batches.length
          );
          this.shuffleForm.controls["totalrowsPart2"].setValue(
            this.part2.length
          );
        }
        this.setBatchFlag = 1;
      });
    } else if (this.rval == 2) {
      if (this.shuffleForm.controls["batchName1"].valid) {
        this.setBatchFlag = 1;
        this.batchList
          .getBatchById(currentCId, currentbId)
          .pipe(takeUntil(this.destroy$)).subscribe((data) => {
            if (data["success"]) {
              this.batches = data["data"];
              this.findmtrsum();
              this.findwtsum();
              this.shuffleForm.controls["totalrowsPart1"].setValue(
                this.batches.length
              );
              this.shuffleForm.controls["totalrowsPart2"].setValue(
                this.part2.length
              );
            }
          });
      }
    }
  }

  getBatches1(currentCId, currentbId) {
    if (this.shuffleForm.controls["batchName1"].valid && this.rval == 1) {
      this.batchList.getBatchById(currentCId, currentbId).pipe(takeUntil(this.destroy$)).subscribe((data) => {
        if (data["success"]) {
          this.batches = data["data"];
          this.findmtrsum();
          this.findwtsum();
          this.shuffleForm.controls["totalrowsPart1"].setValue(
            this.batches.length
          );
          this.shuffleForm.controls["totalrowsPart2"].setValue(
            this.part2.length
          );
        }
        this.setBatchFlag = 1;
      });
    } else if (this.rval == 2) {
      if (this.shuffleForm.controls["batchName2"].valid) {
        this.batchList.getBatchById(currentCId, currentbId).pipe(takeUntil(this.destroy$)).subscribe(
          (data) => {
            if (data["success"]) {
              this.part2 = data["data"];
              this.findmtrsum();
              this.findwtsum();
              this.shuffleForm.controls["totalrowsPart1"].setValue(
                this.batches.length
              );

              this.shuffleForm.controls["totalrowsPart2"].setValue(
                this.part2.length
              );
            } else {
            }
          },
          (error) => {}
        );
      }
    }
  }

  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
    this.updateFlag = 1;
    this.findmtrsum();
    this.findwtsum();
    this.shuffleForm.controls["totalrowsPart1"].setValue(this.batches.length);
    this.shuffleForm.controls["totalrowsPart2"].setValue(this.part2.length);
  }

  splitsubmit() {
    if (this.part2.length == 0 || this.batches.length == 0) {
      this.toastr.error("No batch was splitted");
    } else {
      this.formSubmitted = true;
      if (this.shuffleForm.controls["newBatchName"].value == null) {
        this.toastr.error("please enter New Batch name");
      } else {
        var newBatch = this.shuffleForm.controls["newBatchName"].value;
        //this.shuffleForm.value.updatedBy = this.batches;
        if (
          this.shuffleForm.controls["partyName"].valid &&
          this.shuffleForm.controls["qualityName"].valid &&
          this.shuffleForm.controls["batchName1"].valid
        ) {
          this.objectOfBatch1 = {
            batchDataList: this.batches,
            batchId: this.batchId1,
            controlId: this.cId1,
            isSplit: false,
          };

          this.objectOfBatch2 = {
            batchDataList: this.part2,
            batchId: newBatch,
            controlId: this.cId1,
            isSplit: true,
          };

          this.mergeArray.push(this.objectOfBatch1);
          this.mergeArray.push(this.objectOfBatch2);
          this.shuffleService.updateBatchSplit(this.mergeArray).pipe(takeUntil(this.destroy$)).subscribe(
            (data) => {
              if (data["success"]) {
                this.reset();
                //location.reload();
                this.getCurrentBatchSequence();
                this.toastr.success(errorData.Update_Success);
              } else {
                this.mergeArray = [];
                this.toastr.error(data["msg"]);
                this.toastr.error(errorData.Update_Error);
              }
            },
            (error) => {
              this.mergeArray = [];
              this.toastr.error(errorData.Serever_Error);
            }
          );
        } else {
          this.toastr.error("Please fill all the required fields");
        }
      }
    }
  }

  reset() {
    this.shuffleForm.controls["batchName1"].reset();
    this.shuffleForm.controls["partyName"].reset();
    this.shuffleForm.controls["qualityName"].reset();
    this.shuffleForm.controls["batchName2"].reset();
    this.shuffleForm.controls["totalrowsPart1"].reset();
    this.shuffleForm.controls["totalrowsPart2"].reset();
    this.shuffleForm.controls["totalwt1"].reset();
    this.shuffleForm.controls["totalwt2"].reset();
    this.shuffleForm.controls["totalmtr1"].reset();
    this.shuffleForm.controls["totalmtr2"].reset();

    this.part2 = [];
    this.qualityParty2 = [];
    this.batches = [];
  }

  mergesubmit() {
    if (this.updateFlag == 0) {
      this.toastr.error("No batch was choosen to merge");
    } else if (
      this.shuffleForm.controls["batchName1"].value ==
      this.shuffleForm.controls["batchName2"].value
    ) {
      this.toastr.error("Cannot merge same batch");
    } else {
      this.formSubmitted = true;

      if (
        this.shuffleForm.controls["partyName"].valid &&
        this.shuffleForm.controls["qualityName"].valid &&
        this.shuffleForm.controls["batchName1"].valid &&
        this.shuffleForm.controls["batchName2"].valid
      ) {
        this.objectOfBatch1 = {
          batchDataList: this.batches,
          batchId: this.batchId1,
          controlId: this.cId1,
        };

        this.objectOfBatch2 = {
          batchDataList: this.part2,
          batchId: this.batchId2,
          controlId: this.cId2,
        };

        this.mergeArray.push(this.objectOfBatch1);
        this.mergeArray.push(this.objectOfBatch2);
        this.shuffleService.updateBatchMerge(this.mergeArray).pipe(takeUntil(this.destroy$)).subscribe(
          (data) => {
            if (data["success"]) {
              location.reload();
              this.toastr.success(errorData.Update_Success);
            } else {
              this.mergeArray = [];
              this.toastr.error(errorData.Update_Error);
            }
          },
          (error) => {
            this.mergeArray = [];
            this.toastr.error(errorData.Serever_Error);
          }
        );
      } else {
        this.toastr.error("Please fill all the required fields");
      }
    }
  }
}
