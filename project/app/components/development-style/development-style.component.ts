/**
 * Created by thanosp on 17/4/2017.
 */
import { Component, OnInit, OnChanges, ViewChild, ElementRef, Input, ViewEncapsulation }  from '@angular/core';
import * as $ from 'jquery';
import {CochangedService} from '../../services/cochangedFiles.service';

@Component({
    selector: 'development-chart',
    //template: `<ng-content></ng-content>`,
    templateUrl: './development-style.html',
    //styleUrls: ['./change-breakdown.style.css'],
    providers: [CochangedService]
})

export class DevelopmentChart implements OnInit, OnChanges {

    private cochangedFiles:any;

    constructor(private coChangedFilesService:CochangedService){}

    ngOnInit(): void {
        this.setEventListeners();
        this.getCochangedFiles();
    }


    ngOnChanges(): void {
    }

    getCochangedFiles(){
        this.coChangedFilesService.getCochangedFiles()
            .subscribe(releases => {
                    this.cochangedFiles = releases;
                    console.log(this.cochangedFiles);
                },
                err => {
                    console.log(err);
                }
            );
    }

    setEventListeners(){
        $('.collapse-link-dev').on('click', function() {
            var $BOX_PANEL = $(this).closest('.x_panel'),
                $ICON = $(this).find('i'),
                $BOX_CONTENT = $BOX_PANEL.find('.x_content');

            // fix for some div with hardcoded fix class
            if ($BOX_PANEL.attr('style')) {
                $BOX_CONTENT.slideToggle(200, function(){
                    $BOX_PANEL.removeAttr('style');
                });
            } else {
                $BOX_CONTENT.slideToggle(200);
                $BOX_PANEL.css('height', 'auto');
            }

            $ICON.toggleClass('fa-chevron-up fa-chevron-down');
        });

        $('.close-link').click(function () {
            var $BOX_PANEL = $(this).closest('.x_panel');

            $BOX_PANEL.remove();
        });
    }

}