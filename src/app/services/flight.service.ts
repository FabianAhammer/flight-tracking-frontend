import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class FlightService {
  constructor(private httpClient: HttpClient) {
    this.getCurrentFlights();
  }

  currentFlights = new ReplaySubject<Array<TrackedFlight>>(1);

  async getCurrentFlights(): Promise<void> {
    this.httpClient
      .get(environment.clients.flights)
      .subscribe((apiResponse: FlightApiResponse) => {
        let mapped: Array<TrackedFlight> = [];
        apiResponse.states.forEach((e) => {
          // console.log(e);
          mapped.push({
            adsBCode: e[0],
            flightNumber: e[1],
            country: e[2],
            longitude: e[5] as number,
            latitude: e[6] as number,
            altitude: e[7] as number,
            track: e[10] as number,
          });
        });
        this.currentFlights.next(mapped);
      });
  }
}

export interface FlightApiResponse {
  real_time: number;
  time: number;
  states: Array<Array<any>>;
}
export interface TrackedFlight {
  adsBCode: string;
  flightNumber: string;
  country: string;
  longitude: number;
  latitude: number;
  altitude: number;
  track: number;
}
