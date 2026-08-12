import { Assets } from 'pixi.js';

// PNG
import hand from "../img/interface/Hand.png";
import cell from "../img/interface/ImageFrame.png";
import cellCircle from "../img/interface/UI_CircleElements.png";

import labelA from "../img/covers/Label_Anime.png";
import labelB from "../img/covers/Label_Animals.png";
import labelC from "../img/covers/Label_Fantasy.png";
import labelD from "../img/covers/Label_Mandalas.png";

// SVG
import levelA from "../img/levels/Anime.svg";
import levelB from "../img/levels/Animals.svg";
import levelC from "../img/levels/Fantasy.svg";
import levelD from "../img/levels/Mandalas.svg";

// Font
import font from "../fonts/Poppins.woff2";
import { FONT_FAMILY } from '../constants/font';
import { RESOLUTION, SETTINGS_PNG_RESOURCE, SETTINGS_SVG_RESOURCE } from '../constants/assets';

let app;

export default class Preloader {
    constructor(application) {
        app = application;
    }

    async loadFont() {
        await Assets.load({
            alias: FONT_FAMILY,
            src: font,
            data: {
                family: FONT_FAMILY,
                format: 'woff2'
            }
        });
    }

    async loadPNG() {
        const data = SETTINGS_PNG_RESOURCE;
        const svgData = {
            ...data,
            resolution: RESOLUTION.img
        };

        Assets.add({alias: 'hand', src: hand, data});
        Assets.add({alias: 'cell', src: cell, data});
        Assets.add({alias: 'cellCircle', src: cellCircle, data});
        Assets.add({alias: 'coverA', src: levelA, data: svgData});
        Assets.add({alias: 'coverB', src: levelB, data: svgData});
        Assets.add({alias: 'coverC', src: levelC, data: svgData});
        Assets.add({alias: 'coverD', src: levelD, data: svgData});
        Assets.add({alias: 'labelA', src: labelA, data});
        Assets.add({alias: 'labelB', src: labelB, data});
        Assets.add({alias: 'labelC', src: labelC, data});
        Assets.add({alias: 'labelD', src: labelD, data});

        await Assets.load([
            'hand', 'cell', 'cellCircle',
            'coverA', 'coverB', 'coverC', 'coverD',
            'labelA', 'labelB', 'labelC', 'labelD'
        ]);
    }

    async loadSVG() {
        try {
            const data = SETTINGS_SVG_RESOURCE;

            const textureA = await Assets.load(
                { src: levelA, data } 
            );
            const textureB = await Assets.load(
                { src: levelB, data }
            )
            const textureC = await Assets.load(
                { src: levelC, data }
            )
            const textureD = await Assets.load(
                { src: levelD, data }
            )

            app.svgLevels = {
                typeA: levelA,
                typeB: levelB,
                typeC: levelC,
                typeD: levelD,
            }

            app.svgTextures = {
                typeA: textureA,
                typeB: textureB,
                typeC: textureC,
                typeD: textureD,
            }
        } catch (e) {
            console.warn('⚠️ Ошибка загрузки SVG:', e);
        }
    }

    async startLoad() {
        try {
            await Promise.all([
                this.loadFont(),
                this.loadPNG(),
                this.loadSVG()
            ]);
            
            return new Promise((resolve) => {
                resolve();
            });
        } catch (e) {
            console.error('❌ Ошибка загрузки ресурсов:', e);
            throw e;
        }
    }
}