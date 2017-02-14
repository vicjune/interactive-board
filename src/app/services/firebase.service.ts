import { Injectable } from '@angular/core';
import { AngularFire, FirebaseObjectObservable, FirebaseListObservable } from 'angularfire2';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class FirebaseService {
    constructor (private af: AngularFire) {}

    bindList(): FirebaseListObservable<any>{
        return this.af.database.list('/magnets');
    }

    bindObject(id: string): FirebaseObjectObservable<any>{
        return this.af.database.object('/magnets/' + id);
    }

    setCoordinates(id: string, coordinates: number[]): Observable<{}> {
        return new Observable(observer => {
            this.bindObject(id).update({
                x: coordinates[0],
                y: coordinates[1],
                timestamp: + new Date
            }).then( () => {
                observer.complete();
            }).catch(error => observer.error(error));
        });
    }

    // TODO SERVER SIDE
    // addMagnet(type: string, color: string) {
    //     return new Observable(observer => {
    //         this.bindList().push({
    //             type: type,
    //             color: color
    //         })
    //         .then( () => observer.complete())
    //         .catch(error => observer.error(error));
    //     });
    // }
}
