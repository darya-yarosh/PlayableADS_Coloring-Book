import { Assets, BaseTexture, Container, Graphics, Sprite, Text, Texture } from 'pixi.js';
import { gsap } from "gsap";

import { FONT_FAMILY } from '../constants/font';
import { RESOLUTION } from '../constants/assets';
import { COLORS, INTERACTIVE_LEVEL, LEVELS, PALETTE } from '../constants/levels';

import { createTextureFromHTMLElement } from './utils';
import { calculateFontSize, findFreeSpaceForNumber } from './utils/area';
import { getColoredElements, getElementColor } from './utils/colors';

import { PRELOADED_LEVELS } from './MainScene';
import LevelTexture from './LevelTexture';

export default class Level {
    constructor(application, params = {}) {
        this.app = application;
        this.levelType = params.levelType;
        this.isVertical = this.app?.screen?.width ? this.app.screen.width < this.app.screen.height : true;
        this.selectedColor = null;
        
        const { svgElement, colors, texture } = PRELOADED_LEVELS[this.levelType];

        this.svgElement = svgElement;
        this.colors = colors;
        this.texture = texture;
    }

    async handleResize(isLandscape) {
        if (this.app) {
            if (this.isVertical !== !isLandscape) {
                const size = !isLandscape ? this.app.screen.width - 100 : this.app.screen.height - 200;
                
                const levelTextureData = new LevelTexture();
                PRELOADED_LEVELS[this.levelType] = await levelTextureData.init(this.app, this.levelType, size);

                this.svgElement = PRELOADED_LEVELS[this.levelType].svgElement;
                this.texture = PRELOADED_LEVELS[this.levelType].texture;
            }
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
        const pictureWrap = this.app.stage.children.find((c) => c.label === "picture");

        let numberElements = [];

        try {
            const createNumberContent = (part, index) => {
                const color = getElementColor(part, this.svgElement);
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

                const fontSize = calculateFontSize(bbox, scaleX, scaleY);
                
                const numberText = new Text({
                    text: index + 1, 
                    style: {
                        fontFamily: FONT_FAMILY,
                        fontWeight: 600,
                        fontSize: 6,
                        antialias: true,
                        x: scaledX,
                        y: scaledY,
                        color: "black",
                    },
                    resolution: RESOLUTION.text * 2,
                });
                numberText.x = scaledX;
                numberText.y = scaledY;
                numberText.roundPixels = true;
                
                pictureWrap?.children?.[1]?.addChild(numberText);
                if (index === 0) {
                    part.setAttribute("id", "firstColor");
                }
                return numberText;
            };

            const coloredElements = getColoredElements(this.svgElement);
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

    drawPicture() {
        const app = this.app;

        const wrap = new Container();
        wrap.label = "picture";
        const size = this.isVertical ? app.screen.width - 100 : app.screen.height - 200;

        const diffWidth = (this.texture * 1 / size)
        this.diffForArea = diffWidth;
        
        const maskGraphics = new Graphics();
        maskGraphics.rect(0, 0, size, size);
        maskGraphics.fill(0xffffff);
        wrap.addChild(maskGraphics);

        const wrapPicture = new Container();
        wrapPicture.x = 0;
        wrapPicture.y = 0;
        wrapPicture.mask = maskGraphics;
        wrapPicture.label = "svgWrap";

        const sprite = new Sprite(this.texture);
        sprite.x = 0;
        sprite.y = 0;
        sprite.width = size;
        sprite.height = size;
        sprite.roundPixels = true;

        wrapPicture.addChild(sprite);

        wrap.x = app.screen.width / 2 - sprite.width / 2;
        wrap.y = this.isVertical ? 100 : 40;

        wrap.addChild(wrapPicture);
        app.stage.addChild(wrap);
    }

    drawColorCircle(color, count, index) {
        const wrap = new Container();
        wrap.interactive = true;

        const circle = Sprite.from("cellCircle");
        const padding = 0;
        const circleSize = PALETTE.circle + padding * 2
        circle.width = circleSize;
        circle.height = circleSize;
        circle.y = 0;
        circle.x = 0;
        wrap.addChild(circle);

        const maskSprite = Sprite.from('cellCircle');
        maskSprite.width = circleSize;
        maskSprite.height = circleSize;
        maskSprite.x = 0;
        maskSprite.y = 0;
        wrap.addChild(maskSprite);

        const colorGraphic = new Graphics();
        const size = PALETTE.circle;
        
        colorGraphic.circle(padding + size/2, padding+size/2, size/2);
        colorGraphic.fill(color);
        colorGraphic.mask = maskSprite;
        colorGraphic.interactive = true;
        colorGraphic.cursor = 'pointer';
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

        const number = new Text({
            text: `${index+1}`, 
            style: {
                fontFamily: FONT_FAMILY,
                fontSize: 32,
                fontWeight: 600,
                fill: numberColor, 
                align : 'center',
                wordWrap: true,
                wordWrapWidth: 200,
            },
            resolution: RESOLUTION.text
        });
        number.anchor.set(0.5, 0.5);
        number.position.set(wrap.width / 2, colorGraphic.height / 2 - 2);
        number.interactive = true;
        number.cursor = 'pointer';
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

        const wrap = new Container();
        wrap.label = "palette";

        const box = new Graphics();
        box.rect(0, app.screen.height - height, width, height);
        box.fill("F4F4F4");
        wrap.addChild(box);
        
        const circleSize = PALETTE.circle;
        const circleCount = Math.floor((width - padding * 4) / (circleSize));
        const gap = ((width - padding * 2) - (circleCount * circleSize)) / (circleCount - 1);

        let index = 0;
        let startX = padding;

        for (const [colorCode, colorCount] of this.colors.entries()) {
            if (index < 20 && index < circleCount) {
                const circle = this.drawColorCircle(colorCode, false, index);
                circle.x = startX + (gap + circleSize) * index;
                circle.y = app.screen.height - height + padding;

                if (index === 0) {
                    circle.label = "colorFirst";
                } else if (index === 1) {
                    circle.label = "colorSecond";            
                }
                
                wrap.addChild(circle);
            }
            index++;
        }

        app.stage.addChild(wrap);
    }

    findPaletteColor(colorName) {
        const palette = this.app.stage.children.find(c => c.label === "palette");
        const colorsList = palette?.children?.[1] || null;
        if (!colorsList) {
            return null;
        }

        const colorElement = palette.children.find(c => c.label === colorName);
        return colorElement || null;
    }

    drawHand() {
        const app = this.app;

        const hand = Sprite.from('hand');
        this.hand = hand;
        hand.eventMode = 'pass-through'

        const scale = this.levelType === INTERACTIVE_LEVEL ? 0.1 : 0.3;
        const initX = app.screen.width / 2;
        const initY = app.screen.height / 2;

        hand.label = "hand";
        hand.width = hand.width * scale;
        hand.height = hand.height * scale;
        hand.anchor.set(0.5, 0.5);

        hand.x = initX;
        hand.y = initY;

        if (this.levelType === INTERACTIVE_LEVEL) {
            const firstColor = this.findPaletteColor("colorFirst");
            
            if (firstColor) {
                hand.x = firstColor.worldTransform.tx + firstColor.width / 1.75;
                hand.y = firstColor.worldTransform.ty + firstColor.height / 2.75;
                hand.anchor.set(0, 0);
            }
        } else {   
            const text = app.stage.children.find(c => c.label === "text");

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

        const tapToClickText = new Text({
            text: "Tap to Color", 
            style: {
                fontSize: this.isVertical ? 54 : 48,
                fontWeight: 600,
                fontFamily: FONT_FAMILY,
                dropShadow: true,
                dropShadowColor: "white",
                dropShadowBlur: 14,
                dropShadowDistance: 0,
                stroke: "white",
                strokeThickness: 8,
            },
            resolution: RESOLUTION.text
        });
        tapToClickText.label = "text";
        tapToClickText.anchor.set(0.5, 0.5);
        tapToClickText.y = this.isVertical ? 250 : 200;
        tapToClickText.x = app.screen.width / 2;

        app.stage.addChild(tapToClickText);
    }

    async configureSpecialInteractive() {
        const firstColor = this.findPaletteColor("colorFirst");
        if (!firstColor) {
            return;
        }

        let isFirstClicked = false;
        const onClickFirstColor = async () => {
            firstColor.off("pointerdown", onClickFirstColor);

            this.selectedColor = firstColor.color;

            const moveHand = async (x, y) => {
                await gsap.to(this.hand, {
                    x, 
                    y,
                    duration: 1, 
                    repeat: 0, 
                    yoyo: true, 
                    ease: 'Quad.InOut',
                });
            };

            const pictureWrap = this.app.stage.children.find((c) => c.label === "picture");
            const textureWrap = (pictureWrap?.children || [])?.find((c) => c.label === "svgWrap") || null;

            let fX = 0;
            let fY = 0;
            let fScaleX = 1;
            let fScaleY = 1;

            let initPivotY = textureWrap.pivot.y || 0;
            let ended = false;
            
            const activateInteractiveForArea = async () => {
                const onClickPicture = async (e) => {
                    const { x, y } = e.data.global;
                    const difference = 150;

                    const numf = pictureWrap.children[1].children[1];
                    const {
                        tx: numX,
                        ty: numY
                    } = numf.worldTransform;

                    const xPointInArea = x > numX - difference && x < numX + difference;
                    const yPointInArea = y > numY - difference && y < numY + difference;

                    const isClickedAreaAndFilled = yPointInArea && xPointInArea;
                    
                    if (isClickedAreaAndFilled) {
                        textureWrap.off("pointerdown", onClickPicture);

                        textureWrap.children[0].texture = this.coloredTexture;

                        const secondColor = this.findPaletteColor("colorSecond");
                        if (!secondColor) {
                            return;
                        }

                        const x = secondColor.worldTransform.tx + secondColor.width / 1.75;
                        const y = secondColor.worldTransform.ty + secondColor.height / 2.75;
                        moveHand(x, y);

                        const onClickSecondColor = () => {
                            this.configureDefaultInteractive();
                            secondColor.off("pointerdown", onClickSecondColor);
                        }

                        secondColor.on("pointerdown", onClickSecondColor);
                    }
                };

                textureWrap.on("pointerdown", onClickPicture);
            }

            const zoomArea = async () => {
                if (!textureWrap) {
                    return;
                }

                textureWrap.interactive = true;

                const tickerLogic = async (ticker) => {
                    const delta = ticker.deltaMS * 0.05;
                    const coeff = 0.05;

                    if (textureWrap.scale.x < 3) {
                        textureWrap.scale.x += coeff * delta;
                        textureWrap.scale.y += coeff * delta;

                        textureWrap.pivot.y += delta * 2;
                    } else {
                        if (!ended) {
                            ended = true;
                            removeTickerLogic();

                            
                            const numf = pictureWrap.children[1].children[1];
                            await moveHand(numf.worldTransform.tx, numf.worldTransform.ty);

                            await activateInteractiveForArea();
                        }
                    }
                }

                const removeTickerLogic = () => {
                    this.app.ticker.remove(tickerLogic);
                }
                
                this.app.ticker.add(tickerLogic);
            }

            await zoomArea();
        };

        firstColor.on("pointerdown", onClickFirstColor)
    }

    configureDefaultInteractive() {
        const onClick = (e) => {
            if (typeof window?.FbPlayableAd !== 'undefined' && typeof window?.FbPlayableAd.onCTAClick === 'function') {
                window.FbPlayableAd.onCTAClick();
            } else if (typeof window?.ExitApi !== 'undefined' && typeof window?.ExitApi.exit === 'function') {
                window.ExitApi.exit();
            } else {
                alert('Download the game in App Store / Google Play!');
            }
        }

        this.app.stage.eventMode = 'static';
        this.app.stage.hitArea = this.app.screen;

        this.app.stage.on("pointerdown", onClick);
    }

    async configureInteractive() {
        this.app.stage.off("pointerdown");

        if (this.levelType === INTERACTIVE_LEVEL) {
            await this.configureSpecialInteractive();
        } else {
            this.configureDefaultInteractive();
        }
    }

    async startGame() {
        const app = this.app;
        let startData = new Date().getMilliseconds(); 

        this.initSelectedColor();
        this.drawPicture();
        this.drawNumbersInAreas();
        this.drawPalette();

        this.drawText();
        setTimeout(() => {
            this.drawHand();
        }, 0);

        const firstColorAreaElement = this.svgElement.querySelector("[id='firstColor']");
        if (firstColorAreaElement) {
            firstColorAreaElement.classList.remove("uncolored");
        }
        const coloredTexture = await new LevelTexture().createTextureFromHTMLElement(this.svgElement.outerHTML);
        this.coloredTexture = coloredTexture;
        
        await this.configureInteractive();
    }
}