import * as PIXI from 'pixi.js';
import { Assets } from '@pixi/assets';
import { ScrollBox } from '@pixi/ui';
import { gsap } from "gsap";

import handSrc from "../img/interface/Hand.png";
import { FONT_FAMILY } from '../constants/font';
import { COLORS, INTERACTIVE_LEVEL, LEVELS, PALETTE } from '../constants/levels';
import { findFreeSpaceForNumber } from './utils';

export default class Level {
    constructor(application, params = {}) {
        this.app = application;
        this.levelType = params.levelType;
        this.isVertical = this.app?.screen?.width ? this.app.screen.width < this.app.screen.height : true;
        this.selectedColor = null;
        this.svgElement = null;
        this.colors = null;
    }

    handleResize(isLandscape) {
        console.log(`Game resized to ${isLandscape ? 'landscape' : 'portrait'}`);

        if (this.app) {
            this.isVertical = !isLandscape;
            this.app.stage.removeChildren();
            this.startGame();
        }
    }

    drawNumbersInAreas() {
        if (!this.svgElement) {
            return;
        }

        const arrayColors = Array.from(this.colors.entries());
        this.svgElement.style.top = 0;
        document.body.appendChild(this.svgElement);
        const svgRect = this.svgElement.getBoundingClientRect();

        const numbersContainer = document.createElement("svg");
        numbersContainer.style.cssText = `
            position: absolute;
            top: ${svgRect.top}px;
            margin: auto;
            width: ${svgRect.width}px;
            height: ${svgRect.height}px;
            pointer-events: none;
            overflow: hidden;
        `;

        const originalSvgWidth = this.svgElement.viewBox.baseVal.width;
        const originalSvgHeight = this.svgElement.viewBox.baseVal.height;
        const scaleX = svgRect.width / originalSvgWidth;
        const scaleY = svgRect.height / originalSvgHeight;
        const pictureWrap = this.app.stage.children.find((c) => c.name === "picture");

        let numberElements = [];
        
        try {
            const createNumberContent = (part, index) => {
                const color = this.getElementColor(part);
                if (!color) {
                    return;
                }
                
                const number = arrayColors.findIndex((arrayEl) => arrayEl[0] === color);
                if (number === -1) {
                    return;
                }

                const { x, y } = findFreeSpaceForNumber(part);
                
                const scaledX = x * scaleX - 4;
                const scaledY = y * scaleY - 4;

                const bbox = part.getBBox();
                function calculateFontSize(bbox, scaleX, scaleY) {
                    const areaWidth = bbox.width * scaleX;
                    const areaHeight = bbox.height * scaleY;
                    
                    const diagonal = Math.sqrt(areaWidth * areaWidth + areaHeight * areaHeight);
                    
                    const fillFactor = 0.35;
                    
                    let fontSize = diagonal * fillFactor;
                    fontSize = Math.max(8, Math.min(fontSize, 60));

                    const aspectRatio = areaWidth / areaHeight;
                    if (aspectRatio < 0.3 || aspectRatio > 3) {
                        fontSize *= 0.7;
                    }
                    
                    return fontSize;
                }

                const fontSize = calculateFontSize(bbox, scaleX, scaleY);
                
                const numberText = new PIXI.Text(index + 1, {
                    fontFamily: FONT_FAMILY,
                    fontWeight: 600,
                    fontSize: 6,
                    x: scaledX,
                    y: scaledY,
                    color: "black",
                });
                numberText.x = scaledX;
                numberText.y = scaledY;
                
                pictureWrap?.children?.[1]?.addChild(numberText);
                if (index === 0) {
                    this.firstAreaBox = bbox;
                    part.setAttribute("id", "firstColor");
                }
                return numberText;
            };

            const coloredElements = this.getColoredElements(this.svgElement);
            COLORS.index.forEach((indexValue, index) => {
                createNumberContent(coloredElements[indexValue], index);
            });

            document.body.removeChild(this.svgElement);
        } catch (error) {
            console.warn("Ошибка при отрисовке цифр:", error);
        }
    }

    initSelectedColor() {
        if (!this.colors || this.colors.size === 0) {
            return;
        }

        this.selectedColor = Array.from(this.colors.entries())[0][0];
    }

