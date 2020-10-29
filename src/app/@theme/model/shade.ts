export class Shade {

   constructor(
       public partyShadeNo:String,
       public processName:String,
       public qualityId:String,
       public qualityName:String,
       public qualityType:String,
       public partyName:String,
       public colorTone:String,
       public labColorNo:String,
       public category:String,
       public remark:String,
       public createdBy:String,
       public cuttingId:Number,
       public partyId:Number,
       public processId:Number,
       public shadeDataList:[{
         amount:Number,
         concentration:Number,
         itemName:String,
         rate:Number,
         supplierName:String,
         //createdBy:String,
         supplierId:Number,
         supplierItemId:Number
        }],
        public userHeadId:Number
   ){}
  
      }