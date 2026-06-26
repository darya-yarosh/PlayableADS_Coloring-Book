import * as PIXI from 'pixi.js'
import { sound } from '@pixi/sound';
import { Sprite } from '@pixi/sprite';

import { gsap } from "gsap";
import { PixiPlugin } from "gsap/PixiPlugin";

let app;
let music;

export default class Main {
    constructor (application) {
        app = application;
    }
    
    startGame() {
        console.log('%c  %c MainScene ', 'background:#219039','color: #219039; background: #000; font-size:10pt')

        // -> Header
        const headerText = new PIXI.Text("Choose category", {
            fontFamily: 'Poppins',
            fontSize: 24, fill : 0xff1010, align : 'center'
        });
        headerText.anchor.set(0.5, 0.5);
        headerText.x = app.screen.width / 2;
        headerText.y = 0 + 40 + headerText.height / 2;
        app.stage.addChild(headerText);
        // Header <-


        // -> Footer
        const footerText = new PIXI.Text("Happy Color", {fontFamily: 'Poppins'});
        footerText.anchor.set(0.5, 0.5);
        footerText.x = app.screen.width / 2;
        footerText.y = app.screen.height - 40 - footerText.height / 2;
        app.stage.addChild(footerText);
        // Footer <-

        // -> Sound
        // music =  sound.play('sound_fx');
        // Sound <-
    }
}