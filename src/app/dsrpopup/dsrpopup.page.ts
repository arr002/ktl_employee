import { Component, OnInit, Input } from '@angular/core';
import { ModalController ,NavParams,ToastController} from '@ionic/angular';

@Component({
  selector: 'app-dsrpopup',
  templateUrl: './dsrpopup.page.html',
  styleUrls: ['./dsrpopup.page.scss'],
  standalone: false,
})
export class DsrpopupPage implements OnInit {
  zip:any='';
  thread:any='';
  paymentcollected:any='';
  currentissue:any='';
  remarks:any;
  clientname :any;
  mode:any;
  tadatype:any;
  id:any;
  activity:any;
  constructor(
private modalController: ModalController,
private navParams:NavParams,
 public toastCtrl: ToastController,
    ) { 
    this.mode=this.navParams.get('mode');
    this.activity=this.navParams.get('activity');
   
    if(this.mode=='add'){
    this.clientname = this.navParams.get('value');
    this.id=this.navParams.get('id');
    }
    else{
      let data=this.navParams.get('data');
      this.id=this.navParams.get('id');
      this.activity=this.navParams.get('activity');
      this.zip=data.zip;
      this.thread=data.thread
      this.paymentcollected=data.collection;
      this.currentissue=data.issue;
      this.remarks=data.remarks;;
      this.clientname=data.clientname;;
  
    }
  }


getSealStatus(){
  
}
  ngOnInit() {
  }

  close() {
    this.modalController.dismiss();
  }

 presentToast(msg: any, durat: any, pos: any) {
    let toast = this.toastCtrl.create({
      message: msg,
      duration: durat,
      position: pos
    }).then((toastData) => {
      console.log(toastData);
      toastData.present();
    });
    //await this.toastCtrl.create({ message:msg, duration:durat, position:pos }).present();
  }

 async closeModel() {


  if(this.zip.toString()==''){
     this.presentToast("Please enter zip quantity", 4000, "bottom");
          return;
      
  }

  if(this.thread.toString()==''){
  
     this.presentToast("Please enter thread quantity", 4000, "bottom");
          return;
      
  }

  if(this.paymentcollected.toString()==''){
     this.presentToast("Please enter payment collected ", 4000, "bottom");
          return;
      
  }

  if(this.currentissue=='' || this.currentissue==null){
     this.presentToast("Please select current issue ", 4000, "bottom");
          return;
      
  }

    let data={zip:this.zip,thread:this.thread,collection:this.paymentcollected,issue:this.currentissue,remarks:this.remarks,clientname:this.clientname,id:this.id,activity:this.activity}
    await this.modalController.dismiss(data);
  }


}
