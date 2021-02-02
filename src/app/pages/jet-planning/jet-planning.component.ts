import { Component, OnInit } from '@angular/core';
import { CdkDragDrop, CdkDropList, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ShadeWithBatchComponent } from '../production-planning/shade-with-batch/shade-with-batch.component';
import { JetPlanningService } from 'app/@theme/services/jet-planning.service';
import { JetPlanning, JetDataList } from "app/@theme/model/jet-planning";
import { ToastrService } from 'ngx-toastr';
import * as errorData from "app/@theme/json/error.json";
import { ProductionPlanningService } from 'app/@theme/services/production-planning.service';
import { WarningPopupComponent } from 'app/@theme/components/warning-popup/warning-popup.component';
import {ProductionPlanning} from "app/@theme/model/production-planning";
import { PartyService } from 'app/@theme/services/party.service';
import { ActivatedRoute, Router } from '@angular/router';
import { QualityService } from 'app/@theme/services/quality.service';
import { CommonService } from 'app/@theme/services/common.service';
import { StockBatchService } from 'app/@theme/services/stock-batch.service';
import { ProgramService } from 'app/@theme/services/program.service';
import { ShadeService } from 'app/@theme/services/shade.service';

import { PlanningSlipComponent } from './planning-slip/planning-slip.component';
import { NbMenuService } from '@nebular/theme';
import { filter, map } from 'rxjs/operators';
@Component({
  selector: 'ngx-jet-planning',
  templateUrl: './jet-planning.component.html',
  styleUrls: ['./jet-planning.component.scss']
})
export class JetPlanningComponent implements OnInit {

  finalobj = [];
  public connectedTo: CdkDropList[] = [];
  items = [{ title: 'Change Status' }, { title: 'Print' }, {title: 'Edit And Print'}];
  allShade: any;
  productionPlanning: ProductionPlanning = new ProductionPlanning();
  public errorData: any = (errorData as any).default;
  user: any;
  userHead: any;
  public loading = false;
  formSubmitted: boolean = false;
  batch: any;
  p_id: any;
  partyList: any[];
  qualityList: any[];
  batchListByParty: any[];
  batchListParty: any[];
  batchList:any[]=[];
  allBatchList: any[]=[];
  // batchList = [];
  programValues: any;
  qualityList1: any;
   jetData1 = {
    controlId: null,
    productionId: null,
    sequence: null,
  }
  array = [];
  array1 = [];
  index: any;
  productionList = [];
  production: any[];
  jet: any[];
  jetData: any[];
  
  count = 0;
  countArr = [];
  jetPlanning: JetPlanning = new JetPlanning();
  jetDataList: JetDataList = new JetDataList();
  JetDataListArray: JetDataList[] = [];


  constructor(
    private modalService: NgbModal,
    private jetService: JetPlanningService,
    private toastr: ToastrService,
    private productionPlanningService: ProductionPlanningService,
    private partyService: PartyService,
    private _route: ActivatedRoute,
    private qualityService: QualityService,
    private route: Router,
    private commonService: CommonService,
    private stockBatchService: StockBatchService,
    private programService: ProgramService,
    private shadeService: ShadeService,
    private menuService: NbMenuService

  ) {

    
   }