    sortColors(colors) {
        const entries = Array.from(colors.entries());

        entries.sort((a, b) => b[1] - a[1]);

        const priorityValues = COLORS.colors;
    
        const priorityEntries = [];
        const remainingEntries = [];
        
        for (const entry of entries) {
            const colorCode = entry[0];
            const priorityIndex = priorityValues.indexOf(colorCode);
            
            if (priorityIndex !== -1) {
                priorityEntries[priorityIndex] = entry;
            } else {
                remainingEntries.push(entry);
            }
        }
        
        const finalEntries = [
            ...priorityEntries.filter(entry => entry !== undefined),
            ...remainingEntries
        ];
        return new Map(finalEntries);
    }

    getColoredElements(element) {
        return element.querySelectorAll("[fill], [class]");
    }

    getElementColor(element) {
        const attributeColor = element.getAttribute("fill");
        if (attributeColor) {
            return attributeColor;
        }

        const styleColor = element.style.fill;
        if (styleColor) {
            return styleColor;
        }

        const styleElements = this.svgElement.querySelectorAll("style");
        let foundColor = null;
        
        const className = element.getAttribute("class");
        if (className) {
            for (let styleEl of styleElements) {
                const styleText = styleEl.textContent;
                
                const classRegex = new RegExp(
                    `\\.${className}\\s*(?::[\\w-]+)?\\s*\\{([^}]*)\\}`,
                    'g'
                );
                
                let match;
                while ((match = classRegex.exec(styleText)) !== null) {
                    const properties = match[1];
                    
                    const fillRegex = /fill\s*:\s*([^;]+);?/;
                    const fillMatch = properties.match(fillRegex);
                    
                    if (fillMatch) {
                        foundColor = fillMatch[1].trim();
                        break;
                    }
                }
                
                if (foundColor) {
                    break;
                }
            }
        }

        if (foundColor) {
            return foundColor;
        }

        const computedStyle = window.getComputedStyle(element);
        return computedStyle?.fill || null;
    }

