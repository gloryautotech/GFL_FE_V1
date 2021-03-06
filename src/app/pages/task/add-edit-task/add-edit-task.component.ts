import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Component, OnDestroy, OnInit } from "@angular/core";
import { NgxImageCompressService } from "ngx-image-compress";
import { RegistrationService } from "../../../@theme/services/registration.service";
import { AddTask, TaskImageList } from "../../../@theme/model/task";
import { AdminService } from "../../../@theme/services/admin.service";
import { TaskService } from "../../../@theme/services/task.service";
import { CommonService } from "../../../@theme/services/common.service";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { ToastrService } from "ngx-toastr";
import { DatePipe } from "@angular/common";

@Component({
  selector: "ngx-add-edit-task",
  templateUrl: "./add-edit-task.component.html",
  styleUrls: ["./add-edit-task.component.scss"],
})
export class AddEditTaskComponent implements OnInit, OnDestroy {

  taskTypeOnceFlag:boolean = false;
  minDate;
  dateForPicker = new Date();
  files: File[] = [];
  addTask: AddTask = new AddTask();
  taskImageListArray: TaskImageList[] = [];
  taskImageList: TaskImageList = new TaskImageList();
  departmentList: any[];
  userList: any[];
  reportList: any[] = [];
  typeList: any = [
    { name: "Once" },
    { name: "Daily" },
    { name: "Weekly" },
    { name: "Monthly" },
  ];
  imageUrl = "";
  imgResultBeforeCompress: string;
  imgResultAfterCompress: string;
  imageFile: File = null;
  fileToUpload: File = null;
  formSubmitted: boolean = false;
  datepipestring;

  public destroy$ : Subject<void> = new Subject<void>();
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  constructor(
    private adminService: AdminService,
    private taskService: TaskService,
    private imageCompress: NgxImageCompressService,
    private registrationService: RegistrationService,
    private commonService: CommonService,
    private activeModel: NgbActiveModal,
    private toastrService: ToastrService

  ) {
    this.taskImageListArray.push(this.taskImageList);
    this.addTask.taskImageList = this.taskImageListArray;
    this.addTask.startDate = new Date();
  }

  ngOnInit(): void {
    this.addTask.startDate = this.dateForPicker;
    this.minDate = new Date(
      this.dateForPicker.getFullYear(),
      this.dateForPicker.getMonth(),
      this.dateForPicker.getDate() - 1,
      23,
      59
    );
    this.getDeviceList();
    this.getReportList();
  }

  compressFile(): any {
    this.imageCompress
      .compressFile(this.imageUrl, -1, 50, 50)
      .then((result) => {
        this.imgResultAfterCompress = result;

        const imageBlob = this.dataURItoBlob(
          this.imgResultAfterCompress.split(",")[1]
        );

        this.imageFile = new File([result], this.fileToUpload.name, {
          type: "image/jpeg",
        });
        //return imageFile;
        this.fileUpload();
      });
  }

  fileUpload() {
    // this.loading = true;
    // this.imageFile =  this.compressFile();
    if (this.imageFile) {
      this.fileToUpload = this.imageFile;
      const data = new FormData();
      data.append("file", this.fileToUpload);
      data.append("upload_preset", "gfl_upload");
      data.append("cloud_name", "dpemsdha5");
      this.registrationService.uploadImage(data).pipe(takeUntil(this.destroy$)).subscribe((response) => {
        if (response) {
          let obj = {
            id: null,
            type: null, //this.fileToUpload.name,
            // type: this.docType,
            url: response.secure_url,
            controlId: null,
          };
          this.taskImageListArray.push(obj);
          //this.imgLoading = false;
        }
      });
    }

    // this.loading = false;
  }

  dataURItoBlob(dataURI) {
    const byteString = window.atob(dataURI);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const int8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
      int8Array[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([int8Array], { type: "image/jpeg" });
    return blob;
  }

  onSelect(event) {
    this.files.push(...event.addedFiles);
    this.uploadFileOnServer();
  }

  uploadFileOnServer() {
    this.files.forEach((element) => {
      this.fileToUpload = element;
      const reader = new FileReader();
      reader.onload = () => {
        this.imageUrl = reader.result as string;
        this.compressFile();
      };
      reader.readAsDataURL(this.fileToUpload);
    });
  }
  onRemove(event) {
    this.files.splice(this.files.indexOf(event), 1);
  }
  setPriority(value: string) {
    switch (value) {
      case "p1":
        this.addTask.taskPriority = "p1";
        break;
      case "p2":
        this.addTask.taskPriority = "p2";
        break;
      case "p3":
        this.addTask.taskPriority = "p3";
        break;
      case "p4":
        this.addTask.taskPriority = "p4";
        break;
    }
  }
  getDeviceList() {
    this.adminService.getAllDepartmentData().pipe(takeUntil(this.destroy$)).subscribe((data) => {
      this.departmentList = data["data"];
    });
  }

  getReportList() {
    this.taskService.getReportList().pipe(takeUntil(this.destroy$)).subscribe((data) => {
      this.reportList = data["data"];
    });
  }
  getUserList(event) {
    this.taskService.getUserList(event).pipe(takeUntil(this.destroy$)).subscribe(
      (data) => {
        this.userList = data["data"];
      },
      (error) => {}
    );
  }

  closeAddTask() {
    this.activeModel.close();
  }

  addTaskDetail(taskForm) {
    this.formSubmitted = true;
    if (taskForm.valid) {
      this.uploadFileOnServer();
      //splice null value from taskImageListrray
      this.addTask.taskImageList.splice(0, 1);
      this.addTask.createdBy = this.commonService.getUser().userId;

      if(this.addTask.taskType == "Once"){
        this.addTask.endDate = this.addTask.startDate;
      }

      this.taskService.addTask(this.addTask).pipe(takeUntil(this.destroy$)).subscribe(
        (data) => {
          this.toastrService.success("Task added successfully");
          this.activeModel.close(true);
        },
        (error) => {}
      );
    } else {
      return;
    }
  }

  taskTypeChanged(value){

    if(value == "Once"){
      this.taskTypeOnceFlag = true;
    }
    else{
      this.taskTypeOnceFlag = false;
    }

  }
}
