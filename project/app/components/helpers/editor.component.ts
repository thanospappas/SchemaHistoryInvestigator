/**
 * Created by thanosp on 6/7/2017.
 */
import {
    Component,
    AfterViewInit,
    EventEmitter,
    OnDestroy,
    Input,
    Output
} from '@angular/core';

import * as T from 'tinymce';
import {NewlinesFilter} from "../../shared/NewlinesFilter";
//import 'tinymce/themes/modern';

//import 'tinymce/plugins/table';
//import 'tinymce/plugins/link';

declare var tinymce: any;

@Component({
    selector: 'app-tiny-editor',
    template: `<textarea id="{{elementId}}"><p [innerHTML]="text | newLineFilter"></p>
        <p>{{getText()}}</p>
    </textarea>`
})
export class TinyEditorComponent implements AfterViewInit, OnDestroy {
    @Input() elementId: String;
    @Input() text: string;
    @Output() onEditorContentChange = new EventEmitter();

    editor;

    constructor(private newLineFilter:NewlinesFilter){
       // this.text = this.newLineFilter.transform(this.text);
    }
    getText(){
        return this.text.replace(/\\n/g,'<p></p>');
    }

    ngAfterViewInit() {
        console.log(this.text);
        tinymce.init({
            selector: '#' + this.elementId,
            plugins: ['link', 'table'],
            skin_url: 'assets/skins/lightgray',
            height : "350",
            setup: editor => {
                this.editor = editor;
                tinymce.activeEditor.setContent(this.newLineFilter.transform(this.text));

                editor.on('keyup change', () => {
                    const content = editor.getContent();
                    this.onEditorContentChange.emit(content);
                });
            }
        });
        this.text = this.text.replace(/\\n/g,'<p></p>');
    }

    ngOnDestroy() {
        tinymce.remove(this.editor);
    }
}