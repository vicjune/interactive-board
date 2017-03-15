import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-root',
    templateUrl: './app.template.html',
    styleUrls: ['./app.style.css']
})
export class AppComponent implements OnInit {
    darkMode: boolean = false;

    ngOnInit() {
        if (navigator.platform.includes('Linux armv')) {
            this.darkMode = true;
        }
    }
}
