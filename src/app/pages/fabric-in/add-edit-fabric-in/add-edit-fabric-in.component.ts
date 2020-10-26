import { Component, OnInit } from "@angular/core";
import { Router } from '@angular/router';
import { NbComponentStatus, NbGlobalPhysicalPosition, NbGlobalPosition, NbToastrConfig, NbToastrService } from '@nebular/theme';
import { FabricInService } from 'app/@theme/services/fabric-in.service';
import { PartyService } from "app/@theme/services/party.service";
import { QualityService } from "app/@theme/services/quality.service";
import { sample } from 'rxjs/operators';

@Component({
  selector: "ngx-add-edit-fabric-in",
  templateUrl: "./add-edit-fabric-in.component.html",
  styleUrls: ["./add-edit-fabric-in.component.scss"],
})
export class AddEditFabricInComponent implements OnInit {
  //toaster config
  config: NbToastrConfig;
  destroyByClick = true;
  duration = 2000;
  hasIcon = true;
  position: NbGlobalPosition = NbGlobalPhysicalPosition.TOP_RIGHT;
  preventDuplicates = false;
  status

  //form valiables...
  formValues = {
    stockInType: "Fabric",
    partyId:null,
    batch:null,
    billNo:null,
    billDate:null,
    chlNo:null,
    chlDate:null,
    lot:null,
    remark:null,
    qualityListEmpty:[
      {
        id: null,
        gr: null,
        qualityId: null,
        qualityName: null,
        qualityType: null,
        meter: null,
        weight:null,
        noOfCones: null,
        noOfBox: null
      }
    ]
  };

  qualityList;
  party: any[];
  index: any;
  formSubmitted: boolean = false;
  

  constructor(
    private partyService: PartyService,
    private qualityService: QualityService,
    private toastrService: NbToastrService,
    private fabricService: FabricInService,
    private route: Router
  ) {}

  ngOnInit(): void {
    this.getPartyList();
    this.getQualityList();
  }

  qualityIdSelected(rowIndex) {
    let id = this.formValues.qualityListEmpty[rowIndex].qualityId;
    let item = this.formValues.qualityListEmpty[rowIndex];
    item.qualityName = this.qualityList[id - 1].qualityName;
    item.qualityType = this.qualityList[id - 1].qualityType;
    document.getElementById(this.index = "qualityList" + (rowIndex) + "-4").removeAttribute("disabled");
    document.getElementById(this.index = "qualityList" + (rowIndex) + "-5").removeAttribute("disabled");
  }

  //calculcte weight field from meter
  calculateWeight(rowIndex){
    //w = (m/100) * wt 
    let w;
    let id = this.formValues.qualityListEmpty[rowIndex].qualityId;
    let m = this.formValues.qualityListEmpty[rowIndex].meter;
    this.qualityList.forEach(function (quality) {
      if(quality.id == id){
        let wtPer100m = quality.wtPer100m;
        w = (m / 100) * wtPer100m;
      }
    });
    this.formValues.qualityListEmpty[rowIndex].weight = parseFloat(w).toFixed(2);
  }

  //calculcte meter field from weight
  calculateMeter(rowIndex){
    let m;
    let id = this.formValues.qualityListEmpty[rowIndex].qualityId;
    let w = this.formValues.qualityListEmpty[rowIndex].weight;
    this.qualityList.forEach(function (quality) {
      if(quality.id == id){
        let wtPer100m = quality.wtPer100m;
        m = (w * 100) / wtPer100m;
      }
    });
    this.formValues.qualityListEmpty[rowIndex].meter = parseFloat(m).toFixed(2);
  }

