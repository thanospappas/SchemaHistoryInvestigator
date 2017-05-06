/**
 * Created by thanosp on 6/5/2017.
 */

import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'fab-toggle',
    template: `
        <a
                href="#"
                class="fab-toggle"
                (click)="onClick.emit($event)">
      <span
              [class]="'icon-' + icon">
      </span>
            <ng-content></ng-content>
        </a>
    `
})
export class FabToggle {
    @Input() icon;
    @Output() onClick = new EventEmitter();
}
