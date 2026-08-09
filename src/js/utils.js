import { Texture, ImageSource, CanvasSource, Assets  } from "pixi.js";

import { STATE } from "..";

import Level from "./LevelScene";

export const formatPictureToElement = async (app, levelType, size, isPositioned = true) =>{
    const svgResult = await fetch(app.svgLevels[levelType]);
    const svgText = await svgResult.text();
    if (!isPositioned) {
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
        const svgElement = svgDoc.documentElement;
        return svgElement;
    }

    const styledSvg = svgText.replace(
        '<svg',
        `<svg style="
            width: ${size}px; 
            height: ${size}px;
            ${isPositioned ? "" : ""}
            ${isPositioned ? " position: absolute;" : ""}
            ${isPositioned ? " margin: auto;" : ""}
            "
            width="${size}" 
            height="${size}"
        `
    );
    
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(styledSvg, 'image/svg+xml');
    const svgElement = svgDoc.documentElement;
    return svgElement;
}

export const goToLevel = async (app, levelType) => {
    app.stage.removeChildren();

    const level = new Level(app, { levelType });
    STATE.currentPage = level;
    
    await level.startGame();
}

export const waitLoadBaseRexture = async (baseTexture) => {
    await new Promise((resolve) => {
        if (baseTexture.valid) {
            resolve();
        } else {
            baseTexture.once('loaded', resolve);
            // baseTexture.once('error', reject);
        }
    });
}

export const createTextureFromHTMLElement = async (element) => {
    const svgString = element;

    const texture = await Assets.load({
        src: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`,
        data: {
            resolution: 9,
            scaleMode: 'linear',
            autoGenerateMipmaps: true,
        }
    });
    return texture;
}