import * as PIXI from "pixi.js";
import { sound } from "@pixi/sound";

// PNG
import hand from "../img/interface/Hand.png";
import cell from "../img/interface/ImageFrame.png";
import cellCircle from "../img/interface/UI_CircleElements.png";
import coverA from "../img/covers/Anime.png";
import coverB from "../img/covers/Animals.png";
import coverC from "../img/covers/Fantasy.png";
import coverD from "../img/covers/Mandalas.png";
import labelA from "../img/covers/Label_Anime.png";
import labelB from "../img/covers/Label_Animals.png";
import labelC from "../img/covers/Label_Fantasy.png";
import labelD from "../img/covers/Label_Mandalas.png";

// SVG
import levelA from "../img/levels/Anime.svg";
import levelB from "../img/levels/Animals.svg";
import levelC from "../img/levels/Fantasy.svg";
import levelD from "../img/levels/Mandalas.svg";

// Sound
import sound_fxA from "../audio/sound_fx.mp3";

// Font
import { fontUrl } from "../constants/font";

let app;

export default class Preloader {
    constructor(application) {
        app = application;
    }

    async loadFont() {
        try {
            const font = new FontFace("Poppins", fontUrl);
            await font.load();
            document.fonts.add(font);
            console.log(`✅ Шрифт Poppins загружен`);
        } catch (e) {
            console.warn('⚠️ Ошибка загрузки шрифта:', e);
        }
    }

    async loadPNG() {
        PIXI.Assets.add('hand', hand);
        PIXI.Assets.add('cell', cell);
        PIXI.Assets.add('cellCircle', cellCircle);
        PIXI.Assets.add('coverA', coverA);
        PIXI.Assets.add('coverB', coverB);
        PIXI.Assets.add('coverC', coverC);
        PIXI.Assets.add('coverD', coverD);
        PIXI.Assets.add('labelA', labelA);
        PIXI.Assets.add('labelB', labelB);
        PIXI.Assets.add('labelC', labelC);
        PIXI.Assets.add('labelD', labelD);

        const textures = await PIXI.Assets.load([
            'hand', 'cell', 'cellCircle',
            'coverA', 'coverB', 'coverC', 'coverD',
            'labelA', 'labelB', 'labelC', 'labelD'
        ]);

        app.textures = textures;
        console.log('✅ PNG загружены');
    }

    async loadSVG() {
        try {
            const resolution = 1;

            PIXI.Assets.add('levelA', levelA);
            PIXI.Assets.add('levelB', levelB);
            PIXI.Assets.add('levelC', levelC);
            PIXI.Assets.add('levelD', levelD);

            const textures = await PIXI.Assets.load([
                { src: 'levelA', data: { resolution } },
                { src: 'levelB', data: { resolution } },
                { src: 'levelC', data: { resolution } },
                { src: 'levelD', data: { resolution } }
            ]);

            app.svgTextures = {
                typeA: textures.levelA || textures[0],
                typeB: textures.levelB || textures[1],
                typeC: textures.levelC || textures[2],
                typeD: textures.levelD || textures[3]
            };

            console.log('✅ SVG загружены');
        } catch (e) {
            console.warn('⚠️ Ошибка загрузки SVG:', e);
        }
    }

    loadSound() {
        sound.add('sound_fx', sound_fxA);
        console.log('✅ Звук загружен');
    }

    async startLoad() {
        console.log('%c  %c PreloaderScene ', 'background:#d6cc28', 'color: #d6cc28; background: #000; font-size:10pt');

        try {
            await Promise.all([
                this.loadFont(),
                this.loadPNG(),
                this.loadSVG()
            ]);

            this.loadSound();

            console.log('✅ Все ресурсы загружены');
            
            return new Promise((resolve) => {
                resolve();
            });
        } catch (e) {
            console.error('❌ Ошибка загрузки ресурсов:', e);
            throw e;
        }
    }
}