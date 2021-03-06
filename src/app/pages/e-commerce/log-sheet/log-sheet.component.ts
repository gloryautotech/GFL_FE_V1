import { takeUntil } from 'rxjs/operators';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Boiler, DayBoilerValues, DayThermopackValues, NightBoilerValues, NightThermopackValues, Thermopack } from '../../../@theme/model/log-sheet';
import { LogSheetService } from '../../../@theme/services/log-sheet.service';
import { DatePipe } from '@angular/common';
import {ToastrService} from 'ngx-toastr';
import { Subject } from 'rxjs';

@Component({
  selector: 'ngx-log-sheet',
  templateUrl: './log-sheet.component.html',
  styleUrls: ['./log-sheet.component.scss']
})
export class LogSheetComponent implements OnInit, OnDestroy {

  master: any;
  boiler: any;
  thermopack: any;
  boilerId: any = 11626;
  thermoId: any = 11628;
  masterId: any = 19;


  Boilertime_00Array = [];
  Boilertime_02Array = [];
  Boilertime_04Array = [];
  Boilertime_06Array = [];
  Boilertime_08Array = [];
  Boilertime_10Array = [];
  Boilertime_12Array = [];
  Boilertime_14Array = [];
  Boilertime_16Array = [];
  Boilertime_18Array = [];
  Boilertime_20Array = [];
  Boilertime_22Array = [];

  Thermo_00Array = [];
  Thermo_02Array = [];
  Thermo_04Array = [];
  Thermo_06Array = [];
  Thermo_08Array = [];
  Thermo_10Array = [];
  Thermo_12Array = [];
  Thermo_14Array = [];
  Thermo_16Array = [];
  Thermo_18Array = [];
  Thermo_20Array = [];
  Thermo_22Array = [];

  shift = [
    { id: 1, name: 'Day' },
    { id: 2, name: 'Night' }
  ];

  dayFlag: boolean = true;
  nightFlag: boolean = false;

  selectedShift: any;
  selectedMaster: any;
  dateSelected: any;

  finalBoilerobj = [];
  finalThermoobj = [];


  dayArray = ["10:00", "12:00", "14:00", "16:00", "18:00", "20:00"];
  nightArray = ["22:00", "00:00", "02:00", "04:00", "06:00", "08:00"];

  boilerAttribute = ["Steam Pressure", "Drum Water Level", "Feed Pump (No.1/2)", "Flue Gas Temp (TE5-1)", "Bed Temperature (TE5-3)",
    "Draft Pressure (DT5-4)", "I.D.Fan (%)", "F.D.Fan DA-1", "F.D.Fan DA-2", "F.D.Fan DA-3",
    "Screw Feeder", "Water Meter", "Load (Final O/P)", "Jet Running"];

  thermopackAttribute = ["Forward Temperature", "Return Temperature", "Stack Temperature", "Furnace",
    "Pump (1/2)", "I.D.Fan (Hz)", "F.D.Fan (Hz)", "Screw Feeder (1/2)"];

  valueArray = [];
  valueArray1 = [];

  nightvalueArray = [];
  nightvalueArray1 = [];
  ss: any;
  arr = [];
  data: any;

  datePipeString: String;
  private destroy$ = new Subject<void>();

  constructor(private logsheet: LogSheetService, private datePipe: DatePipe,private toast:ToastrService) {
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();  
  }

