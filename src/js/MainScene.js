const { Assets, Container, Graphics, GraphicsContext, Sprite, Text, Texture } = PIXI;

import { gsap } from "gsap";
import { PixiPlugin } from "gsap/PixiPlugin";

import { FONT_FAMILY } from '../constants/font';
import { LEVEL_COUNT, LEVELS } from '../constants/levels';
import { FRAME_PADDING, RESOLUTION } from '../constants/assets';

import { goToLevel } from './utils';
import { initColors } from './utils/colors';

import LevelTexture from './LevelTexture';

export const PRELOADED_LEVELS = {};

export default class Main {
    constructor (application) {
        this.app = application;
        this.isVertical = this.app?.screen?.width ? this.app.screen.width < this.app.screen.height : true;
    }

    handleResize(isLandscape) {
        if (this.app) {
            this.isVertical = !isLandscape;
            this.app.stage.removeChildren();
            this.startGame();
        }
    }

    drawHeader() {
        const headerText = new Text({
            text: "Choose category", 
            style: {
                fontFamily: FONT_FAMILY,
                fontSize: 48,
                fontWeight: 600,
                fill: 0x3a3a3a, 
                align : 'center',
                wordWrap: this.isVertical,
                wordWrapWidth: 200,
            },
            resolution: RESOLUTION.text,
        });
        headerText.anchor.set(0.5, 0.5);
        headerText.x = this.app.screen.width / 2;
        headerText.y = 0 + 40 + headerText.height / 2;
        this.app.stage.addChild(headerText);
    }

    async createLevelCell(x, y, data, width, height) {
        const {
            label,
            cover,
            level,
        } = data;

        const wrap = new Container();
        const wrapSprite = Sprite.from(Assets.get('cell'));
        const padding = FRAME_PADDING * (width * 1 / wrapSprite.width);
        wrapSprite.width = width;
        wrapSprite.height = height;
        wrapSprite.x = 0;
        wrapSprite.y = 0;

        const maskSprite = Sprite.from(Assets.get('cell'));
        maskSprite.width = width;
        maskSprite.height = height;
        maskSprite.x = 0;
        maskSprite.y = 0;

        const innerSprite = Sprite.from(Assets.get(cover));
        innerSprite.width = width;
        innerSprite.height = height;
        innerSprite.x = 0;
        innerSprite.y = 0;
        innerSprite.mask = maskSprite;

        const labelSprite = Sprite.from(Assets.get(label));
        const difference = labelSprite.width < width / 2 
            ? labelSprite.width * 1 / (width / 2)
            : (width / 2) * 1 / labelSprite.width;

        labelSprite.scale.set(difference, difference);
        labelSprite.x = width - labelSprite.width - padding;
        labelSprite.y = width - labelSprite.height - padding;
        labelSprite.mask = maskSprite;

        wrap.addChild(wrapSprite);
        wrap.addChild(innerSprite);
        wrap.addChild(maskSprite); 
        wrap.addChild(labelSprite); 

        wrap.x = x;
        wrap.y = y;
        
        innerSprite.eventMode = 'static';
        innerSprite.cursor = 'pointer';
        innerSprite.dynamic = true;
        innerSprite.on("pointerdown", async () => {
            gsap.killTweensOf([this.hand, this.hand.scale]);
            await this.preloadLevel(level);
            await goToLevel(this.app, level);
        })

        return wrap;
    }

    getCellSizes() {
        let gap = 20;

        if (!this.isVertical) {
            return (this.app.screen.width - (gap * 5)) / 4;
        }

        const defaultWidth = (this.app.screen.width - (gap * 3)) / 2;
        if (defaultWidth < this.app.screen.height / 2) {
            gap = 60;
            return (this.app.screen.width - (gap * 3)) / 2;
        } else {
            return defaultWidth;
        }
    }
    
