import { Component, OnInit } from "@angular/core";
import { FormGroup, FormControl } from "@angular/forms";
import { Validators } from "@angular/forms";
import { Location } from "@angular/common";
import { ActivatedRoute, Router } from "@angular/router";
import { CommonService } from "app/@theme/services/common.service";
import { PartyService } from "app/@theme/services/party.service";
import * as errorData from "app/@theme/json/error.json";
import { ToastrService } from "ngx-toastr";

@Component({
  selector: "ngx-add-edit-party",
  templateUrl: "./add-edit-party.component.html",
  styleUrls: ["./add-edit-party.component.scss"],
  providers: [Location],
})
export class AddEditPartyComponent implements OnInit {

  public loading = false;
  public errorData: any = (errorData as any).default;
  
  partyForm: FormGroup;

  //form Validation
  formSubmitted: boolean = false;

  //to Store UserID
  user: any;

  //To store the data of selected Party
  currentParty: any;

  //to store the id of selected party
  currentPartyId: any;

  master: [];

  creditor: boolean = false;
  debtor: boolean = false;
  userHead;
  constructor(
    private partyService: PartyService,
    private commonService: CommonService,
    private route: Router,
    private _route: ActivatedRoute,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.getData();
    this.getMaster();
    this.currentPartyId = this._route.snapshot.paramMap.get("id");
    if (this.currentPartyId != null)
      this.getUpdateData();

  }

  public getData() {
    this.loading = true;
    this.user = this.commonService.getUser();
    this.userHead = this.commonService.getUserHeadId();
    this.partyForm = new FormGroup({
      partyName: new FormControl(null, [
        Validators.pattern(/^[a-zA-Z ]*$/),
        Validators.required,
      ]),
      partyAddress1: new FormControl(null, Validators.required),
      partyAddress2: new FormControl(null),
      contactNo: new FormControl(null, [
        Validators.required,
        Validators.pattern(/^((\\+91-?)|0)?[0-9]{10}$/),
      ]),
      city: new FormControl(null, [
        Validators.pattern(/^[a-zA-Z ]*$/),
        Validators.required,
      ]),
      state: new FormControl(null, [
        Validators.pattern(/^[a-zA-Z ]*$/),
        Validators.required,
      ]),
      pincode: new FormControl(null, [
        Validators.pattern(/^[0-9]{6}$/),
        Validators.required,
      ]),
      gstin: new FormControl(null, Validators.required),
      mailId: new FormControl(null, [
        Validators.pattern(
          /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/
        ),
        Validators.required,
      ]),
      creditor: new FormControl(false, Validators.required),
      debtor: new FormControl(false, Validators.required),
      createdBy: new FormControl(null),
      updatedBy: new FormControl(null),
      userHeadId: new FormControl(null, Validators.required),
    });
    this.loading = false;
  }
  public getMaster() {
    this.loading = true;
    this.partyService.getAllMaster().subscribe(
      (data) => {
        if (data["success"]) {
          this.master = data["data"];
          this.loading = false;
        } else {
          this.toastr.error(data["msg"]);
          this.loading = false;
        }
      },
      (error) => {
        this.toastr.error(errorData.Serever_Error);
        this.loading = false;
      }
    );
  }

  public getUpdateData() {
    this.loading = true;
    this.partyService.getPartyDetailsById(this.currentPartyId).subscribe(
      (data) => {
       
        this.currentParty = data["data"];
        this.partyForm.patchValue({
          userHeadId: this.currentParty.userHeadId,
          partyName: this.currentParty.partyName,
          partyAddress1: this.currentParty.partyAddress1,
          partyAddress2: this.currentParty.partyAddress2,
          contactNo: this.currentParty.contactNo,
          city: this.currentParty.city,
          state: this.currentParty.state,
          pincode: this.currentParty.pincode,
          mailId: this.currentParty.mailId,
          gstin: this.currentParty.gstin,
          creditor: this.currentParty.creditor,
          debtor: this.currentParty.debtor,
          createdBy: this.currentParty.createdBy,
          updatedBy: this.currentParty.updatedBy,
          id: this.currentPartyId
        });
        this.creditor = this.partyForm.get("creditor").value;
        this.debtor = this.partyForm.get("debtor").value;
        this.loading = false;
      },
      (error) => {
        this.toastr.error(errorData.Serever_Error);
        this.loading = false;
      }
    );
  }

  public addParty() {
   
    this.formSubmitted = true;
    if (this.partyForm.valid) {
      if (this.creditor || this.debtor) {
        this.partyForm.value.createdBy = this.user.userId;
        this.partyService.saveParty(this.partyForm.value).subscribe(
          (data) => {
            if (data["success"]) {
              this.currentParty = data["data"];
              this.route.navigate(["pages/party"]);
              this.toastr.success(errorData.Add_Success);
              
            } else {
              this.toastr.error(errorData.Add_Error);
            }
          },
          (error) => {
            this.toastr.error(errorData.Serever_Error);
          }
        );
      } else {
        return;
      }
    }
  }

  public updateParty() {
    this.loading = true;
    this.formSubmitted = true;
    if (this.partyForm.valid) {
      if (this.creditor || this.debtor) {
        this.partyForm.value.updatedBy = this.user.userId;
        let body = {
          ...this.partyForm.value,
          id: this.currentPartyId,
        };

        this.partyService.updateParty(body).subscribe(
          (data) => {
            if (data["success"]) {
              this.toastr.success(errorData.Update_Success);
              this.route.navigate(["/pages/party"]);
              this.loading = false;
            } else {
              this.toastr.error(errorData.Update_Error);
              this.loading = false;
            }
          },
          (error) => {
            this.toastr.error(errorData.Update_Error);
            this.loading = false;
          }
        );
      }
    }
  }

  public goBackToPreviousPage(): any {
    this.route.navigate(["pages/party"]);
  }

  setCheckedStatusCreditor(checked) {
    this.creditor = checked;
    this.partyForm.patchValue({
      creditor: this.creditor,
    });
  }

  setCheckedStatusDebtor(checked) {
    this.debtor = checked;
    this.partyForm.patchValue({
      debtor: this.debtor,
    });
  }
}