  ngOnInit(): void {

    this.getMaster();
    this.getBoiler();
    this.getThermopack();
    for (let i = 0; i < this.boilerAttribute.length; i++) {
      this.valueArray.push(new DayBoilerValues());
      this.valueArray[i].Attribute = this.boilerAttribute[i];
      this.valueArray[i].time_10 = null;
      this.valueArray[i].time_12 = null;
      this.valueArray[i].time_12 = null;
      this.valueArray[i].time_14 = null;
      this.valueArray[i].time_16 = null;
      this.valueArray[i].time_18 = null;
      this.valueArray[i].time_20 = null;
    }

    for (let i = 0; i < this.thermopackAttribute.length; i++) {
      this.valueArray1.push(new DayThermopackValues())
      this.valueArray1[i].Attribute = this.thermopackAttribute[i];
      this.valueArray1[i].time_10 = null;
      this.valueArray1[i].time_12 = null;
      this.valueArray1[i].time_12 = null;
      this.valueArray1[i].time_14 = null;
      this.valueArray1[i].time_16 = null;
      this.valueArray1[i].time_18 = null;
      this.valueArray1[i].time_20 = null;
    }

    for (let i = 0; i < this.boilerAttribute.length; i++) {
      this.nightvalueArray.push(new NightBoilerValues());
      this.nightvalueArray[i].Attribute = this.boilerAttribute[i];
      this.nightvalueArray[i].time_22 = null;
      this.nightvalueArray[i].time_00 = null;
      this.nightvalueArray[i].time_02 = null;
      this.nightvalueArray[i].time_04 = null;
      this.nightvalueArray[i].time_06 = null;
      this.nightvalueArray[i].time_08 = null;
    }

    for (let i = 0; i < this.thermopackAttribute.length; i++) {
      this.nightvalueArray1.push(new NightThermopackValues())
      this.nightvalueArray1[i].Attribute = this.thermopackAttribute[i];
      this.nightvalueArray1[i].time_22 = null;
      this.nightvalueArray1[i].time_00 = null;
      this.nightvalueArray1[i].time_02 = null;
      this.nightvalueArray1[i].time_04 = null;
      this.nightvalueArray1[i].time_06 = null;
      this.nightvalueArray1[i].time_08 = null;
    }

  }

  submitday(value: any) {

    
    if(this.datePipeString == null){
      this.toast.error("Select Date")
    }
    else
    {
      this.valueArray.forEach(ele => {
        this.Boilertime_10Array.push(ele.time_10);
        this.Boilertime_12Array.push(ele.time_12);
        this.Boilertime_14Array.push(ele.time_14);
        this.Boilertime_16Array.push(ele.time_16);
        this.Boilertime_18Array.push(ele.time_18);
        this.Boilertime_20Array.push(ele.time_20);
  
      })
  
      this.boilerobjadd(this.Boilertime_10Array, "10:00:00");
      this.boilerobjadd(this.Boilertime_12Array, "12:00:00");
      this.boilerobjadd(this.Boilertime_14Array, "14:00:00");
      this.boilerobjadd(this.Boilertime_16Array, "16:00:00");
      this.boilerobjadd(this.Boilertime_18Array, "18:00:00");
      this.boilerobjadd(this.Boilertime_20Array, "20:00:00");
  
      this.valueArray1.forEach(ele => {
  
        this.Thermo_10Array.push(ele.time_10);
        this.Thermo_12Array.push(ele.time_12);
        this.Thermo_14Array.push(ele.time_14);
        this.Thermo_16Array.push(ele.time_16);
        this.Thermo_18Array.push(ele.time_18);
        this.Thermo_20Array.push(ele.time_20);
      })
  
      this.thermoobjadd(this.Thermo_10Array, "10:00:00");
      this.thermoobjadd(this.Thermo_12Array, "12:00:00");
      this.thermoobjadd(this.Thermo_14Array, "14:00:00");
      this.thermoobjadd(this.Thermo_16Array, "16:00:00");
      this.thermoobjadd(this.Thermo_18Array, "18:00:00");
      this.thermoobjadd(this.Thermo_20Array, "20:00:00");
  
      this.saveBoilerData();
      this.saveThermoData();
    }

  }

  saveBoilerData() {

    this.logsheet.saveBoilerData(this.finalBoilerobj).pipe(takeUntil(this.destroy$)).subscribe(
      (data) => {
        if(data["success"]){
          this.toast.success("Added")
        }
      }
    )
  }

