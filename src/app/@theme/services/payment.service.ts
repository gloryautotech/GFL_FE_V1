import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CommonService } from './common.service';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  constructor(
    private httpClient: HttpClient,
    private commonService: CommonService

  ) { }

  
getAllAdvancePaymentBanks(){
  return this.httpClient.get(this.commonService.envUrl() + "api/paymentTerm/advancePayment/getAllBank");
}
  
getAllBillBank(){
  return this.httpClient.get(this.commonService.envUrl() + "api/paymentTerm/getAllBank");
}

getPendingBillByPartyId(partyId){
  return this.httpClient.get(this.commonService.envUrl() + "api/paymentTerm/getPendingBillByPartyId/"+partyId);
}

getAdvancePayment(partyId){
  return this.httpClient.get(this.commonService.envUrl() + "api/paymentTerm/getAdvancePayment/"+partyId);
}

addAdvancePayment(paymentData){
  return this.httpClient.post(this.commonService.envUrl() + "api/paymentTerm/addAdvancePayment",paymentData);
}

getAllPaymentType(){
  return this.httpClient.get(this.commonService.envUrl() + "api/paymentTerm/getAllPaymentType");
}


getPaymentDetailById(partyId){
  return this.httpClient.get(this.commonService.envUrl() + "api/paymentTerm/getPaymentDetailById/"+partyId);

}
savePayment(paymentData){
  return this.httpClient.post(this.commonService.envUrl() + "api/paymentTerm/",paymentData);

}

getAllPayment(){
  return this.httpClient.get(this.commonService.envUrl() + "api/paymentTerm/getAllPayment");
}
}
