import { Component, OnInit, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import * as errorData from "../../../@theme/json/error.json";
import { RegistrationService } from '../../../@theme/services/registration.service';

@Component({
  selector: 'ngx-scan-qr',
  templateUrl: './scan-qr.component.html',
  styleUrls: ['./scan-qr.component.scss']
})
export class ScanQRComponent implements OnInit {


  
  loading = false;
  formSubmitted = false;
  empId : any;
  constructor(
    private registrationService : RegistrationService,
   private renderer: Renderer2,
   private route: Router,
   private toastr: ToastrService,

  ) { }

  ngOnInit(): void {}

qrResultString: string;

clearResult(): void {
  this.qrResultString = null;
  
}

onCodeResult(resultString: string) {
  this.qrResultString = resultString;
  window.location.href = this.qrResultString;
}

onSave(){
  this.registrationService.empIdExistOrNot(this.empId).subscribe(
    (data) => {
      if(data["success"]){
        if(data["data"]){
          this.route.navigate(['/pages/attendance/',this.empId]);
        }
        else{
          this.toastr.error(data["msg"]);

        }
      }else{
        this.toastr.error(data["msg"]);

      }
    },
    (error)=>{
      
        this.toastr.error(errorData.Serever_Error);
     
    }
  )
}

}



