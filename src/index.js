import * as PIXI from 'pixi.js';
import { gsap } from "gsap";
import { PixiPlugin } from "gsap/PixiPlugin";
import Preloader from "./js/PreloaderScene.js";
import Main from './js/MainScene.js';

const size = [540, 960];

const app = new PIXI.Application({
    width: size[0],
    height: size[1],
    resolution: window.devicePixelRatio,
    background: 0xEDE8E5
});

document.body.appendChild(app.view);

gsap.registerPlugin(PixiPlugin);

const preloader = new Preloader(app);
await preloader.startLoad();

const game = new Main(app);

game.startGame();

function resize() {
    const ratio = size[0] / size[1];
    
    if (window.innerWidth / window.innerHeight >= ratio) {
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
        app.view.style.top = (window.innerHeight / 2 - alto / 2) + 'px';
    }
}

resize();
window.onresize = resize;