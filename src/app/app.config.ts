import {ApplicationConfig, provideExperimentalZonelessChangeDetection} from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';
// import 'zone.js'

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [provideExperimentalZonelessChangeDetection(),
      provideRouter(routes, withHashLocation())]
};