  //On enter pressed -> check empty field, add new row
  onKeyUp(e, rowIndex, colIndex, colName) {
    var keyCode = (e.keyCode ? e.keyCode : e.which);
    if (keyCode == 13){

      //toaster
      this.status = "danger"
      const config = {
      status: this.status,
      destroyByClick: this.destroyByClick,
      duration: this.duration,
      hasIcon: this.hasIcon,
      position: this.position,
      preventDuplicates: this.preventDuplicates,
    };

      this.index = "qualityList" + (rowIndex + 1) + "-" + colIndex;
      if (rowIndex === this.formValues.qualityListEmpty.length - 1) {
        let item = this.formValues.qualityListEmpty[rowIndex];
        if(colName == 'gr'){
          if (!item.gr) {
            this.toastrService.show(
              "Enter Gr",
              'Gr Field required',config);
            return;
          }
        }else if(colName == 'qualityId'){
          if (!item.qualityId) {
            this.toastrService.show(
              "Select Quality Id",
              'QualityId Field required',config);
            return;
          }
        }else if(colName == 'meter'){
          if (!item.meter) {
            this.toastrService.show(
              "Enter Meter",
              'Meter Field required',config);
            return;
          }
        }else if(colName == 'weight'){
          if (!item.weight) {
            this.toastrService.show(
                "Enter Weight",
                'Weight Field required',config);
            return;
          }
        }else if(colName == 'noOfBox'){
          if (!item.noOfBox) {
            this.toastrService.show(
                "Enter No. of Boxes",
                '"No. of Boxes Field required',config);
            return;
          }
        }else if(colName == 'noOfCones'){
          if (!item.noOfCones) {
            this.toastrService.show(
                "Enter No. of Cones/ Taka",
                'No. of Cones/ Taka Field required',config);
            return;
          }
        }   
        let obj = {
          id: null,
          gr: null,
          qualityId: null,
          qualityName: null,
          qualityType: null,
          meter: null,
          weight: null,
          noOfCones: null,
          noOfBox: null
        };
        let list = this.formValues.qualityListEmpty;
        list.push(obj);
        this.formValues.qualityListEmpty = [...list];
        let interval = setInterval(()=>{
          let field = document.getElementById(this.index)
          if(field != null){
            field.focus()
            clearInterval(interval)
          }
        }, 500)
      } else {
        alert("go to any last row input to add new row");
      }
    }
  }

  removeItem(id){
    let idCount = this.formValues.qualityListEmpty.length
    let item = this.formValues.qualityListEmpty;
    if(idCount == 1){
      item[0].gr = null;
      item[0].qualityId = null;
      item[0].qualityName = null;
      item[0].qualityType = null;
      item[0].meter = null;
      item[0].weight = null;
      item[0].noOfCones = null;
      item[0].noOfBox = null;
      let list = item;
      this.formValues.qualityListEmpty = [...list];
    }
    else{
      let removed = item.splice(id,1);
      let list = item;
      this.formValues.qualityListEmpty = [...list];
    }
 }

  onSubmit(myForm) {
    this.formSubmitted = true;
    console.log("not submitted")
    if(myForm.valid){
      this.fabricService.saveFabricIn(this.formValues).subscribe(
        data=>{
          //toaster
          this.status = "primary"
          const config = {
           status: this.status,
           destroyByClick: this.destroyByClick,
           duration: this.duration,
           hasIcon: this.hasIcon,
           position: this.position,
           preventDuplicates: this.preventDuplicates,
         };
         this.toastrService.show(
           "Fabric Added Succesfully",
           "Fabric",
           config);
           this.route.navigate(["/pages/fabric-in"]);
        },
        error=>{
          //toaster
          this.status = "danger"
          const config = {
          status: this.status,
          destroyByClick: this.destroyByClick,
          duration: this.duration,
          hasIcon: this.hasIcon,
          position: this.position,
          preventDuplicates: this.preventDuplicates,
          };
          this.toastrService.show(
          "No internet access or Server failure",
          "Fabrics",
          config);
        }
      )
    }
  }

  

  getPartyList() {
    this.partyService.getAllPartyList().subscribe(
      (data) => {
        if (data["data"] && data["data"].length > 0) {
          this.party = data["data"];
        } else {
           //toaster
           this.status = "danger"
           const config = {
            status: this.status,
            destroyByClick: this.destroyByClick,
            duration: this.duration,
            hasIcon: this.hasIcon,
            position: this.position,
            preventDuplicates: this.preventDuplicates,
          };
          this.toastrService.show(
            "No party added yet",
            "Fabric-in",
            config);
        }
      },
      (error) => {
        //toaster
        this.status = "danger"
        const config = {
         status: this.status,
         destroyByClick: this.destroyByClick,
         duration: this.duration,
         hasIcon: this.hasIcon,
         position: this.position,
         preventDuplicates: this.preventDuplicates,
       };
       this.toastrService.show(
         "No internet access or Server failuer",
         "Fabric-in",
         config);
      }
    );
  }

  getQualityList() {
    this.qualityService.getallQuality().subscribe(
      (data) => {
        if (data["data"] && data["data"].length > 0) {
          this.qualityList = data["data"];
        } else {
           //toaster
           this.status = "danger"
           const config = {
            status: this.status,
            destroyByClick: this.destroyByClick,
            duration: this.duration,
            hasIcon: this.hasIcon,
            position: this.position,
            preventDuplicates: this.preventDuplicates,
          };
          this.toastrService.show(
            "No quality added yet",
            "Fabric-in",
            config);
        }
      },
      (error) => {
           //toaster
           this.status = "danger"
           const config = {
            status: this.status,
            destroyByClick: this.destroyByClick,
            duration: this.duration,
            hasIcon: this.hasIcon,
            position: this.position,
            preventDuplicates: this.preventDuplicates,
          };
          this.toastrService.show(
            "No internet access or Server failuer",
            "Fabric-in",
            config);
      }
    );
  }
}
