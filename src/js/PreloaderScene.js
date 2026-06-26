import * as PIXI from "pixi.js"
import { sound } from "@pixi/sound";
import { Assets } from "@pixi/assets";

// PNG
import hand from "../img/interface/Hand.png";
import cell from "../img/interface/ImageFrame.png";
import coverA from "../img/covers/Anime.png";
import coverB from "../img/covers/Animals.png";
import coverC from "../img/covers/Fantasy.png";
import coverD from "../img/covers/Mandalas.png";

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
    constructor (application) {
        app = application
    }

    async loadFont() {
        try {
            const font = new FontFace('Poppins', fontUrl);
            await font.load();
            document.fonts.add(font);
            console.log('✅ Шрифт Poppins загружен');
        } catch (e) {
            console.warn('⚠️ Ошибка загрузки шрифта:', e);
        }
    }

    loadPNG() {
        app.loader
            .add('hand', hand)
            .add('cell', cell)
            .add("coverA", coverA)
            .add("coverB", coverB)
            .add("coverC", coverC)
            .add("coverD", coverD);
    }

    loadSVG() {
        const svgTextures = {
            typeA: PIXI.Texture.from(typeA, {
                width: 650,
                height: 650
            }),
            typeB: PIXI.Texture.from(typeB, {
                width: 650,
                height: 650
            }),
            typeC: PIXI.Texture.from(typeC, {
                width: 650,
                height: 650
            }),
            typeD: PIXI.Texture.from(typeD, {
                width: 650,
                height: 650
            }),
        };

        app.svgTextures = svgTextures
    }

    loadSound() {
        sound
            .add('sound_fx', sound_fxA)
    }

    async startLoad() {
        console.log('%c  %c PreloaderScene ', 'background:#d6cc28','color: #d6cc28; background: #000; font-size:10pt')

        try {
            const font = new FontFace('Poppins', fontUrl);
            await font.load();
            document.fonts.add(font);
            console.log('✅ Шрифт Poppins загружен');
        } catch (e) {
            console.warn('⚠️ Ошибка загрузки шрифта:', e);
        }

        this.loadPNG();
        
        await this.loadFont();

        //this.loadSVG();

        //this.loadSound();

        return new Promise((resolve) => {
            resolve();
        });

    }
}

