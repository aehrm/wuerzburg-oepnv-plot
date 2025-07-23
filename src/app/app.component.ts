import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";

@Component({
  selector: "app-root",
  imports: [RouterOutlet],
  template: `
    <h1 class="main-title-container">
      <span class="title-text">
        Würzburger ÖPNV Plot Generator
        <a href="https://github.com/aehrm/wuerzburg-oepnv-plot">
          <img
            class="gh-icon"
            src="https://github.githubassets.com/assets/GitHub-Mark-ea2971cee799.png"
          /> </a
      ></span>
      <img
        src="https://www.wvv.de/media-wvv/mobilitaet/bilder/bus-und-strassenbahn/bus-und-straba_landscape_16_9_2.jpg"
      />
    </h1>
    <main>
      <router-outlet />
    </main>
  `,
})
export class AppComponent {}
