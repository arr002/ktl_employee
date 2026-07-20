import { Component, Input, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';

@Component({
  selector: 'app-customer',
  templateUrl: './customer.page.html',
  styleUrls: ['./customer.page.scss'],
  standalone: false,
})
export class CustomerPage implements OnInit {
  @Input() title: string = 'Select Customer';
  items: any[] = [];
  itemss: any[] = [];
  public searchTerm = '';

  constructor(private modalController: ModalController, private navParams: NavParams) {
    this.title = this.navParams.get('title') || 'Select Customer';
    this.items = this.navParams.get('items') || [];
    this.itemss = [...this.items];
  }

  ngOnInit() {
    this.items = this.navParams.get('items') || [];
    this.itemss = [...this.items];
  }

  setFilterCustomer() {
    const term = (this.searchTerm || '').toLowerCase();
    this.itemss = this.items.filter((row: any) => {
      return (row.client_name || '').toLowerCase().indexOf(term) > -1;
    });
  }

  close() {
    this.modalController.dismiss();
  }

  selectItem(item: any) {
    this.modalController.dismiss({
      client_name: item?.client_name,
      id: item?.id
    });
  }
}