  ngOnInit(): void {
    this.productionPlanningService.addToJetClicked.subscribe(ele => {
      console.log(ele);
      if(ele){
        this.batchSelected(ele);
      }
    })
    this.getCurrentId();
    this.getPartyList();
    this.getQualityList();
    //this.getAllBatchData();
    this.getJetData();

    this.menuService.onItemClick()
      .pipe(
        filter(({ tag }) => tag === 'my-context-menu'),
        map(({ item: { title } }) => title),
      )
      .subscribe(title => {
        if(title === 'Print') this.generateSlip(true);
        else if(title === 'Edit And Print') this.generateSlip(false);
      });
    
  
  }


  
  getCurrentId() {
    this.user = this.commonService.getUser();
    this.userHead = this.commonService.getUserHeadId();
  }
  getPartyList() {
    this.loading = true;
    this.partyService.getAllPartyNameList().subscribe(
      (data) => {
        if (data["success"]) {
          this.partyList = data["data"];
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

  public getQualityList() {
    this.loading = true;
    this.qualityService.getQualityNameData().subscribe(
      (data) => {
        if (data["success"]) {
          this.qualityList = data["data"]
          this.batchListByParty = data["data"];
          if (this.allBatchList != null || this.allBatchList != undefined) {
            this.allBatchList.forEach(element => {
              if (element.productionPlanned == false) {
                this.batchListParty.push(element);
              }
            });
          }
          this.batchListByParty = this.batchListParty;

          this.loading = false;
        } else {
          this.toastr.error(data["msg"]);
          this.loading = false;
        }
      },
      (error) => {
        // this.toastr.error(errorData.Serever_Error);

        this.loading = false;
      }
    );
  }

  // public getAllBatchData() {
  //   this.jetService.getAllProductionWithoutJetPlan().subscribe(
  //     (data) => {
  //       if (data["success"]) {
  //         this.allBatchList = data["data"];

  //       }
  //     },
  //     (error) => {
  //       this.toastr.error(errorData.Serever_Error);
  //     }
  //   );
  // }

  public partySelected(event) {
    this.loading = true;
    this.productionPlanning.qualityId = null;
    if (event != undefined) {
      if (this.productionPlanning.partyId) {
        this.programService
          .getQualityByParty(this.productionPlanning.partyId)
          .subscribe(
            (data) => {
              if (data["success"]) {
                this.qualityList = data["data"].qualityDataList;

              } else {
                this.productionPlanning.qualityId = null;
                this.qualityList = [];

              }
              this.loading = false;
            },
            (error) => {
              this.qualityList = [];
              this.loading = false;
            }
          );
      }
    }
    // if (event != undefined) {
    //   this.batchList = [];
    //   if (this.productionPlanning.partyId) {
    //     this.jetService.getAllProductionWithoutJetPlan()
    //       .subscribe(
    //         (data) => {
    //           if (data["success"]) {
    //             this.allBatchList = data["data"];
    //             this.allBatchList.forEach(element => {
    //               if (element.productionPlanned == false) {
    //                 this.batchList.push(element);
    //               }
    //             });
    //             this.allBatchList = this.batchList;

    //             this.loading = false;
    //           } else {
    //             this.toastr.error(data["msg"]);
    //             this.allBatchList = [];
    //             this.loading = false;
    //           }
    //           this.loading = false;
    //         },
    //         (error) => {
    //           this.loading = false;
    //         }
    //       );
    //   }
    // }

    // else {
    //   this.allBatchList = [];
    //   this.productionPlanning.partyId = null;
    //   this.productionPlanning.qualityId = null;

    //   this.getPartyList();
    //   this.getQualityList();
    //   //this.getAllBatchData();
    //   this.loading = false;
    // }


  }

  public qualitySelected(event) {
    this.loading = true;
    if (event != undefined) {
      if (this.productionPlanning.qualityId) {
        this.qualityList.forEach((e) => {

          if (e.qualityId == this.productionPlanning.qualityId) {
            this.p_id = e.partyId;
            //this.productionPlanning.partyId = e.partyName;
            this.productionPlanning.qualityEntryId = e.id || e.qualityEntryId;
          }
        });
      }
      if (this.productionPlanning.qualityEntryId) {
         this.allBatchList = [];
        this.getAllBatchWithShade();
       
        
        // this.programService
        //   .getBatchByQuality(this.productionPlanning.qualityEntryId)
        //   .subscribe(
        //     (data) => {
        //       if (data["success"]) {
        //         this.allBatchList = data["data"];
        //         this.allBatchList.forEach(element => {
        //           if (element.productionPlanned == false) {
        //             this.batchList.push(element);
        //           }
        //         });
        //         this.allBatchList = this.batchList;

        //         this.loading = false;
        //       } else {
        //         this.toastr.error(data["msg"]);
        //         this.allBatchList = [];
        //         this.loading = false;
        //       }
        //       this.loading = false;
        //     },
        //     (error) => {
        //       this.loading = false;
        //     }
        //   );
      }
    }
  }
  getAllBatchWithShade(){

    this.loading=true;
   // let p_id;
    this.productionPlanningService.getAllProductionPlan().subscribe(
      (data) => {
            if (data["success"]) {
              this.batchList = data["data"];
              // this.partyList.forEach(element => {
              //   if(element.partyName == this.productionPlanning.partyId){
              //     p_id = element.id;
              //   }
              // })
              console.log(this.batchList, this.productionPlanning.partyId, this.productionPlanning.qualityEntryId);
              this.batchList.forEach(element => {
                if(this.productionPlanning.partyId == element.partyId && this.productionPlanning.qualityEntryId == element.qualityEntryId){
                  this.allBatchList.push(element);
                }
               
              })
              console.log(this.allBatchList);
              
            }
            else {
              // this.toastr.error(data["msg"]);
              this.loading = false;
            }
          },
      (error) => {
            // this.toastr.error(errorData.Serever_Error);
            this.loading = false;
          }
    );}

    batchSelected(event){
      let p_id;
      if(event.target){
        p_id= Number(event.target.value);
      }else{
        p_id = event;
      }
      const modalRef = this.modalService.open(ShadeWithBatchComponent).result.then(
        (result) => {
          
          let index;
          console.log(event);
          console.log(this.jet);
          console.log(result);

          this.jet.forEach(element => {

            if(element.id == result.jet){
              
              index = element.jetDataList.length;
            }
          });
          
          // console.log(this.jet.indexOf(result.jet));
           this.jetData1.controlId = result.jet;
          this.jetData1.productionId = p_id;
            this.jetData1.sequence = index;
           let jetData2 = this.jetData1;
           let arr =[];
          //  jetData2.productionId = Number(jetData2.productionId);
           arr.push(jetData2)
           this.addJetData(arr);
          
        })
    }

    addJetData(arr){
      this.jetService.saveJetData(arr).subscribe(
        (data) => {
          if (data["success"]) {
            this.toastr.success(errorData.Add_Success);
            this.getJetData();
            //this.getshade();
          }
          else {
            this.toastr.error("Weight is more than jet capacity");
            this.getJetData();
            //this.getshade();
          }

        }
      )
    }

  drop(event: CdkDragDrop<any[]>, i) {


    if (event.previousContainer === event.container) {
      moveItemInArray(this.jet[i].jetDataList, event.previousIndex, event.currentIndex);
      let fromobj = {
        "jetId": this.jet[i].id,
        "productionId": event.container.data[event.currentIndex].productionId,
        "sequence": event.previousIndex + 1
      }
      let toobj = {
        "jetId": this.jet[i].id,
        "productionId": event.container.data[event.currentIndex].productionId,
        "sequence": event.currentIndex + 1
      }
      let obj = {
        "from": fromobj,
        "to": toobj
      }
      this.jetService.updateJetData(obj).subscribe(
        (data) => {
          if (data["success"]) {
            this.toastr.success(errorData.Add_Success);
          }

        }
      )

    }
    else {
      transferArrayItem(event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex);
        let fromobj = {
          "jetId": this.jet[i].id,
          "productionId": event.container.data[event.currentIndex].productionId,
          "sequence": event.previousIndex + 1
        }
        let toobj = {
          "jetId": this.jet[i].id,
          "productionId": event.container.data[event.currentIndex].productionId,
          "sequence": event.currentIndex + 1
        }
        let obj = {
          "from": fromobj,
          "to": toobj
        }
        this.jetService.updateJetData(obj).subscribe(
          (data) => {
            if (data["success"]) {
              this.toastr.success(errorData.Add_Success);
            }
  
          }
        )
  
    }
  }
  // getshade() {
  //   this.productionPlanningService.getAllProductionPlan().subscribe(
  //     (data) => {
  //       if (data["success"]) {
  //         this.allShade = data["data"];
  //       }
  //       else {
  //         // this.toastr.error(data["msg"]);
  //         this.loading = false;
  //         this.allShade = null;
  //       }
  //     },
  //     (error) => {
  //       // this.toastr.error(errorData.Serever_Error);
  //       this.loading = false;
  //       this.allShade = null;
  //     }
  //   );

  // }

  // addNew(event, index) {

  //   if (this.allShade == null || this.allShade == undefined) {
  //     const modalRef = this.modalService.open(WarningPopupComponent)
  //   }
  //   else {
  //     const modalRef = this.modalService.open(ShadeWithBatchComponent).result.then(
  //       (result) => {
  //         //this.jet[index].production.push(result.batchId);
  //         //this.jet[index]
  //         // if(this.jet[index].jetDataList == null){
  //         //   this.jet[index].jetDataList = result;
  //         // }
  //         // else{
  //         //   this.jet[index].jetDataList.push(result);

  //         // }
          
  //       });

  //   }


  // }

  getJetData() {
    this.loading = true;
    this.jetService.getAllJetData().subscribe(
      (data) => {
        if (data["success"]) {
          this.jet = data["data"];
          this.jet.forEach(ele => {
            this.connectedTo.push(ele)
          })
        }

        else {
          this.loading = false;
        }
      },
      (error) => {
        this.loading = false;
      }
    );
  }

  generateSlip(directPrint){
    const modalRef = this.modalService.open(PlanningSlipComponent);
    modalRef.componentInstance.isPrintDirect = directPrint;
    modalRef.result.then((result) => {
      if (result) {
        console.log("Done");
      }
    });
  }

}


