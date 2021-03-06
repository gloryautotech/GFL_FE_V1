import { HttpClient } from '@angular/common/http';
import { identifierName } from '@angular/compiler';
import { Injectable } from '@angular/core';
import { CommonService } from './common.service';

@Injectable({
  providedIn: 'root'
})
export class PurchaseNewService {

  constructor(
    private httpClient: HttpClient, 
    private commonService: CommonService
  ) { }

  addPurchase(data){
    return this.httpClient.post(this.commonService.envUrl() + 'api/purchase', data);

  }

  updatePurchase(data){
    return this.httpClient.put(this.commonService.envUrl() + 'api/purchase', data);

  }

  deletePurchase(id){
    return this.httpClient.delete(this.commonService.envUrl() + 'api/purchase/delete/'+ id);

  }


  getPurchase(){
    return this.httpClient.get(this.commonService.envUrl() + 'api/purchase/get');

  }

  getPurchaseById(id){
    return this.httpClient.get(this.commonService.envUrl() + 'api/purchase/get/'+id);

  }

  uploadImage(data):any{
    return this.httpClient.post('https://api.cloudinary.com/v1_1/dpemsdha5/image/upload', data);
  }

  updatePurchaseStatus(id , flag){
    return this.httpClient.get(this.commonService.envUrl() + 'api/purchase/update/' + id + '/' + flag);

  }

  updateStatus(flag){
    return this.httpClient.get(this.commonService.envUrl() + 'api/purchase/status?flag=' + flag);

  }

}
