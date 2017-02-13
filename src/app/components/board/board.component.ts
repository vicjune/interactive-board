import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { Magnet } from './../../classes/magnet';

@Component({
    selector: 'board',
    templateUrl: './board.template.html',
    styleUrls: ['./board.style.css']
})
export class BoardComponent implements OnInit {
    event: MouseEvent;
    magnets: Magnet[] = [];
    rectangle = {
        top: 50,
        left: 50,
        right: 1050,
        bottom: 1050
    }

    ngOnInit() {
        // for each magnet in Firebase do:
        this.magnets.push(new Magnet(0, 'A', 'blue'));
        this.magnets.push(new Magnet(1, 'B', 'red'));
        this.magnets.push(new Magnet(2, 'C', 'green'));
        this.magnets.push(new Magnet(3, 'I', 'purple'));
    }

    catchEvent = function(e) {
        this.event = e;
    }


}
