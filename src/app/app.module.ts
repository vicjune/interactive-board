import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { AngularFireModule } from 'angularfire2';

import { AppComponent } from './app.component';
import { BoardComponent } from './components/board/board.component';
import { MagnetComponent } from './components/magnet/magnet.component';

export const firebaseConfig = {
    apiKey: "AIzaSyCcqVCaKizJ-HvqQaHQ86HUlZpdGVGCWPU",
    authDomain: "interactive-board-999c5.firebaseapp.com",
    databaseURL: "https://interactive-board-999c5.firebaseio.com",
    storageBucket: "interactive-board-999c5.appspot.com",
    messagingSenderId: "131912489396"
};

@NgModule({
    declarations: [
        AppComponent,
        BoardComponent,
        MagnetComponent
    ],
    imports: [
        BrowserModule,
        FormsModule,
        HttpModule,
        AngularFireModule.initializeApp(firebaseConfig)
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule { }
