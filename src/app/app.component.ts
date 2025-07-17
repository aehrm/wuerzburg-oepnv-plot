import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: `
    <h1>Würzburger ÖPNV Plot Generator</h1>
    <router-outlet />
  `,
  styleUrl: './app.component.sass'
})
export class AppComponent {
  title = 'Würzburg ÖPNV Plots';
}
