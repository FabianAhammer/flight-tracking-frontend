import { Component, OnInit } from '@angular/core';
import * as Cesium from 'cesium';
import { FlightService, TrackedFlight } from 'src/app/services/flight.service';
import * as uuid from 'uuid';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
})
export class MainComponent implements OnInit {
  public viewer: Cesium.Viewer = null;
  public provider = null;

  private uri = 'assets/plane-models/a319.glb';

  public planes: Array<Cesium.Entity> = [];

  constructor(private flightService: FlightService) {
    this.flightService.currentFlights.subscribe((e) => {
      if (e.length > 0) {
        this.addCollection(e.filter((e) => e.latitude && e.longitude));
        // e.forEach((flight, i) => {
        //   if (!flight.longitude || !flight.latitude || i > 10) {
        //     return;
        //   }
        //   this.addPlane(
        //     flight.longitude,
        //     flight.latitude,
        //     flight.altitude,
        //     flight.track,
        //     flight.flightNumber
        //   );
        // });
      }
    });
  }

  ngOnInit(): void {
    this.viewer = new Cesium.Viewer('map', {
      contextOptions: {
        requestWebgl2: true,
      },
      msaaSamples: 8,
      infoBox: false,
      requestRenderMode: true,
      scene3DOnly: true,
      fullscreenButton: false,
      baseLayerPicker: false,
      homeButton: false,
      sceneMode: Cesium.SceneMode.SCENE3D,
      navigationHelpButton: false,
      timeline: false,
      skyBox: false,
      imageryProvider: this.osmProvider(),
      animation: true,
    });
  }

  /**
   * Creates an OpenStreetMap imagery provider.
   * @returns Imagery Provider Instance for OpenStreetMap
   */
  private osmProvider(): Cesium.ImageryProvider {
    // create openstreet map imagery provider
    const provider = new Cesium.OpenStreetMapImageryProvider({
      url: 'https://a.tile.osm.org/',
      credit: '© OpenStreetMap contributors',
    });

    /**
     * https://sandcastle.cesium.com/?src=Imagery%20Adjustment.html&label=All
     */
    // provider.defaultSaturation = 0;
    // provider.defaultBrightness = 0.52;
    // provider.defaultGamma = 0.48;
    // provider.defaultContrast = 1.2;
    // provider.defaultHue = 0;

    provider.defaultSaturation = 0;
    provider.defaultBrightness = 0.52;
    provider.defaultGamma = 0.48;
    provider.defaultContrast = 1.2;
    provider.defaultHue = 0;
    this.provider = provider;
    return provider;
  }

  private addPlane(
    longitude: number = -123.0744619,
    latitude: number = 44.0503706,
    alitude: number = 5000,
    heading: number = 0,
    flightNumber: string = 'Test'
  ): Array<string> {
    const position = Cesium.Cartesian3.fromDegrees(
      longitude,
      latitude,
      alitude
    );
    const calcHeading = Cesium.Math.toRadians(heading);
    const pitch = 0;
    const roll = 0;
    const hpr = new Cesium.HeadingPitchRoll(calcHeading, pitch, roll);
    const orientation = Cesium.Transforms.headingPitchRollQuaternion(
      position,
      hpr
    );
    const first = uuid.v4();
    const second = uuid.v4();

    this.viewer.entities.add({
      id: first,
      name: flightNumber,
      position,
      orientation: new Cesium.ConstantProperty(orientation),
      model: {
        uri: 'assets/plane-models/a319.glb',
        minimumPixelSize: 40,
        maximumScale: 10000,
        runAnimations: false,
        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 6e6),
      },
    });
    this.viewer.entities.add({
      id: second,
      name: flightNumber,
      position,
      orientation: new Cesium.ConstantProperty(orientation),

      model: {
        uri: 'assets/plane-models/a319.glb',
        minimumPixelSize: 40,
        maximumScale: 10000,
        runAnimations: true,
        color: Cesium.Color.YELLOW,
        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
          6e6,
          Number.MAX_VALUE
        ),
      },
    });
    return [first, second];
  }

  private addCollection(flights: Array<TrackedFlight>) {
    var instances = [];
    flights.forEach((flight) => {
      const position = Cesium.Cartesian3.fromDegrees(
        flight.longitude,
        flight.latitude,
        flight.altitude
      );
      const scale = 100;
      const modelMatrix = Cesium.Transforms.headingPitchRollToFixedFrame(
        position,
        new Cesium.HeadingPitchRoll(flight.track, 0, 0)
      );
      Cesium.Matrix4.multiplyByUniformScale(modelMatrix, scale, modelMatrix);

      instances.push({
        modelMatrix: modelMatrix,
        color: Cesium.Color.YELLOW,
      });
    });

    return this.viewer.scene.primitives.add(
      //@ts-ignore
      new Cesium.ModelInstanceCollection({
        url: this.uri,
        instances: instances,
      })
    );
  }
}
