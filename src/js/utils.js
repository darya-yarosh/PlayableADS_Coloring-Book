import Level from "./LevelScene";

export function goToLevel(app, levelType) {
    app.stage.removeChildren();
    const level = new Level(app, { levelType });
    level.startGame();
}