    async drawLevelsList() {
        const wrap = new Container();
        wrap.label = "levelsList";

        const rows = this.isVertical ? 2 : 1;
        const columns = this.isVertical ? 2 : 4;
        const spiralledLevels = this.drawSpiralLevelsList(rows, columns, LEVELS);
        const size = this.getCellSizes();
        const cellWidth = size;
        const cellHeight = size;
        
        const gap = 20;
        const promises = spiralledLevels.map(async (level, index) => {
            const {
                row,
                col,
                data
            } = level;
            const x = col * (gap + cellWidth);
            const y = row * (gap + cellHeight);

            const cell = await this.createLevelCell(x, y, data, cellWidth, cellHeight);
            wrap.addChild(cell);
        });

        await Promise.all(promises);

        wrap.y = this.isVertical ? 300 : 150;
        wrap.x = this.app.screen.width / 2 - wrap.width / 2;
        this.app.stage.addChild(wrap);
    }

    drawSpiralLevelsList(rows, cols, cellData) {
        const cells = [];
        let top = 0;
        let bottom = rows - 1;
        let left = 0;
        let right = cols - 1;
        let index = 0;
        
        while (top <= bottom && left <= right) {
            // Top row (from left to right)
            for (let i = left; i <= right; i++) {
                cells.push({
                    row: top,
                    col: i,
                    data: cellData[index++]
                });
            }
            top++;
            
            // Right column (from top to bottom)
            for (let i = top; i <= bottom; i++) {
                cells.push({
                    row: i,
                    col: right,
                    data: cellData[index++]
                });
            }
            right--;
            
            // Bottom row (from right to left)
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
            
            // Left column (from bottom to top)
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
        const hand = Sprite.from(Assets.get('hand'));
        this.app.stage.addChild(hand)
        
        hand.scale.set(0.3);
        
        const durationPerCell = 0.8;
        gsap.to(hand.scale, {
            x: 0.2, y: 0.2, duration: (durationPerCell + 0.3) / 2, repeat: -1, yoyo: true, ease: 'Quad.InOut',
        })

        const cellsWrapper = this.app.stage.children.find(c => c.label === "levelsList");
        if (!cellsWrapper) {
            return;
        }

        const cells = cellsWrapper?.children ?? [];

        let currentIndex = 0;

        const moveToNextCell = () => {
            const cell = cells[currentIndex];
            const targetX = cellsWrapper.x + cell.x + cell.width / 2;
            const targetY = cellsWrapper.y + cell.y + cell.height / 2;

            gsap.to(hand, {
                x: targetX,
                y: targetY,
                duration: durationPerCell,
                ease: 'Quad.InOut',
                onComplete: () => {
                    currentIndex = (currentIndex + 1) % cells.length;
                    setTimeout(moveToNextCell, 300); 
                }
            });
        };

        const firstCell = cells[0];
        if (!firstCell) {
            return;
        }

        hand.x = cellsWrapper.x + firstCell.x + firstCell.width / 2;
        hand.y = cellsWrapper.y + firstCell.y + firstCell.height / 2;

        setTimeout(() => {
            currentIndex = 1;
            setTimeout(moveToNextCell, 300);
        }, 0);

        this.hand = hand;
    }

    drawFooter() {
        const footerText = new Text({
            text: "Happy Color", 
            style: {
                fontFamily: FONT_FAMILY,
                fill: 0x000000,
                fontWeight: 600,
                fontSize: this.isVertical ? 36 : 42,
            },
            resolution: RESOLUTION.text
        });
        footerText.anchor.set(0.5, 0.5);
        footerText.x = this.app.screen.width / 2;
        footerText.y = this.app.screen.height - 80 - footerText.height / 2;
        this.app.stage.addChild(footerText);
    }

    async preloadLevel(levelType) {
        const size = this.isVertical ? this.app.screen.width - 100 : this.app.screen.height - 200;

        const levelTextureData = new LevelTexture();
        PRELOADED_LEVELS[levelType] = await levelTextureData.init(this.app, levelType, size);
    }

    async startGame() {
        this.drawHeader();
        await this.drawLevelsList();
        this.drawHand();
        this.drawFooter();
    }
}