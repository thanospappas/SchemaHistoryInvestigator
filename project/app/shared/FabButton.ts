/**
 * Created by thanosp on 6/5/2017.
 */

import {
    Component,
    Input,
    Output,
    EventEmitter,
    ViewChild
} from '@angular/core';

@Component({
    selector: 'fab-button',
    template: `
        <a
                #anchor
                href="#"
                class="fab-item"
                (click)="onClick.emit($event)">
      <span
              [class]="'icon-' + icon">
      </span>
            <ng-content></ng-content>
        </a>
    `
})
export class FabButton {
    @Input() icon;
    @Output() onClick = new EventEmitter();
    @ViewChild('anchor') element;
}
