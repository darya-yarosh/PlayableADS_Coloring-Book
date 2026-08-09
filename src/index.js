import { Application, extensions, SCALE_MODES, TickerPlugin } from 'pixi.js';

import { gsap } from "gsap";
import { PixiPlugin } from "gsap/PixiPlugin";
import Preloader from "./js/PreloaderScene.js";
import Main from './js/MainScene.js';

extensions.add(TickerPlugin);

export const STATE = {
    currentPage: null,
};

const app = new Application();

const initApplication = async () => {
    const isLandscape = window.innerWidth > window.innerHeight;

    const width = 540;
    const height = 960;
    const verticalSize = [width, height];
    const horizontalSize = [height, width];
    const currentSize = isLandscape ? horizontalSize : verticalSize;

    await app.init({
        width: currentSize[0],
        height: currentSize[1],
        resolution: Math.min(window.devicePixelRatio || 1, 2),
        autoDensity: true,
        autoStart: true,
        antialias: true,
        backgroundColor: 0xEDE8E5,
        backgroundAlpha: 1,
    });

    document.body.appendChild(app.canvas);

    gsap.registerPlugin(PixiPlugin);

    const preloader = new Preloader(app);
    await preloader.startLoad();

    const game = new Main(app);
    STATE.currentPage = game;
    await game.startGame();

    const resize = () => {
        const isLandscape = window.innerWidth > window.innerHeight;
        const size = isLandscape ? horizontalSize : verticalSize;
        const ratio = size[0] / size[1];

        const isWidthChanged = app.renderer.width !== size[0];
        const isHeightChanged = app.renderer.height !== size[1];
        if (isWidthChanged || isHeightChanged) {
            app.renderer.resize(size[0], size[1]);
            STATE.currentPage.handleResize?.(isLandscape);
        }
        
        const isScreenWidthWiderThanApp = window.innerWidth / window.innerHeight >= ratio;
        if (isScreenWidthWiderThanApp) {
            const ancho = ~~(window.innerHeight * ratio);
            const alto = window.innerHeight;
            app.canvas.style.position = 'absolute';
            app.canvas.style.width = ancho + 'px';
            app.canvas.style.height = alto + 'px';
            app.canvas.style.left = ~~((window.innerWidth - ancho) / 2) + 'px';
            app.canvas.style.top = '0px';
        } else {
            const ancho = window.innerWidth;
            const alto = ~~(window.innerWidth / ratio);
            app.canvas.style.position = 'absolute';
            app.canvas.style.width = ancho + 'px';
            app.canvas.style.height = alto + 'px';
            app.canvas.style.left = '0px';
            app.canvas.style.top = ~~((window.innerHeight - alto) / 2) + 'px';
        }
    }

    window.addEventListener('orientationchange', () => {
        setTimeout(resize, 300);
    });

    window.addEventListener('resize', resize);

    setTimeout(resize, 0);
};

await initApplication();