  submitnight(value: any) {


    
    if(this.datePipeString == null){
      this.toast.error("Select Date")
    }
    else
    {
      this.nightvalueArray.forEach(ele => {
        this.Boilertime_22Array.push(ele.time_22);
        this.Boilertime_00Array.push(ele.time_00);
        this.Boilertime_02Array.push(ele.time_02);
        this.Boilertime_04Array.push(ele.time_04);
        this.Boilertime_06Array.push(ele.time_06);
        this.Boilertime_08Array.push(ele.time_08);
      })
  
      this.boilerobjadd(this.Boilertime_22Array, "22:00:00");
      this.boilerobjadd(this.Boilertime_00Array, "00:00:00");
      this.boilerobjadd(this.Boilertime_02Array, "02:00:00");
      this.boilerobjadd(this.Boilertime_04Array, "04:00:00");
      this.boilerobjadd(this.Boilertime_06Array, "06:00:00");
      this.boilerobjadd(this.Boilertime_08Array, "08:00:00");
  
  
      this.nightvalueArray1.forEach(ele => {
  
        this.Thermo_22Array.push(ele.time_22);
        this.Thermo_00Array.push(ele.time_00);
        this.Thermo_02Array.push(ele.time_02);
        this.Thermo_04Array.push(ele.time_04);
        this.Thermo_06Array.push(ele.time_06);
        this.Thermo_08Array.push(ele.time_08);
  
      })
  
      this.thermoobjadd(this.Thermo_22Array, "22:00:00");
      this.thermoobjadd(this.Thermo_00Array, "00:00:00");
      this.thermoobjadd(this.Thermo_02Array, "02:00:00");
      this.thermoobjadd(this.Thermo_04Array, "04:00:00");
      this.thermoobjadd(this.Thermo_06Array, "06:00:00");
      this.thermoobjadd(this.Thermo_08Array, "08:00:00");
  
      this.saveBoilerData();
      this.saveThermoData();
    }

  }

  saveThermoData() {

    this.logsheet.saveThermoData(this.finalThermoobj).pipe(takeUntil(this.destroy$)).subscribe(
      (data) => {
        if(data["success"]){
          this.toast.success("Added")
        }
      }
    )
  }

  boilerobjadd(array, time) {
    let boilerdata: Boiler = new Boiler();

    boilerdata.streamPressusre = array[0];
    boilerdata.drumWaterLevel = array[1];
    boilerdata.feedPump = array[2];
    boilerdata.flueGasTemp = array[3];
    boilerdata.bedTemp = array[4];
    boilerdata.draftPressure = array[5];
    boilerdata.idFan = array[6];
    boilerdata.daOne = array[7];
    boilerdata.daTwo = array[8];
    boilerdata.daThree = array[9];
    boilerdata.screwFeeder = array[10];
    boilerdata.waterMeter = array[11];
    boilerdata.loadData = array[12];
    boilerdata.userHeadId = this.masterId;
    boilerdata.controlId = this.boilerId;
    boilerdata.dateToEnter = this.datePipeString;
    boilerdata.timeOf = time;
    this.finalBoilerobj.push(boilerdata)
  }

  thermoobjadd(array, time) {
    let thermodata: Thermopack = new Thermopack();

    thermodata.forwardTemp = array[0];
    thermodata.returnTemp = array[1];
    thermodata.stackTemp = array[2];
    thermodata.furnaceTemp = array[3];
    thermodata.pumpData = array[4];
    thermodata.idFan = array[5];
    thermodata.fdFan = array[6];
    thermodata.screwFeeder = array[7];
    thermodata.dateToEnter = this.datePipeString;
    thermodata.userHeadId = this.masterId;
    thermodata.controlId = this.thermoId;
    thermodata.timeOf = time;
    this.finalThermoobj.push(thermodata)
  }

  shiftchange(value: any) {

    if (value == 1) {
      this.nightFlag = false;
      this.dayFlag = true;
    }
    else if (value == 2) {
      this.dayFlag = false;
      this.nightFlag = true;
    }
  }

  change(value: any) {

    this.datePipeString = this.datePipe.transform(value._selected, 'yyyy-MM-dd');

  }

  masterchange(value: any) {

    this.masterId = value;
  }

  getMaster() {
    this.data = this.logsheet.getAllMaster().pipe(takeUntil(this.destroy$)).subscribe(
      (res) => {
        this.master = res;
        this.master = this.master.data;
      }
    )
  }

  getBoiler() {
    this.data = this.logsheet.getBoilerMachines().pipe(takeUntil(this.destroy$)).subscribe(
      (res) => {
        this.boiler = res;
        this.boiler = this.boiler.data;
      }
    )
  }

  getThermopack() {
    this.data = this.logsheet.getThermopackMachines().pipe(takeUntil(this.destroy$)).subscribe(
      (res) => {
        this.thermopack = res;
        this.thermopack = this.thermopack.data;
      }
    )
  }

  boilerchange(value: any) {

    this.boilerId = value;
  }

  thermopackchange(value: any) {

    this.thermoId = value;

  }

}
