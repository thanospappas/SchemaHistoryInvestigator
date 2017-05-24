import {Component} from '@angular/core';
import {ProjectService} from "../../services/Projects.services";
import {Project} from "../../shared/Project";

@Component({
  selector: 'topnav-bar',
  templateUrl: './topnavbar.component.html',

})
export class TopNavBar{

    projects;
    selectedProject;

    constructor(private projectService:ProjectService) {    }

    projectSelection(projectValue){
        let selectedIndex:number;
        if (parseInt(projectValue) > 1){
            selectedIndex = parseInt(projectValue)-2;
        }
        else{
            selectedIndex = parseInt(projectValue)-1;
        }
        let prj:Project = {selectedPrj: '', projectId: -1};

        prj.selectedPrj = this.projects[selectedIndex].Name;
        prj.projectId = this.projects[selectedIndex].ID;

        this.projectService.setSelectedProject(prj);

    }
  

  ngOnInit() {
      this.projectService.retrieveProjects().subscribe(projects => {
          projects.splice(1,1);
              this.projects = projects;
          },
          err => {
              console.log(err);
      });
  }
 
}
