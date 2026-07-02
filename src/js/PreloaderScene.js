import { Assets } from 'pixi.js';

// PNG
import hand from "../img/interface/Hand.png";
import cell from "../img/interface/ImageFrame.png";
import cellCircle from "../img/interface/UI_CircleElements.png";
// import coverA from "../img/covers/Anime.png";
// import coverB from "../img/covers/Animals.png";
// import coverC from "../img/covers/Fantasy.png";
// import coverD from "../img/covers/Mandalas.png";
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

let app;

export default class Preloader {
    constructor(application) {
        app = application;
    }

    async loadFont() {
        await Assets.load({
            src: font,
            data: {
                family: "Poppins",
            }
        });
    }

    async loadPNG() {
        Assets.add('hand', hand);
        Assets.add('cell', cell);
        Assets.add('cellCircle', cellCircle);
        Assets.add('coverA', levelA);
        Assets.add('coverB', levelB);
        Assets.add('coverC', levelC);
        Assets.add('coverD', levelD);
        Assets.add('labelA', labelA);
        Assets.add('labelB', labelB);
        Assets.add('labelC', labelC);
        Assets.add('labelD', labelD);

        await Assets.load([
            'hand', 'cell', 'cellCircle',
            'coverA', 'coverB', 'coverC', 'coverD',
            'labelA', 'labelB', 'labelC', 'labelD'
        ]);
        
        console.log('✅ PNG загружены');
    }

    async loadSVG() {
        try {
            const resolution = 1;

            Assets.add('levelA', levelA);
            Assets.add('levelB', levelB);
            Assets.add('levelC', levelC);
            Assets.add('levelD', levelD);

            const textures = await Assets.load([
                { src: 'levelA', data: { resolution } },
                { src: 'levelB', data: { resolution } },
                { src: 'levelC', data: { resolution } },
                { src: 'levelD', data: { resolution } }
            ]);

            app.svgLevels = {
                typeA: levelA,
                typeB: levelB,
                typeC: levelC,
                typeD: levelD,
            }

            console.log('✅ SVG загружены');
        } catch (e) {
            console.warn('⚠️ Ошибка загрузки SVG:', e);
        }
    }

    async startLoad() {
        console.log('%c  %c PreloaderScene ', 'background:#d6cc28', 'color: #d6cc28; background: #000; font-size:10pt');

        try {
            await Promise.all([
                this.loadFont(),
                this.loadPNG(),
                this.loadSVG()
            ]);

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