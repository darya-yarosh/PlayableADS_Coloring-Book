import { MIPMAP_MODES, SCALE_MODES } from "pixi.js";

const RESOLUTION = 2;

export const SETTINGS_BASE_TEXTURE = {
    scaleMode: SCALE_MODES.LINEAR,
    resolution: RESOLUTION,
    mipmap: MIPMAP_MODES.ON,
}

export const SETTINGS_SVG_RESOURCE = {
    scale: RESOLUTION,
    autoLoad: true,
}
