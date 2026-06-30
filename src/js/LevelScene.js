import * as PIXI from 'pixi.js';
import { Assets } from '@pixi/assets';
import { ScrollBox } from '@pixi/ui';
import { FONT_FAMILY } from '../constants/font';

import { PALETTE } from '../constants/levels';

import svgText from "../img//levels/Animals.svg?raw";
import levelA from "../img/levels/Anime.svg";
import svgPath from "../img/levels/Mandalas.svg";

export default class Level {
    constructor(application, params = {}) {
        this.app = application;
        this.levelType = params.levelType || 'animals';
        this.selectedColor = null;
        this.svgElement = null;
        this.colors = null;
    }

    initSelectedColor() {
        if (!this.colors) {
            return;
        }

        this.selectedColor = Array.from(this.colors.entries())[0][0];
    }

    sortColors(colors) {
        const entries = Array.from(colors.entries());

        entries.sort((a, b) => b[1] - a[1]);
        return new Map(entries);
    }

    getFormattedColors(svgElement) {
        const coloredParts = svgElement.querySelectorAll("[fill]");
        const colors = new Map();

        coloredParts.forEach((part) => {
            // Save color
            const color = part.getAttribute("fill");
            const currentCount = colors.get(color) || 0;
            colors.set(color, currentCount + 1);

            // Set class
            part.classList.add("uncolored");
            part.addEventListener("click", (e) => {
                const partColor = part.getAttribute("fill");
                console.log("click", this.selectedColor, partColor);

                if (partColor !== this.selectedColor || !part.classList.contains("uncolored")) {
                    return;
                }

                const svg = part.ownerSVGElement;
                const pt = svg.createSVGPoint();
                pt.x = event.clientX;
                pt.y = event.clientY;

                const ctm = part.getScreenCTM();
                if (ctm) {
                    const localPoint = pt.matrixTransform(ctm.inverse());
                    
                    const isClickInArea = part.isPointInFill(localPoint) || part.isPointInStroke(localPoint);
                    if (isClickInArea) {
                        part.classList.remove("uncolored");
                    }
                }
            })
        });

        return colors;
    }

    setCustomStyles(svgElement) {
        const def = document.createElement("def");
        const style = document.createElement("style");
        style.innerHTML = ".uncolored { fill: white; pointer-events: visiblePainted;  }";
        def.appendChild(style);
        svgElement.appendChild(def);
    }

    async loadLevelPicture() {
        const app = this.app;

        const svgResult = await fetch(svgPath);
        const svgText = await svgResult.text();
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
        const svgElement = svgDoc.documentElement;

        svgElement.style.width = `${app.screen.width - 100}px`;
        svgElement.style.height = `${app.screen.width - 100}px`;
        svgElement.style.position = "absolute";
        svgElement.style.top = "100px";
        svgElement.style.margin = "auto";

        this.setCustomStyles(svgElement);
        
        document.body.appendChild(svgElement);
        this.svgElement = svgElement;
    }

    initColors() {
        if (!this.svgElement) {
            return;
        }

        this.colors = this.sortColors(this.getFormattedColors(this.svgElement));
    }

    async startGame() {
        console.log('%c  %c LevelScene ', 'background:#219039','color: #219039; background: #000; font-size:10pt')

        await this.loadLevelPicture();
        this.initColors();
        this.initSelectedColor();
        this.drawPalette();
    }

    drawColorCircle(color, count, index) {
        const wrap = new PIXI.Container();

        const circle = PIXI.Sprite.from("cellCircle");
        const padding = 0;
        const circleSize = PALETTE.circle + padding * 2
        circle.width = circleSize;
        circle.height = circleSize;
        circle.y = 0;
        circle.x = 0;
        wrap.addChild(circle);

        const maskSprite = PIXI.Sprite.from('cellCircle');
        maskSprite.width = circleSize;
        maskSprite.height = circleSize;
        maskSprite.x = 0;
        maskSprite.y = 0;
        wrap.addChild(maskSprite);

        const colorGraphic = new PIXI.Graphics();
        const size = PALETTE.circle;
        colorGraphic.beginFill(color);
        colorGraphic.drawCircle(padding + size/2, padding+size/2, size/2);
        colorGraphic.endFill();
        colorGraphic.mask = maskSprite;
        wrap.addChild(colorGraphic);

        let numberColor = "0x000";
        const formattedColor = color.substring(1);
        const rgb = parseInt(formattedColor, 16);
        const red = (rgb >> 16) & 0xff;
        const green = (rgb >>  8) & 0xff;
        const blue = (rgb >>  0) & 0xff;

        const luma = 0.2126 * red + 0.7152 * green + 0.0722 * blue;
        if (luma < 40) {
            numberColor = "0xfff";
        }

        const number = new PIXI.Text(`${index+1}`, {
            fontFamily: FONT_FAMILY,
            fontSize: 32,
            fontWeight: 600,
            fill: numberColor, 
            align : 'center',
            wordWrap: true,
            wordWrapWidth: 200,
        });
        number.anchor.set(0.5, 0.5);
        number.x = wrap.width / 2;
        number.y = colorGraphic.height / 2 - 2;
        wrap.addChild(number);

        const y = padding * 2;
        const x = index * (padding * 2 + circle.width);
        wrap.x = x;
        wrap.y = y;

        wrap.on("pointerdown", () => {
            this.selectedColor = color;
        });
        return wrap;
    }

    drawPalette() {
        if (!this.colors) {
            return;
        }

        const app = this.app;

        const width = app.screen.width;
        const height = PALETTE.circle + PALETTE.padding * 2;

        let index = 0;
        const items = [];
        for (const [colorCode, colorCount] of this.colors.entries()) {
            items.push(this.drawColorCircle(colorCode, false, index));
            index++;
        }

        const scrollBox = new ScrollBox({
            width: width,
            height: height,
            type: 'horizontal',
            items: items,
            padding: PALETTE.padding,
            elementsMargin: PALETTE.gap,
            scrollbar: {
                trackColor: 0x333333,
                trackAlpha: 0.3,
                thumbColor: 0x3498db,
                thumbAlpha: 0.8,
                size: 8,
                offset: 5,
            },
            background: "F4F4F4",
        });
        scrollBox.x = 0;
        scrollBox.y = app.screen.height - height;
        app.stage.addChild(scrollBox);
    }
}