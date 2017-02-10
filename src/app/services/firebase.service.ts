import { Injectable } from '@angular/core';
import { AngularFire, FirebaseObjectObservable } from 'angularfire2';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class FirebaseService {
    constructor (private af: AngularFire) {}

    bindObject(id: number): FirebaseObjectObservable<any>{
        return this.af.database.object('/magnets/' + id);
    }

    setCoordinates(id: number, coordinates: number[]): Observable<{}> {
        return new Observable(observer => {
            this.bindObject(id).set({
                x: coordinates[0],
                y: coordinates[1]
            }).then( () => {
                observer.complete();
            }).catch(error => observer.error(error));
        });
    }
}
