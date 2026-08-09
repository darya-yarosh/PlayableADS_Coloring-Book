import { Assets } from "pixi.js";

import { COLORS } from "../constants/levels";

import { formatPictureToElement } from "./utils";
import { initColors } from "./utils/colors";

export default class LevelTexture {
    constructor() {
        this.svgElement = null;
        this.colors = [];
        this.texture = null;
    }                           

    setCustomStyles() {
        const def = document.createElement("def");
        const style = document.createElement("style");
        style.innerHTML = "svg { overflow: hidden; } svg >* { transition: transform 2s; } .uncolored { fill: white !important; pointer-events: visiblePainted;  } .zoomed >* { transform: scale(2); transform-origin: left; }";
        def.appendChild(style);
        this.svgElement.appendChild(def);
    }

    async createTextureFromHTMLElement(elementHTML) {
        const texture = await Assets.load({
            src: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(elementHTML)}`,
            data: {
                resolution: 9,
                scaleMode: 'linear',
                autoGenerateMipmaps: true,
            }
        });
        return texture;
    }

    async init(app, levelType, size) {
        this.svgElement = await formatPictureToElement(app, levelType, size);
        this.colors = await initColors(this.svgElement);

        this.setCustomStyles();
        this.texture = await this.createTextureFromHTMLElement(this.svgElement.outerHTML);

        const formattedLevelData = {
            svgElement: this.svgElement,
            colors: this.colors,
            texture: this.texture,
        }

        return formattedLevelData;
    }
}