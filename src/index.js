import * as PIXI from 'pixi.js';
import { gsap } from "gsap";
import { PixiPlugin } from "gsap/PixiPlugin";
import Preloader from "./js/PreloaderScene.js";
import Main from './js/MainScene.js';

const isLandscape = window.innerWidth > window.innerHeight;

const width = window.innerWidth > 540 ? 540: window.innerWidth;
const height = window.innerHeight > 960 ? 960 : window.innerHeight;
const verticalSize = [width, height];
const horizontalSize = [height, width];
const currentSize = isLandscape ? horizontalSize : verticalSize;

const app = new PIXI.Application({
    width: currentSize[0],
    height: currentSize[1],
    resolution: window.devicePixelRatio,
    background: 0xEDE8E5
});

document.body.appendChild(app.view);

gsap.registerPlugin(PixiPlugin);

const preloader = new Preloader(app);
await preloader.startLoad();

const game = new Main(app);
game.startGame();
export const STATE = {
    currentPage: game,
};

function resize() {
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
        app.view.style.position = 'absolute';
        app.view.style.width = ancho + 'px';
        app.view.style.height = alto + 'px';
        app.view.style.left = ~~((window.innerWidth - ancho) / 2) + 'px';
        app.view.style.top = '0px';
    } else {
        const ancho = window.innerWidth;
        const alto = ~~(window.innerWidth / ratio);
        app.view.style.position = 'absolute';
        app.view.style.width = ancho + 'px';
        app.view.style.height = alto + 'px';
        app.view.style.left = '0px';
        app.view.style.top = ~~((window.innerHeight - alto) / 2) + 'px';
    }
}

window.addEventListener('orientationchange', () => {
    setTimeout(resize, 300);
});

window.addEventListener('resize', resize);

setTimeout(resize, 0);