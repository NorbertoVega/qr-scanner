import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IonBackButton } from '@ionic/angular';

declare var L: any;

@Component({
  selector: 'app-mapa',
  templateUrl: './mapa.page.html',
  styleUrls: ['./mapa.page.scss'],
})
export class MapaPage implements OnInit, AfterViewInit {

  lat: number = 0;
  lon: number = 0;
  @ViewChild(IonBackButton) map: any;

  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    let geo: any = this.route.snapshot.paramMap.get('geo');
    geo = geo.substring(4);
    geo = geo.split(',');

    this.lat = Number(geo[0]);
    this.lon = Number(geo[1]);
    console.log(this.lat);
    console.log(this.lon);

  }

  ngAfterViewInit(): void {
    var map = L.map('map').fitWorld();

    map.setView([this.lat, this.lon], 15);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(map);

    L.marker([this.lat, this.lon]).addTo(map)
      .bindPopup(`Lat: ${this.lat.toFixed(2)}, Lon: ${this.lon.toFixed(2)}`, { minWidth: 145 })
      .openPopup();

    window.dispatchEvent(new Event('resize'));
      
    
  }


}
