import { Component, OnInit} from '@angular/core';
import { MenuController, ToastController, Platform, NavController } from '@ionic/angular';
import { ActivatedRoute,Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { HttpClient , HttpHeaders } from '@angular/common/http';
import { Storage } from '@ionic/storage';
import { Location } from '@angular/common';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@awesome-cordova-plugins/file-transfer/ngx'
import { File } from '@awesome-cordova-plugins/file/ngx';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.page.html',
  styleUrls: ['./inventory.page.scss'],
  standalone: false,
})
export class InventoryPage implements OnInit {
  userid:any;
  article:any;
  isLoading = false;
  masterid:any;
  company:any;
  statecode:any;
     url=environment.SERVER_URL;
    urlpdf="https://manage.ktl.in/api/download-pdf";
  
    
    constructor(
      public menuCtrl: MenuController,
      public loadingCtrl: LoadingController,
      private  http:HttpClient,
      private location: Location,
      public toastCtrl: ToastController,
      private platform: Platform,
       private router: Router,
       private route: ActivatedRoute,
       public str:Storage,
       
       private transfer: FileTransfer, 
       private file: File,
       private androidPermissions: AndroidPermissions) { 
     
  
        this.route.queryParams.subscribe(params => {
  
        if (params && params['special']) {
          let data = JSON.parse(params['special']);
          console.log("DetailsDescCheck");
          this.statecode = data.statecode;  // state code
           this.getArticle(data.statecode); 
  
         
        }
      });
  
  
     this.str.get('id').then((value) => { 
      
                    this.userid=value;
                     
                       this.callContact(value);
                  });
  
  
    }
  callContact(userid:any){
  
    let headers = new HttpHeaders(); 
        headers.append("Accept", 'application/json');
          headers.append('Content-Type', 'application/json' );
          let datap= { client_id: userid};
          
        this.http.post(this.url + 'get-callprofile' ,datap,{headers:headers}).subscribe((data:any)=>{
        //alert(JSON.stringify(data));
        if(data.status){
          this.company=data.company;
         
        this.masterid=data.masterid;
        }
      
        })
  }
  articles:any=[]; searchTerm:any="";
   getArticle(statecode:any){
  
     this.presentLoading();
        let headers = new HttpHeaders(); 
        headers.append("Accept", 'application/json');
          headers.append('Content-Type', 'application/json' );
          let datap= { branch: statecode};
        this.http.post(this.url +'get-emp-article',datap,{headers:headers}).subscribe((data:any)=>{
        console.log(data);
        this.dismiss();
          if(data.success){
          this.article=data.article;
          this.articles=data.article;
          }
          else{
          this.presentToast(data.message,4000,"bottom");
          }
        
        })
      
    }

  setFilterTown() {
    this.article = this.articles.filter((towns: any) => {
      return towns.article_name.toLowerCase().indexOf(this.searchTerm.toLowerCase()) > -1;
    });
  }

  downloadPDF(articleid:any){
    
      this.presentLoading();
        let headers = new HttpHeaders(); 
      headers.append("Accept", 'application/json');
        headers.append('Content-Type', 'application/json' );
       
      let datap= { client_id: this.userid,article_id:articleid,branch:this.statecode};
      console.log(datap);
      this.http.post(this.url +'get-emp-inventory',datap,{headers:headers}).subscribe((data:any)=>{
      console.log(data);
      this.dismiss();
      if(data.status)     {
        
          window.open(data.pdf, "_blank", "toolbar=1, scrollbars=1, resizable=1");
         }
      
    
      //this.statement=data.data;
          
      
    
      },(err)=>{
        alert(JSON.stringify(err));
      });
  }
    download(id:any) {
    this.androidPermissions.hasPermission(this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE)
      .then(status => {
        if (status.hasPermission) {
          this.downloadFile(id);
        } 
        else {
          this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE)
            .then(status => {
              if(status.hasPermission) {
                this.downloadFile(id);
              }
            });
        }
      });
  }
  downloadFile(id:any){
        const fileTransfer: FileTransferObject = this.transfer.create();
          //let datap= { client_id: this.userid,article_id:id};
          let filename=Math.floor(Math.random() * 10000); 
        const url = this.url + 'download-pdf/' + this.userid + '/' + id ;
          fileTransfer.download(url, this.file.externalRootDirectory + '/Download/'  + filename + '.pdf').then((entry) => {
          this.presentToast('download complete: ' + entry.toURL(),3000,"bottom");
              
          }, (error) => {
          this.presentToast('download error ',3000,"bottom");
          });
  
  }
   async  presentLoading() {
      this.isLoading = true;
          return await this.loadingCtrl.create({
         // duration: 5000,
      }).then(a => {
        a.present().then(() => {
          console.log('presented');
          if (!this.isLoading) {
            a.dismiss().then(() => console.log('abort presenting'));
          }
        });
      });
  
        //await loading.present();
  
      }
  async dismiss() {
      this.isLoading = false;
      return await this.loadingCtrl.dismiss().then(() => console.log('dismissed'));
    }
  
      presentToast(msg:any,durat:any,pos:any) {
        let toast = this.toastCtrl.create({
            message: msg,
            duration: durat,
            position:pos
          }).then((toastData)=>{
            console.log(toastData);
            toastData.present();
          });
      //await this.toastCtrl.create({ message:msg, duration:durat, position:pos }).present();
    }
    ngOnInit() {
  
  
  
    }
}
