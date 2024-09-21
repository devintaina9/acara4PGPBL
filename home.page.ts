import { Component, OnInit } from '@angular/core';
import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import { Geolocation } from '@capacitor/geolocation';
import Graphic from '@arcgis/core/Graphic';
import Point from '@arcgis/core/geometry/Point'; 
import SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol';
import ImageryLayer from '@arcgis/core/layers/ImageryLayer';
import PictureMarkerSymbol from '@arcgis/core/symbols/PictureMarkerSymbol';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  mapView: MapView | any;
  userLocationGraphic: Graphic | any;

  public basemapOptions: string[] = ['topo-vector', 'satellite', 'streets', 'dark-gray', 'hybrid'];
  public selectedBasemap: string = 'topo-vector';
  public latitude: number | any;
  public longitude: number | any;

  constructor() { }

  async ngOnInit() {
    const position = await Geolocation.getCurrentPosition();
    this.latitude = position.coords.latitude;
    this.longitude = position.coords.longitude;

    const map = new Map({
      basemap: this.selectedBasemap
    });

    this.mapView = new MapView({
      container: 'container',
      map: map,
      center: [this.longitude, this.latitude],
      zoom: 10
    });

    const weatherServiceFL = new ImageryLayer({ url: WeatherServiceUrl });
    map.add(weatherServiceFL);

    weatherServiceFL.when(() => {
      console.log("Weather layer loaded.");
      this.displayWeatherCoverage(weatherServiceFL);
    });

    await this.updateUserLocationOnMap();
    this.mapView.center = this.userLocationGraphic.geometry as Point;
    setInterval(this.updateUserLocationOnMap.bind(this), 10000);
  }

  async getLocationService(): Promise<number[]> {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition((resp) => {
        resolve([resp.coords.latitude, resp.coords.longitude]);
      });
    });
  }

  async updateUserLocationOnMap() {
    let latLng = await this.getLocationService();
    let geom = new Point({ latitude: latLng[0], longitude: latLng[1] });

    const markerSymbol = new PictureMarkerSymbol({
      url: 'assets/icon/markerr.png',
      width: '24px',
      height: '24px',
    });

    if (this.userLocationGraphic) {
      this.userLocationGraphic.geometry = geom;
    } else {
      this.userLocationGraphic = new Graphic({
        symbol: new SimpleMarkerSymbol(),
        geometry: geom,
      });
      this.mapView.graphics.add(this.userLocationGraphic);
    }
  }

  // Display weather coverage coordinates (centroids or boundaries)
  displayWeatherCoverage(weatherLayer: ImageryLayer) {
    const extent = weatherLayer.fullExtent;
    if (extent) {
      const coordinates = [
        { longitude: extent.xmin, latitude: extent.ymin },
        { longitude: extent.xmax, latitude: extent.ymax },
      ];

      coordinates.forEach(coord => {
        console.log(`Weather coverage: Longitude: ${coord.longitude}, Latitude: ${coord.latitude}`);

        const point = new Point({
          longitude: coord.longitude,
          latitude: coord.latitude
        });

        const markerSymbol = new SimpleMarkerSymbol({
          color: 'blue',
          size: '12px',
          outline: {
            color: 'white',
            width: 1,
          }
        });

        const pointGraphic = new Graphic({
          geometry: point,
          symbol: markerSymbol,
        });

        this.mapView.graphics.add(pointGraphic);
      });
    } else {
      console.log("Weather layer does not have an extent.");
    }
  }

  public changeBasemap(basemap: string) {
    if (this.mapView) {
      this.mapView.map.basemap = basemap;
    }
  }
}

const WeatherServiceUrl = 'https://mapservices.weather.noaa.gov/eventdriven/rest/services/radar/radar_base_reflectivity_time/ImageServer';


//   public async ngOnInit() {
//     // List of coordinates
//     const coordinates = [
//       { longitude: 110.9130948506578, latitude: -7.098073993767088 },
//       { longitude: 110.88418398501595, latitude: -7.0724066238202585 },
//       { longitude: 110.79587925556409, latitude: -7.271184476334684 },
//       { longitude: 111.11999495346107, latitude: -7.302534448278316 },
//       { longitude: 110.85360053388199, latitude: -7.2620313089395365 },
//       { longitude: 110.39801616925287, latitude: -7.252784830423183 },
//       { longitude: 111.70838759635288, latitude:  -7.250759029024527 },
//       { longitude: 111.5472806569483, latitude: -7.186050313661839 },
//       { longitude: 111.39280335381265, latitude:  -7.09698243256474 },
//       { longitude: 110.84424673632934, latitude: -7.005941160865995 }
//     ];

//     const position = await Geolocation.getCurrentPosition();
//     //this.latitude = position.coords.latitude;
//     //this.longitude = position.coords.longitude;

//     const map = new Map({
//       basemap: 'topo-vector',
//     });

//     const view = new MapView({
//       container: 'container',
//       map: map,
//       zoom: 12,
//       center: [coordinates[0].longitude, coordinates[0].latitude], // Center the map at the first point
//     });

//     // Iterate through the coordinates and add markers
//     coordinates.forEach(coord => {
//       const point = new Point({
//         longitude: coord.longitude,
//         latitude: coord.latitude,
//       });

//       // Create a symbol for the marker
//       const markerSymbol = {
//         type: 'simple-marker',
//         color: 'red',
//         size: '18px',
//         outline: {
//           color: 'white',
//           width: 1,
//         },
//       };

//       // Create a graphic and add the point and symbol to it
//       const pointGraphic = new Graphic({
//         geometry: point,
//         symbol: markerSymbol,
//       });

//       // Add the graphic to the view
//       view.graphics.add(pointGraphic);
//     });
//   }
// }





