import { Component } from '@angular/core';
import * as $ from 'jquery';

@Component({
  selector: 'side-bar',  // <home></home>
  // We need to tell Angular's Dependency Injection which providers are in our app.
  providers: [
  ],
  // Our list of styles in our component. We may add more to compose many styles together
  //styleUrls: [ '../app.style.css' ],
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: './sidebar.component.html'
})

export class Sidebar {
    // TypeScript public modifiers
    private $BODY;
    private $MENU_TOGGLE;
    private $SIDEBAR_MENU;
    private $SIDEBAR_FOOTER;
    private $LEFT_COL;
    private $RIGHT_COL;
    private $NAV_MENU;
    private $FOOTER;

    constructor() {

    }

    ngAfterViewInit(): void {
       // this.initMenuListeners();
    }

    anchorClicked(event: MouseEvent){
        var target = event.srcElement.id;

        var $li = $('#' + target.replace("chevron","li")).parent(); 

        if ($li.is('.active')) {
            $li.removeClass('active active-sm');
                $('ul:first', $li).slideUp(function() {
                    //this.setContentHeight();
                });
            } else {
                // prevent closing menu if we are on child menu
                if (!$li.parent().is('.child_menu')) {
                    $('#sidebar-menu').find('li').removeClass('active active-sm');
                    $('#sidebar-menu').find('li ul').slideUp();
                }
                
                $li.addClass('active');

                $('ul:first', $li).slideDown(function() {
                    //this.setContentHeight();
                });
            }


    }

    initMenuListeners() {

        this.$BODY = $('body');
        this.$MENU_TOGGLE = $('#menu_toggle');
        this.$SIDEBAR_MENU = $('#sidebar-menu');
        this.$SIDEBAR_FOOTER = $('.sidebar-footer');
        this.$LEFT_COL = $('.left_col');
        this.$RIGHT_COL = $('.right_col');
        this.$NAV_MENU = $('.nav_menu');
        this.$FOOTER = $('footer');

        var $a = this.$SIDEBAR_MENU.find('a');
        this.$SIDEBAR_MENU.find('a').on('click', function(ev) {
            var $li = $(this).parent();
            var $currentli = $('#sidebar-menu').find('li.active-sm');
            $currentli.removeClass('active active-sm');
             $li.addClass('active active-sm');

            //$('.right_col').find('.sidebar-tab-pane').removeClass('active');
            //var $selectedTab = $('.right_col').find(ev.currentTarget.attributes.href.nodeValue);

            //$selectedTab.addClass('active');

            $('.right_col').find('.sidebar-tab-pane').fadeOut(400, function () {
                $('.right_col').find('.sidebar-tab-pane').delay().removeClass('active');
            });

            var $selectedTab = $('.right_col').find(ev.currentTarget.attributes.href.nodeValue);
            //$selectedTab.addClass('active');
            $selectedTab.delay(400).fadeIn(400, function () {
                $selectedTab.addClass('active');
            });



        });

        this.setContentHeight();
    }   

    ngOnInit() {
        this.initMenuListeners();
    }

    setContentHeight() {
        // reset height
        this.$RIGHT_COL.css('min-height', $(window).height());

        var bodyHeight = this.$BODY.outerHeight(),
            footerHeight = this.$BODY.hasClass('footer_fixed') ? -10 : this.$FOOTER.height(),
            leftColHeight = this.$LEFT_COL.eq(1).height() + this.$SIDEBAR_FOOTER.height(),
            contentHeight = bodyHeight < leftColHeight ? leftColHeight : bodyHeight;

        // normalize content
        contentHeight -= this.$NAV_MENU.height() + footerHeight;

        this.$RIGHT_COL.css('min-height', contentHeight);
    };
 
}
