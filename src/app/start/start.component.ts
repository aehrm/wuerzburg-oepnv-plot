import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-start',
  templateUrl: './start.component.html',
  //styleUrl: './app.component.less'
})
export class StartComponent {
    count = signal(0);

    increment() {
        this.count.update(cnt => ++cnt);
    }
}

