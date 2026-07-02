import { STATE } from "..";
import Level from "./LevelScene";

export function goToLevel(app, levelType) {
    app.stage.removeChildren();
    const level = new Level(app, { levelType });
    STATE.currentPage = level;
    level.startGame();
}

export function findFreeSpaceForNumber(element, fontSize = 12) {
    try {
        const bbox = element.getBBox();

        const isAreaSmall = bbox.width < fontSize * 2 || bbox.height < fontSize * 2;
        if (isAreaSmall) {
            return {
                x: bbox.x + bbox.width / 2,
                y: bbox.y + bbox.height / 2
            };
        }
        
        const points = [];
        const totalLength = element.getTotalLength();
        const step = Math.max(0.5, totalLength / 200);
        
        for (let dist = 0; dist < totalLength; dist += step) {
            const point = element.getPointAtLength(dist);
            points.push({x: point.x, y: point.y});
        }
        
        if (points.length < 3) {
            return {
                x: bbox.x + bbox.width / 2,
                y: bbox.y + bbox.height / 2
            };
        }
        
        const gridSize = Math.max(fontSize, 4);
        const startX = Math.ceil(bbox.x / gridSize) * gridSize;
        const startY = Math.ceil(bbox.y / gridSize) * gridSize;
        const endX = Math.floor((bbox.x + bbox.width) / gridSize) * gridSize;
        const endY = Math.floor((bbox.y + bbox.height) / gridSize) * gridSize;
        
        let bestSpot = null;
        let bestScore = -Infinity;

        for (let x = startX; x <= endX; x += gridSize) {
            for (let y = startY; y <= endY; y += gridSize) {
                if (!isPointInsideElement(element, x, y)) {
                    continue;
                }

                const hasSpace = hasEnoughSpace(element, x, y, fontSize);
                if (hasSpace) {
                    const centerX = bbox.x + bbox.width / 2;
                    const centerY = bbox.y + bbox.height / 2;
                    
                    const distToCenter = Math.sqrt(
                        Math.pow(x - centerX, 2) + 
                        Math.pow(y - centerY, 2)
                    );
                    
                    const maxDist = Math.sqrt(
                        Math.pow(bbox.width / 2, 2) + 
                        Math.pow(bbox.height / 2, 2)
                    );
                    const normalizedDist = maxDist > 0 ? distToCenter / maxDist : 0;
                    
                    const thicknessScore = getThicknessScore(element, x, y, fontSize);
                    const score = (1 - normalizedDist) * 0.7 + thicknessScore * 0.3;
                    
                    if (score > bestScore) {
                        bestScore = score;
                        bestSpot = {x, y};
                    }
                }
            }
        }

        if (!bestSpot) {
            return {
                x: bbox.x + bbox.width / 2,
                y: bbox.y + bbox.height / 2
            };
        }
        
        return bestSpot;
        
    } catch (error) {
        const bbox = element.getBBox();
        return {
            x: bbox.x + bbox.width / 2,
            y: bbox.y + bbox.height / 2
        };
    }
}

function isPointInsideElement(element, x, y) {
    try {
        const svg = element.ownerSVGElement;
        const pt = svg.createSVGPoint();
        pt.x = x;
        pt.y = y;
        
        return element.isPointInFill(pt) || element.isPointInStroke(pt);
    } catch (error) {
        return false;
    }
}

function hasEnoughSpace(element, x, y, fontSize) {
    const halfSize = fontSize / 2;
    const step = Math.max(1, fontSize / 4);
    
    const checkPoints = [
        [0, 0],
        [-halfSize, 0],
        [halfSize, 0],
        [0, -halfSize],
        [0, halfSize],
        [-halfSize, -halfSize],
        [halfSize, -halfSize],
        [-halfSize, halfSize],
        [halfSize, halfSize],
    ];

    for (let dx = -halfSize; dx <= halfSize; dx += step) {
        for (let dy = -halfSize; dy <= halfSize; dy += step) {
            const checkX = x + dx;
            const checkY = y + dy;
            
            if (!isPointInsideElement(element, checkX, checkY)) {
                return false;
            }
        }
    }
    
    return true;
}

function getThicknessScore(element, x, y, fontSize) {
    let thickness = 0;
    const directions = [
        [1, 0], [-1, 0], [0, 1], [0, -1],
        [1, 1], [-1, -1], [1, -1], [-1, 1]
    ];
    
    const maxDistance = fontSize * 4;
    
    for (const [dx, dy] of directions) {
        let distance = 0;
        let currentX = x;
        let currentY = y;

        while (distance < maxDistance) {
            currentX += dx * 0.5;
            currentY += dy * 0.5;
            distance += 0.5;
            
            if (!isPointInsideElement(element, currentX, currentY)) {
                break;
            }
        }
        
        thickness += distance;
    }

    const maxThickness = maxDistance * directions.length;
    return thickness / maxThickness;
}