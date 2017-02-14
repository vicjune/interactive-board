import { Component, Output, EventEmitter, OnInit, ViewChild } from '@angular/core';
import { Magnet } from './../../classes/magnet';

@Component({
    selector: 'board',
    templateUrl: './board.template.html',
    styleUrls: ['./board.style.css']
})
export class BoardComponent implements OnInit {
    event: MouseEvent;
    magnets: Magnet[] = [];
    rectangle;
    @ViewChild('board') board;

    ngOnInit() {
        // for each magnet in Firebase do:
        this.magnets.push(new Magnet(0, 'A', 'blue'));
        this.magnets.push(new Magnet(1, 'B', 'red'));
        this.magnets.push(new Magnet(2, 'C', 'green'));
        this.magnets.push(new Magnet(3, 'I', 'purple'));

        this.buildRectangle();
    }

    onResize() {
        this.buildRectangle();
    }

    catchEvent = function(e) {
        this.event = e;
    }

    private buildRectangle() {
        let bouncingRect = this.board.nativeElement.getBoundingClientRect();
        this.rectangle = {
            top: bouncingRect.top + window.scrollY,
            bottom: bouncingRect.bottom + window.scrollY,
            left: bouncingRect.left + window.scrollX,
            right: bouncingRect.right + window.scrollX,
        }
    }
}
