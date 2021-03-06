import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-root',
    templateUrl: './app.template.html',
    styleUrls: ['./app.style.css']
})
export class AppComponent implements OnInit {
    darkMode: boolean = false;

    ngOnInit() {
        if (window.location.search.substring(1) === 'display') {
            this.darkMode = true;
        }
    }
}
