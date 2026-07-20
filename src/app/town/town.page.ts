import { Component, Input, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';

@Component({
  selector: 'app-town',
  templateUrl: './town.page.html',
  styleUrls: ['./town.page.scss'],
  standalone: false,
})
export class TownPage implements OnInit {
  @Input() title: string = 'Select Town';
  items: any[] = [];
  itemss: any[] = [];
  public searchTerm = '';

  constructor(private modalController: ModalController, private navParams: NavParams) {
    this.title = this.navParams.get('title') || 'Select Town';
    this.items = this.navParams.get('items') || [];
    this.itemss = [...this.items];
  }

  ngOnInit() {
    this.items = this.navParams.get('items') || [];
    this.itemss = [...this.items];
  }

  setFilterTown() {
    const term = (this.searchTerm || '').toLowerCase();
    this.itemss = this.items.filter((towns: any) => {
      const name = (towns.town || towns.name || '').toLowerCase();
      return name.indexOf(term) > -1;
    });
  }

  close() {
    this.modalController.dismiss();
  }

  selectItem(item: any) {
    const selected = item?.town || item?.name;
    this.modalController.dismiss({ selectedItem: selected });
  }
}
