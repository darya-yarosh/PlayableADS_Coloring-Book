import { COLORS } from "../../constants/levels";

export const getColoredElements = (element) => {
    return element.querySelectorAll("[fill], [class], [style]");
}

export const getElementColor = (element, elementParent) => {
    if (!element) {
        return null;
    }

    const attributeColor = element.getAttribute("fill");
    if (attributeColor) {
        return attributeColor;
    }

    const styleColor = element.style.fill;
    if (styleColor) {
        return styleColor;
    }

    const styleElements = elementParent.querySelectorAll("style");
    let foundColor = null;
    
    const className = element.getAttribute("class");
    if (className) {
        for (let styleEl of styleElements) {
            const styleText = styleEl.textContent;
            
            const classRegex = new RegExp(
                `\\.${className}\\s*(?::[\\w-]+)?\\s*\\{([^}]*)\\}`,
                'g'
            );
            
            let match;
            while ((match = classRegex.exec(styleText)) !== null) {
                const properties = match[1];
                
                const fillRegex = /fill\s*:\s*([^;]+);?/;
                const fillMatch = properties.match(fillRegex);
                
                if (fillMatch) {
                    foundColor = fillMatch[1].trim();
                    break;
                }
            }
            
            if (foundColor) {
                break;
            }
        }
    }

    if (foundColor) {
        return foundColor;
    }

    const computedStyle = window.getComputedStyle(element);
    return computedStyle?.fill || null;
}

const getFormattedColors = (svgElement) => {
    const coloredParts = getColoredElements(svgElement);

    const colors = new Map();

    coloredParts.forEach((part, index) => {
        const color = getElementColor(part, svgElement);
        if (color === "none" || !color) {
            return;
        }

        const currentCount = colors.get(color) || 0;
        colors.set(color, currentCount + 1);

        part.classList.add("uncolored");
    });

    return colors;
}                             

export const sortColors = (colors) => {
    const entries = Array.from(colors.entries());
    entries.sort((a, b) => b[1] - a[1]);

    const priorityValues = COLORS.colors;

    const priorityEntries = [];
    const remainingEntries = [];

    for (const entry of entries) {
        const colorCode = entry[0];
        const priorityIndex = priorityValues.indexOf(colorCode);
        
        if (priorityIndex !== -1) {
            priorityEntries[priorityIndex] = entry;
        } else {
            remainingEntries.push(entry);
        }
    }

    const finalEntries = [
        ...priorityEntries.filter(entry => entry !== undefined),
        ...remainingEntries
    ];
    return new Map(finalEntries);
}

export const initColors = async (svgElement) => {
    return await sortColors(getFormattedColors(svgElement));
}