    getFormattedColors(svgElement) {
        const coloredParts = this.getColoredElements(svgElement);

        const colors = new Map();

        coloredParts.forEach((part) => {
            const color = this.getElementColor(part);
            if (color === "none" || !color) {
                return;
            }

            const currentCount = colors.get(color) || 0;
            colors.set(color, currentCount + 1);

            part.classList.add("uncolored");
            part.addEventListener("click", () => {
                const partColor = this.getElementColor(part);

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
        style.innerHTML = "svg { overflow: hidden; } svg >* { transition: transform 2s; } .uncolored { fill: white; pointer-events: visiblePainted;  } .zoomed >* { transform: scale(2); transform-origin: left; }";
        def.appendChild(style);
        svgElement.appendChild(def);
    }

    async formatPictureToElement() {
        const app = this.app;

        const svgResult = await fetch(app.svgLevels[this.levelType]);
        const svgText = await svgResult.text();
        const size = this.isVertical ? app.screen.width - 100 : app.screen.height - 200;
        const styledSvg = svgText.replace(
            '<svg',
            `<svg style="
                width: ${size}px; 
                height: ${size}px;
                position: absolute;
                margin: auto;"
                width="${size}" 
                height="${size}"
            `
        );
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(styledSvg, 'image/svg+xml');
        const svgElement = svgDoc.documentElement;

        this.setCustomStyles(svgElement);
        
        this.svgElement = svgElement;
    }

    async drawInitPicture() {
        const app = this.app;

        const wrap = new PIXI.Container();
        wrap.name = "picture";
        
        const resource = new PIXI.SVGResource(this.svgElement.outerHTML);
        const size = this.isVertical ? app.screen.width - 100 : app.screen.height - 200;
        const baseTexture = new PIXI.BaseTexture(resource);
        const texture = new PIXI.Texture(baseTexture);
        
        await new Promise((resolve) => {
            if (baseTexture.valid) {
                resolve();
            } else {
                baseTexture.once('loaded', resolve);
            }
        });
        
        const maskGraphics = new PIXI.Graphics();
        maskGraphics.beginFill(0xffffff);
        maskGraphics.drawRect(0, 0, texture.width, texture.height);
        maskGraphics.endFill();
        wrap.addChild(maskGraphics);

        const wrapPicture = new PIXI.Container();
        wrapPicture.x = 0;
        wrapPicture.y = 0;
        wrapPicture.mask = maskGraphics;

        const sprite = new PIXI.Sprite(texture);
        sprite.x = 0;
        sprite.y = 0;
        wrapPicture.width = sprite.width;
        wrapPicture.height = sprite.height;
        wrapPicture.addChild(sprite);

        wrap.x = app.screen.width / 2 - sprite.width / 2;
        wrap.y = this.isVertical ? 100 : 40;

        wrap.addChild(wrapPicture);
        app.stage.addChild(wrap);
    }

    initColors() {
        if (!this.svgElement) {
            return;
        }

        this.colors = this.sortColors(this.getFormattedColors(this.svgElement));
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
        wrap.color = color;

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
        const padding = this.isVertical ? PALETTE.paddingVertical : PALETTE.paddingHorizontal;
        const height = PALETTE.circle + padding * 2;

        let index = 0;
        const items = [];
        for (const [colorCode, colorCount] of this.colors.entries()) {
            items.push(this.drawColorCircle(colorCode, false, index));
            index++;
        }

        items[0].name = "colorFirst";
        items[1].name = "colorSecond";

        const scrollBox = new ScrollBox({
            width: width,
            height: height,
            type: 'horizontal',
            shiftScroll: true,
            items: items,
            padding: padding,
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
        scrollBox.name = "palette";
        scrollBox.x = 0;
        scrollBox.y = app.screen.height - height;
        app.stage.addChild(scrollBox);
    }

    findPaletteFirstColor(colorName) {
        const palette = this.app.stage.children.find(c => c.name === "palette");
        const colorsList = palette?.children?.[1] || null;
        if (!colorsList) {
            return null;
        }

        const colorElement = colorsList.children.find(c => c.name === colorName);
        return colorElement || null;
    }

    drawHand() {
        const app = this.app;

        const hand = PIXI.Sprite.from('hand');

        const scale = this.levelType === INTERACTIVE_LEVEL ? 0.1 : 0.3;
        const initX = app.screen.width / 2;
        const initY = app.screen.height / 2;

        hand.name = "hand";
        hand.width = hand.width * scale;
        hand.height = hand.height * scale;
        hand.anchor.set(0.5, 0.5);

        hand.x = initX;
        hand.y = initY;

        if (this.levelType === INTERACTIVE_LEVEL) {
            const firstColor = this.findPaletteFirstColor("colorFirst");
            
            if (firstColor) {
                // MARK 1
                hand.x = firstColor.worldTransform.tx + firstColor.width / 1.75;
                hand.y = firstColor.worldTransform.ty + firstColor.height / 2.75;
                hand.anchor.set(0, 0);
            }
        } else {   
            const text = app.stage.children.find(c => c.name === "text");

            if (text) {
                hand.x = text.x;
                hand.y = text.y + text.height / 3;
                hand.anchor.set(0, 0);
            }
        }

        app.stage.addChild(hand)
        
        const durationPerCell = 0.8;
        const animationScale = 0.2;
        gsap.to(hand.scale, {
            x: animationScale, y: animationScale, duration: (durationPerCell + 0.3) / 2, repeat: -1, yoyo: true, ease: 'Quad.InOut',
        })
    }

    drawText() {
        if (this.levelType === INTERACTIVE_LEVEL) {
            return;
        }

        const app = this.app;

        const tapToClickText = new PIXI.Text("Tap to Color", {
            fontSize: this.isVertical ? 54 : 48,
            fontWeight: 600,
            fontFamily: FONT_FAMILY,
            dropShadow: true,
            dropShadowColor: "white",
            dropShadowBlur: 14,
            dropShadowDistance: 0,
            stroke: "white",
            strokeThickness: 8,
        });
        tapToClickText.name = "text";
        tapToClickText.anchor.set(0.5, 0.5);
        tapToClickText.y = this.isVertical ? 250 : 200;
        tapToClickText.x = app.screen.width / 2;

        app.stage.addChild(tapToClickText);
    }

    configureSpecialInteractive() {
        const firstColor = this.findPaletteFirstColor("colorFirst");
        if (!firstColor) {
            return;
        }

        firstColor.on("pointerdown", () => {
            this.selectedColor = firstColor.color;

            const moveHand = (x, y) => {
                const hand = this.app.stage.children.find((c) => c.name === "hand");
                if (!hand) {
                    return;
                }
    
                gsap.to(hand, {
                    x, 
                    y,
                    duration: 1, 
                    repeat: 0, 
                    yoyo: true, 
                    ease: 'Quad.InOut',
                });
            };

            const pictureWrap = this.app.stage.children.find((c) => c.name === "picture");
            const picture = pictureWrap?.children?.[1] || null;

            let fX = 0;
            let fY = 0;
            let fScaleX = 1;
            let fScaleY = 1;
            let initX = this.firstAreaBox.x;
            let initY = this.firstAreaBox.y;
            let initPivotY = picture.pivot.y;
            let ended = false;
            
            const activateInteractiveForArea = () => {
                picture.on("pointerdown", (e) => {
                    const { x, y } = e.data.global;
                    const difference = 100;
                    const xPointInArea = x > this.firstAreaBox.x - difference && x < this.firstAreaBox.x + difference;
                    const yPointInArea = y > this.firstAreaBox.y - difference && y < this.firstAreaBox.y + difference;

                    const isClickedAreaAndFilled = yPointInArea && xPointInArea;
                    
                    if (isClickedAreaAndFilled) {
                        const firstColorAreaElement = this.svgElement.querySelector("[id='firstColor']");
                        if (firstColorAreaElement) {
                            firstColorAreaElement.classList.remove("uncolored");
                        }

                        const resource = new PIXI.SVGResource(this.svgElement.outerHTML);
                        const baseTexture = new PIXI.BaseTexture(resource);
                        const texture = new PIXI.Texture(baseTexture);
                        picture.children[0].texture = new PIXI.Texture(texture);

                        const secondColor = this.findPaletteFirstColor("colorSecond");
                        if (!secondColor) {
                            return;
                        }

                        const x = secondColor.worldTransform.tx + secondColor.width / 1.75;
                        const y = secondColor.worldTransform.ty + secondColor.height / 2.75;
                        moveHand(x, y);
                        secondColor.on("pointerdown", () => {
                            const areaSecondX = 0;
                            const areaSecondY = 0;
                            moveHand(areaSecondX, areaSecondY)

                            this.configureDefaultInteractive();
                        });
                    }
                 })
            }

            const zoomArea = () => {
                if (!picture) {
                    return;
                }

                picture.interactive = true;
                const resource = new PIXI.SVGResource(this.svgElement.outerHTML);
                const baseTexture = new PIXI.BaseTexture(resource);
                const texture = new PIXI.Texture(baseTexture);
                picture.texture = new PIXI.Texture(texture);
                
                this.app.ticker.add((delta) => {
                    if (picture.scale.x < 3) {
                        picture.scale.x += 0.05 * delta;
                        picture.scale.y += 0.05 * delta;

                        picture.pivot.y += delta * 2;
                        fY += delta * 2;
                        fScaleX += 0.05 * delta;
                        fScaleY += 0.05 * delta;
                    } else {
                        if (!ended) {
                            ended = true;
                            this.firstAreaBox = {
                                x: this.isVertical 
                                    ? this.app.view.offsetLeft + pictureWrap.x - initX * fScaleX * 0.1
                                    : this.app.view.offsetLeft + pictureWrap.x + initX * fScaleX * 2 * 0.1,
                                y: this.isVertical 
                                    ? this.app.view.offsetTop + pictureWrap.y + picture.pivot.y * 0.1 + (initY - initY * fScaleY * 2 * 0.1)
                                    : this.app.view.offsetTop + pictureWrap.y + picture.pivot.y * 0.1 + (initY * 0.1),
                            }

                            const areaFirstX = this.firstAreaBox.x;
                            const areaFirstY = this.firstAreaBox.y;
                            moveHand(areaFirstX, areaFirstY);
                            activateInteractiveForArea();
                        }
                        picture.ticker?.remove(this);
                    }
                });
            }

            zoomArea();
        })
    }

    configureDefaultInteractive() {
        this.app.stage.eventMode = 'static';
        this.app.stage.hitArea = this.app.screen;
        this.app.stage.on("pointerdown", (e) => {
            if (typeof FbPlayableAd !== 'undefined' && typeof FbPlayableAd.onCTAClick === 'function') {
                FbPlayableAd.onCTAClick();
            } else if (typeof ExitApi !== 'undefined' && typeof ExitApi.exit === 'function') {
                ExitApi.exit();
            } else {
                alert('Download the game in App Store / Google Play!');
            }
        })
    }

    configureInteractive() {
        if (this.levelType === INTERACTIVE_LEVEL) {
            this.configureSpecialInteractive();
        } else {
            this.configureDefaultInteractive();
        }
    }

    async startGame() {
        const app = this.app;
        console.log('%c  %c LevelScene ', 'background:#219039','color: #219039; background: #000; font-size:10pt')

        await this.formatPictureToElement();
        this.initColors();
        this.initSelectedColor();
        await this.drawInitPicture();
        this.drawNumbersInAreas();
        this.drawPalette();

        this.drawText();
        setTimeout(() => {
            this.drawHand();
        }, 0);
``
        this.configureInteractive();
    }
}