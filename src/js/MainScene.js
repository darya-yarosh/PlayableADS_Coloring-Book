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

        // -> Cell
        // const cellType = [
        //     app.svgTextures?.typeA,
        //     app.svgTextures?.typeB,
        //     app.svgTextures?.typeC,
        //     app.svgTextures?.typeD,
        // ];

        const cellType = [
            "coverA",
            "coverB",
            "coverC",
            "coverD",
        ];
        
        const createCell = (x, y, texture, width, height) => {
            const wrap = new PIXI.Container();
            const wrapSprite = PIXI.Sprite.from('cell');
            wrapSprite.width = width; // Твой размер ячейки
            wrapSprite.height = height;
            wrapSprite.x = 0;
            wrapSprite.y = 0;

            const maskSprite = PIXI.Sprite.from('cell');
            maskSprite.width = width; // Твой размер ячейки
            maskSprite.height = height;
            maskSprite.x = 0;
            maskSprite.y = 0;

            const innerSprite = PIXI.Sprite.from(texture);
            innerSprite.width = width;
            innerSprite.height = height;
            innerSprite.x = 0;
            innerSprite.y = 0;
            innerSprite.mask = maskSprite;

            wrap.addChild(wrapSprite);
            wrap.addChild(innerSprite);
            wrap.addChild(maskSprite); 

            wrap.x = x;
            wrap.y = y;

            return wrap;
        }
        // Cell <-

        // -> CellMap
        const LEVEL_COUNT = 4;

        const cells = [];

        const isVertical = true;
        for(let index = 0; index < LEVEL_COUNT; index++) {
            let startGap = 0;
            let cellWidth = 0;
            let cellHeight = 0;
            let x = 0;
            let y = 0;
            let gap = 0;

            const isEven = index % 2 === 0;
            if (isVertical) {
                startGap = 100;
                gap = 20;
                cellWidth = (app.screen.width - (gap * 3))/ 2;
                cellHeight = cellWidth;
                x = isEven ? app.screen.width - gap - cellWidth : gap;
                const row = Math.round((index+1) / 2) - 1;
                
                y = startGap + row * (gap + cellHeight)
            } else {
                
            }
            
            const cell = createCell(x, y, cellType[index], cellWidth, cellHeight);
            
            cells.push(cell);

            app.stage.addChild(cell);
        }
        // CellMap <-

        // -> Hand
        const hand = Sprite.from('hand')
        hand.anchor.set(0.5) 
        app.stage.addChild(hand)

        hand.x = app.screen.width * 0.65
        hand.y = app.screen.height * 0.65
        hand.scale.set(0.5);

        gsap.to(hand.scale, {
            x: 0.6, y: 0.6, duration: 0.5, repeat: -1, yoyo: true, ease: 'Quad.InOut'
        })
        // Hand <-

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