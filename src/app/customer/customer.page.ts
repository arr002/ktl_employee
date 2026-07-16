import { Component, Input, OnInit } from '@angular/core';
import { ModalController ,NavParams,ToastController,PopoverController} from '@ionic/angular';

@Component({
  selector: 'app-customer',
  templateUrl: './customer.page.html',
  styleUrls: ['./customer.page.scss'],
  standalone: false,
})
export class CustomerPage implements OnInit {

  @Input() title: string = ""
  items: any;
  // @Input() itemss: { town: string }[] | null = null;
  @Input() itemss: { town: string; client_name: string }[] | null = null;

  public searchTerm = '';
  constructor(private popoverController: PopoverController,private navParams:NavParams,) {
    console.log(this.navParams.get('items'));
    this.items=this.navParams.get('items');
    this.itemss=this.items;
   }

  ngOnInit() {
    this.items=this.navParams.get('items');
    this.itemss=this.items;
  }
  setFilterCustomer(){
 
     this.itemss = this.items.filter((towns:any) => {
      console.log(towns);
      return towns.client_name.toLowerCase().indexOf(this.searchTerm.toLowerCase()) > -1;
    });
  }
  selectItem(item:any) {
    this.popoverController.dismiss({
      'client_name': item?.client_name,
      'id':item?.id
    });
  }

}
