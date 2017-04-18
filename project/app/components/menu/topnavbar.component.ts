import {Component, Input} from '@angular/core';
import {    OnChanges, SimpleChange } from '@angular/core';
import * as $ from 'jquery';
import {ProjectService} from "../../services/Projects.services";
@Component({
  selector: 'topnav-bar',  // <home></home>

    // We need to tell Angular's Dependency Injection which providers are in our app.
  providers: [
      ProjectService
  ],
  // Our list of styles in our component. We may add more to compose many styles together
 // styleUrls: [ '../app.style.css' ],
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: './topnavbar.component.html',

})
export class TopNavBar{

    projects;
    selectedProject;

    constructor(private projectService:ProjectService) {

    }


    toggleClicked(event: MouseEvent)
    {
        var target = event.srcElement.id;
        var body = $('body');
        var menu = $('#sidebar-menu');
        
        // toggle small or large menu
        if (body.hasClass('nav-md')) {
            menu.find('li.active ul').hide();
            menu.find('li.active').addClass('active-sm').removeClass('active');
        } else {
            menu.find('li.active-sm ul').show();
            menu.find('li.active-sm').addClass('active').removeClass('active-sm');
        }
        body.toggleClass('nav-md nav-sm');

    }

    projectSelection(projectValue){
        let selectedIndex:number;
        console.log("changed...");
        if (parseInt(projectValue) > 1){
            selectedIndex = parseInt(projectValue)-2;
        }
        else{
            selectedIndex = parseInt(projectValue)-1;
        }
        this.projectService.setSelectedProject(this.projects[parseInt(projectValue)-1]);
        //console.log(this.projects[selectedIndex]);
    }
  

  ngOnInit() {
        console.log("Projects on nav:");
      this.projectService.retrieveProjects()
          .subscribe(projects => {
              projects.splice(1,1);
                  this.projects = projects;
              },
              err => {
                  console.log(err);
              }
          );

  }


  ngAfterViewInit(){
     
  }
 
}
