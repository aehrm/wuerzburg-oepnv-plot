import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: `
    <h1 class="main-title-container">
      <span class="title-text">Würzburger ÖPNV Plot Generator</span>
      <img src="https://www.wvv.de/media-wvv/mobilitaet/bilder/bus-und-strassenbahn/bus-und-straba_landscape_16_9_2.jpg">
    </h1>
    <main>
      <router-outlet />
    </main>
  `,
})
export class AppComponent {
}
