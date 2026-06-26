import * as PIXI from 'pixi.js'
import { sound } from '@pixi/sound';
import { Sprite } from '@pixi/sprite';

import { gsap } from "gsap";
import { PixiPlugin } from "gsap/PixiPlugin";

import { LEVEL_COUNT, LEVELS } from '../constants/levels';

let app;
let music;

export default class Main {
    constructor (application) {
        app = application;
    }

    drawHeader() {
        const headerText = new PIXI.Text("Choose category", {
            fontFamily: 'Poppins',
            fontSize: 48,
            fontWeight: 600,
            fill: 0x3a3a3a, 
            align : 'center',
            wordWrap: true,
            wordWrapWidth: 200,
        });
        headerText.anchor.set(0.5, 0.5);
        headerText.x = app.screen.width / 2;
        headerText.y = 0 + 40 + headerText.height / 2;
        app.stage.addChild(headerText);
    }

    createLevelCell(x, y, texture, label, width, height) {
        const wrap = new PIXI.Container();
        const wrapSprite = PIXI.Sprite.from('cell');
        wrapSprite.width = width;
        wrapSprite.height = height;
        wrapSprite.x = 0;
        wrapSprite.y = 0;

        const maskSprite = PIXI.Sprite.from('cell');
        maskSprite.width = width;
        maskSprite.height = height;
        maskSprite.x = 0;
        maskSprite.y = 0;

        const innerSprite = PIXI.Sprite.from(texture);
        innerSprite.width = width;
        innerSprite.height = height;
        innerSprite.x = 0;
        innerSprite.y = 0;

        innerSprite.mask = maskSprite;

        const labelSprite = PIXI.Sprite.from(label);
        const difference = labelSprite.width < width / 2 
            ? labelSprite.width * 1 / (width / 2)
            : (width / 2) * 1 / labelSprite.width;

        labelSprite.scale.set(difference, difference);
        labelSprite.x = width - labelSprite.width - 10;
        labelSprite.y = height - labelSprite.height - 10;
        labelSprite.mask = maskSprite;

        wrap.addChild(wrapSprite);
        wrap.addChild(innerSprite);
        wrap.addChild(maskSprite); 
        wrap.addChild(labelSprite); 

        wrap.x = x;
        wrap.y = y;

        return wrap;
    }
    
    drawLevelsList() {
        const isVertical = true;

        const wrap = new PIXI.Container();
        wrap.name = "levelsList";

        let gap = 20;
        let startGap = isVertical ? 200 : 100;

        const rows = isVertical ? 2 : 1;
        const columns = isVertical ? 2 : 4;
        const spiralledLevels = this.drawSpiralLevelsList(rows, columns, LEVELS);
        const cellWidth = isVertical ? (app.screen.width - (gap * 3)) / 2 : (app.screen.width - (gap * 5)) / 4;
        const cellHeight = cellWidth;

        spiralledLevels.forEach((level, index) => {
            const {
                row,
                col,
                data
            } = level;
            const x = col * (gap + cellWidth) + gap;
            const y = row * (gap + cellHeight) + startGap;
            
            console.log(x, y, col, gap, cellWidth);
            const cell = this.createLevelCell(x, y, data.cover, data.label, cellWidth, cellHeight);
            wrap.addChild(cell);
        })


        app.stage.addChild(wrap);
    }

    drawSpiralLevelsList(rows, cols, cellData) {
        const cells = [];
        let top = 0;
        let bottom = rows - 1;
        let left = 0;
        let right = cols - 1;
        let index = 0;
        
        while (top <= bottom && left <= right) {
            // Верхняя строка (слева → направо)
            for (let i = left; i <= right; i++) {
                cells.push({
                    row: top,
                    col: i,
                    data: cellData[index++]
                });
            }
            top++;
            
            // Правый столбец (сверху → вниз)
            for (let i = top; i <= bottom; i++) {
                cells.push({
                    row: i,
                    col: right,
                    data: cellData[index++]
                });
            }
            right--;
            
            // Нижняя строка (справа → налево)
            if (top <= bottom) {
                for (let i = right; i >= left; i--) {
                    cells.push({
                        row: bottom,
                        col: i,
                        data: cellData[index++]
                    });
                }
                bottom--;
            }
            
            // Левый столбец (снизу → вверх)
            if (left <= right) {
                for (let i = bottom; i >= top; i--) {
                    cells.push({
                        row: i,
                        col: left,
                        data: cellData[index++]
                    });
                }
                left++;
            }
        }
        
        return cells;
    }

    drawHand() {
        const hand = Sprite.from('hand')
        hand.anchor.set(0.5) 
        app.stage.addChild(hand)

        hand.x = app.screen.width * 0.65
        hand.y = app.screen.height * 0.65
        hand.scale.set(0.5);

        gsap.to(hand.scale, {
            x: 0.6, y: 0.6, duration: 0.5, repeat: -1, yoyo: true, ease: 'Quad.InOut'
        })
    }

    drawFooter() {
        const footerText = new PIXI.Text(
            "Happy Color", 
            {
                fontFamily: 'Poppins',
                fill: 0x000000,
                fontWeight: 600,
                fontSize: 36,
            }
        );
        footerText.anchor.set(0.5, 0.5);
        footerText.x = app.screen.width / 2;
        footerText.y = app.screen.height - 80 - footerText.height / 2;
        app.stage.addChild(footerText);
    }

    startGame() {
        console.log('%c  %c MainScene ', 'background:#219039','color: #219039; background: #000; font-size:10pt')

        this.drawHeader();
        this.drawLevelsList();
        this.drawHand();
        this.drawFooter();

        // music =  sound.play('sound_fx');
    }
}