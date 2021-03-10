import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { CommonService } from "./common.service";

@Injectable({
  providedIn: "root",
})
export class AdminService {
  constructor(
    private httpClient: HttpClient,
    private commonService: CommonService
  ) {}

  getAllJetData() {
    return this.httpClient.get(
      this.commonService.envUrl() + "api/admin/get/allJet"
    );
  }

  getAllDesignation() {
    return this.httpClient.get(
      this.commonService.envUrl() + "api/user/designation"
    );
  }

  getAllCompanyData() {
    return this.httpClient.get(
      this.commonService.envUrl() + "api/admin/get/allCompany"
    );
  }
  getAllQualityData() {
    return this.httpClient.get(
      this.commonService.envUrl() + "api/quality/qualityName/get/all"
    );
  }

  getAllApproveByData() {
    return this.httpClient.get(
      this.commonService.envUrl() + "api/admin/get/approvedBy"
    );
  }

  getAllMachine() {
    return this.httpClient.get(this.commonService.envUrl() + "api/machine/all");
  }

  getAllMachineCategory() {
    return this.httpClient.get(
      this.commonService.envUrl() + "api/machine/allCategory"
    );
  }

  getAllDepartmentData() {
    return this.httpClient.get(
      this.commonService.envUrl() + "api/admin/get/department"
    );
  }

  saveMachine(data) {
    return this.httpClient.post(
      this.commonService.envUrl() + "api/machine",
      data
    );
  }

  saveMachineCategory(data) {
    return this.httpClient.post(
      this.commonService.envUrl() + "api/machine/addCategory",
      data
    );
  }

  addDepartment(data) {
    return this.httpClient.post(
      this.commonService.envUrl() + "api/admin/add/department/",
      data
    );
  }

  saveQuality(data) {
    return this.httpClient.post(
      this.commonService.envUrl() + "api/admin/quality/add/qualityName/",
      data
    );
  }
  saveJetData(jetData) {
    return this.httpClient.post(
      this.commonService.envUrl() + "api/admin/jet/addJet",
      jetData
    );
  }

  saveDesignationData(data) {
    return this.httpClient.post(
      this.commonService.envUrl() + "api/user/designation",
      data
    );
  }

  saveCompanyData(name) {
    return this.httpClient.post(
      this.commonService.envUrl() + "api/admin/add/company/",
      name
    );
  }

  saveApproveByData(data) {
    return this.httpClient.post(
      this.commonService.envUrl() + "api/admin/add/approvedBy/",
      data
    );
  }

  deleteJetById(id) {
    return this.httpClient.delete(
      this.commonService.envUrl() + "api/admin/delete/jet/" + id
    );
  }
  deleteQualityById(id) {
    return this.httpClient.delete(
      this.commonService.envUrl() + "api/admin/quality/delete/qualityName/" + id
    );
  }
  deleteDesignationById(id) {
    return this.httpClient.delete(
      this.commonService.envUrl() + "api/user/designation/" + id
    );
  }
  deleteCompanyById(id) {
    return this.httpClient.delete(
      this.commonService.envUrl() + "api/admin/delete/companyBy/" + id
    );
  }
  deleteApproveById(id) {
    return this.httpClient.delete(
      this.commonService.envUrl() + "api/admin/delete/approved/" + id
    );
  }

  deleteDepartmentById(id) {
    return this.httpClient.delete(
      this.commonService.envUrl() + "api/admin/delete/department/" + id
    );
  }

  deleteMachine(id) {
    return this.httpClient.delete(
      this.commonService.envUrl() + "api/machine/delete/" + id
    );
  }

  deleteMachineCategory(id) {
    return this.httpClient.delete(
      this.commonService.envUrl() + "api/machine/delete/category/" + id
    );
  }

  updateMachine(data) {
    return this.httpClient.put(
      this.commonService.envUrl() + "api/machine/update/",
      data
    );
  }

  updateMachineCategory(data) {
    return this.httpClient.put(
      this.commonService.envUrl() + "api/machine/update/category/",
      data
    );
  }

  updateJetData(data) {
    return this.httpClient.put(
      this.commonService.envUrl() + "api/admin/jet/updateJet",
      data
    );
  }
  updateQuality(data) {
    return this.httpClient.put(
      this.commonService.envUrl() + "api/admin/quality/update/qualityName/",
      data
    );
  }
  updateApproveByData(data) {
    return this.httpClient.put(
      this.commonService.envUrl() + "api/admin/update/approvedBy/",
      data
    );
  }
  updateCompanyData(data) {
    return this.httpClient.put(
      this.commonService.envUrl() + "api/admin/update/company/",
      data
    );
  }
  updateDepartmentData(data) {
    return this.httpClient.put(
      this.commonService.envUrl() + "api/admin/update/department/",
      data
    );
  }
  updateDesigntationData(data) {
    return this.httpClient.put(
      this.commonService.envUrl() + "api/user/update/designation/",
      data
    );
  }
}
