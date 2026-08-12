import { MIPMAP_MODES } from "pixi.js";

export const FRAME_PADDING = 26;

export const RESOLUTION = {
    text: 2,
    img: 8,
    svg: 1,
}

const SCALE_MODES = {
    LINEAR: "linear",
    NEAREST: "nearest",
};

export const SETTINGS_PNG_RESOURCE = {
    scaleMode: SCALE_MODES.LINEAR,
    autoGenerateMipmaps: true,
    antialias: true,
}

export const SETTINGS_SVG_RESOURCE = {
    resolution: RESOLUTION.svg,
    parseAsGraphicsContext: true,
}