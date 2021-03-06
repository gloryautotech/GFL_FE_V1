import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { ToastrService } from "ngx-toastr";
import * as errorData from "../../../@theme/json/error.json";
import { JetPlanningService } from "../../../@theme/services/jet-planning.service";
import { ProductionPlanningService } from "../../../@theme/services/production-planning.service";

@Component({
  selector: "ngx-shade-with-batch",
  templateUrl: "./shade-with-batch.component.html",
  styleUrls: ["./shade-with-batch.component.scss"],
})
export class ShadeWithBatchComponent implements OnInit, OnDestroy {
  allShade: any[];
  shade: any[];
  loading = false;
  public errorData: any = (errorData as any).default;
  @Input() statusChange: boolean;
  @Input() ctrlId: any;
  @Input() productionId: any;
  @Input("batchId") batchId: any;
  @Input("stockId") stockId: any;
  public jetStatus: string;
  public status = [];
  jet: any;
  jetList: any[] = [];
  formSubmitted: boolean = false;
  jetSelectedFlag = false;
  selectedJetData: any[] = [];
  jetCapacity = false;

  //batch:any;
  color: any;
  weight: any;

  public destroy$ : Subject<void> = new Subject<void>();
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  constructor(
    private productionPlanningService: ProductionPlanningService,
    private _NgbActiveModal: NgbActiveModal,
    private toastr: ToastrService,
    private jetService: JetPlanningService
  ) {}

  ngOnInit(): void {
    this.getWeightByStockAndBatch();
    if (this.statusChange) {
      this.getAllStatus();
    } else {
      this.getJetData();
    }
    //this.getAllBatchWithShade();
  }

  getWeightByStockAndBatch() {
    this.productionPlanningService
      .getWeightByStockIdAndBatchId(this.batchId, this.stockId)
      .pipe(takeUntil(this.destroy$)).subscribe((data) => {
        if (data["success"]) {
          this.weight = data["data"].totalwt;
        }
      });
  }

  getAllStatus() {
    this.jetService.getAllStatuses().pipe(takeUntil(this.destroy$)).subscribe(
      (data) => {
        if (data["success"]) {
          this.status = data["data"];
        }
      },
      (error) => {}
    );
  }

  get activeModal() {
    return this._NgbActiveModal;
  }
  getJetData() {
    this.loading = true;
    this.jetService.getAllJetData().pipe(takeUntil(this.destroy$)).subscribe(
      (data) => {
        if (data["success"]) {
          this.jetList = data["data"];
        } else {
          this.loading = false;
        }
      },
      (error) => {
        this.loading = false;
      }
    );
  }

  jetSelected(event) {
    this.jetCapacity = false;
    this.jetList.forEach((element) => {
      if (element.id == event) {
        if (element.capacity > this.weight) {
          this.selectedJetData = element.jetDataList;
          if (!this.selectedJetData) {
            this.jetSelectedFlag = false;
          } else {
            this.jetSelectedFlag = true;
          }
        } else {
          this.jetCapacity = true;
          this.jetSelectedFlag = false;
        }
      }
    });
  }

  onClick(event) {
    if (!this.jetCapacity) this.activeModal.close(event.value);
  }

  changeStatus() {
    let obj = {
      controlId: this.ctrlId,
      prodcutionId: this.productionId,
      status: this.jetStatus,
    };
    this.jetService.updateStatus(obj).pipe(takeUntil(this.destroy$)).subscribe(
      (data) => {
        if (data["success"]) {
          this.toastr.success(data["msg"]);
          this.activeModal.close(true);
        } else {
          this.toastr.error(data["msg"]);
        }
      },
      (error) => {
        this.toastr.error("Internal Server Error");
      }
    );
  }
}
