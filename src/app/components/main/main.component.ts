import { Component, OnInit } from '@angular/core';
import * as Cesium from 'cesium';
import * as uuid from 'uuid';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
})
export class MainComponent implements OnInit {
  public viewer: Cesium.Viewer = null;
  public provider = null;

  public planes: Array<Cesium.Entity> = [];

  constructor() {}

  ngOnInit(): void {
    this.viewer = new Cesium.Viewer('map', {
      contextOptions: {
        requestWebgl2: true,
      },
      msaaSamples: 8,
      infoBox: false,
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

    this.addPlane();
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
}
