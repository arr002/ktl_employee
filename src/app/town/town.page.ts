import { Component, Input, OnInit } from '@angular/core';
import { ModalController, NavParams, ToastController, PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-town',
  templateUrl: './town.page.html',
  styleUrls: ['./town.page.scss'],
  standalone: false,
})
export class TownPage implements OnInit {
  @Input() title: string = ""
  items: any;
  @Input() itemss: [{ town: string }];
  public searchTerm = '';
  constructor(private popoverController: PopoverController, private navParams: NavParams,) {
    this.title = this.navParams.get('title') ? this.navParams.get('title'): "Town";
    this.items = this.navParams.get('items');
    this.itemss = this.items;
  }
  ngOnInit() {
    this.items = this.navParams.get('items');
    this.itemss = this.items;
  }
  setFilterTown() {
    this.itemss = this.items.filter((towns: any) => {
      return towns.town.toLowerCase().indexOf(this.searchTerm.toLowerCase()) > -1;
    });
  }
  selectItem(item: any) {
    this.popoverController.dismiss({
      'selectedItem': item?.town
    });
  }
}