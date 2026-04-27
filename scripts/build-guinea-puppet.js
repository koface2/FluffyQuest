const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const rootDir = path.resolve(__dirname, '..');
const atlasJsonPath = path.join(rootDir, 'assets', 'sprites', 'guineaparts.json');

function ensureDir(dirPath) {
    fs.mkdirSync(dirPath, { recursive: true });
}

function readPng(filePath) {
    return PNG.sync.read(fs.readFileSync(filePath));
}

function writePng(filePath, png) {
    ensureDir(path.dirname(filePath));
    fs.writeFileSync(filePath, PNG.sync.write(png));
}

function copyRegion(source, frame) {
    const target = new PNG({ width: frame.w, height: frame.h });

    for (let y = 0; y < frame.h; y += 1) {
        for (let x = 0; x < frame.w; x += 1) {
            const sourceIndex = ((frame.y + y) * source.width + (frame.x + x)) << 2;
            const targetIndex = (y * frame.w + x) << 2;
            source.data.copy(target.data, targetIndex, sourceIndex, sourceIndex + 4);
        }
    }

    return target;
}

function blendPixel(target, targetIndex, r, g, b, a) {
    const sourceAlpha = a / 255;
    if (sourceAlpha <= 0) {
        return;
    }

    const targetAlpha = target.data[targetIndex + 3] / 255;
    const outAlpha = sourceAlpha + targetAlpha * (1 - sourceAlpha);

    if (outAlpha <= 0) {
        return;
    }

    const nextRed = ((r * sourceAlpha) + (target.data[targetIndex] * targetAlpha * (1 - sourceAlpha))) / outAlpha;
    const nextGreen = ((g * sourceAlpha) + (target.data[targetIndex + 1] * targetAlpha * (1 - sourceAlpha))) / outAlpha;
    const nextBlue = ((b * sourceAlpha) + (target.data[targetIndex + 2] * targetAlpha * (1 - sourceAlpha))) / outAlpha;

    target.data[targetIndex] = Math.round(nextRed);
    target.data[targetIndex + 1] = Math.round(nextGreen);
    target.data[targetIndex + 2] = Math.round(nextBlue);
    target.data[targetIndex + 3] = Math.round(outAlpha * 255);
}

function drawScaled(source, target, topLeftX, topLeftY, scale) {
    const scaledWidth = Math.max(1, Math.round(source.width * scale));
    const scaledHeight = Math.max(1, Math.round(source.height * scale));

    for (let y = 0; y < scaledHeight; y += 1) {
        const targetY = topLeftY + y;
        if (targetY < 0 || targetY >= target.height) {
            continue;
        }

        const sourceY = Math.min(source.height - 1, Math.max(0, Math.floor(y / scale)));

        for (let x = 0; x < scaledWidth; x += 1) {
            const targetX = topLeftX + x;
            if (targetX < 0 || targetX >= target.width) {
                continue;
            }

            const sourceX = Math.min(source.width - 1, Math.max(0, Math.floor(x / scale)));
            const sourceIndex = (sourceY * source.width + sourceX) << 2;
            const alpha = source.data[sourceIndex + 3];

            if (alpha === 0) {
                continue;
            }

            const targetIndex = (targetY * target.width + targetX) << 2;
            blendPixel(
                target,
                targetIndex,
                source.data[sourceIndex],
                source.data[sourceIndex + 1],
                source.data[sourceIndex + 2],
                alpha
            );
        }
    }
}

function resolveAnchorPixels(part, frameData) {
    if (part.anchor.mode === 'source-px' || part.anchor.mode === 'pixel') {
        return {
            x: part.anchor.x * part.scale,
            y: part.anchor.y * part.scale,
        };
    }

    if (part.anchor.mode === 'frame-fraction') {
        return {
            x: frameData.frame.w * part.anchor.x * part.scale,
            y: frameData.frame.h * part.anchor.y * part.scale,
        };
    }

    throw new Error(`Unsupported anchor mode: ${part.anchor.mode}`);
}

function main() {
    const atlasJson = JSON.parse(fs.readFileSync(atlasJsonPath, 'utf8'));
    const atlasPngPath = path.join(path.dirname(atlasJsonPath), atlasJson.meta.image);
    const atlasImage = readPng(atlasPngPath);
    const extractedFrames = new Map();

    const partsDir = path.join(rootDir, atlasJson.puppet.output.partsDir);
    ensureDir(partsDir);

    for (const [frameName, frameData] of Object.entries(atlasJson.frames)) {
        const extracted = copyRegion(atlasImage, frameData.frame);
        extractedFrames.set(frameName, extracted);
        writePng(path.join(partsDir, `${frameName}.png`), extracted);
    }

    const output = new PNG({
        width: atlasJson.puppet.output.width,
        height: atlasJson.puppet.output.height,
    });

    const rootAnchor = {
        x: atlasJson.puppet.output.anchorX,
        y: atlasJson.puppet.output.anchorY,
    };
    const staticPose = atlasJson.puppet.staticPose || {};

    const resolved = new Map();
    const partEntries = Object.entries(atlasJson.puppet.parts);
    const partMap = atlasJson.puppet.parts;

    function resolvePart(partName) {
        if (resolved.has(partName)) {
            return resolved.get(partName);
        }

        const part = partMap[partName];
        const frameData = atlasJson.frames[part.frame];
        const anchorPixels = resolveAnchorPixels(part, frameData);
        let anchorPoint;
        let topLeft;

        if (staticPose[partName]) {
            topLeft = {
                x: staticPose[partName].x,
                y: staticPose[partName].y,
            };
            anchorPoint = {
                x: topLeft.x + anchorPixels.x,
                y: topLeft.y + anchorPixels.y,
            };
        } else if (part.placement.mode === 'root') {
            anchorPoint = {
                x: rootAnchor.x + part.placement.x,
                y: rootAnchor.y + part.placement.y,
            };
            topLeft = {
                x: anchorPoint.x - anchorPixels.x,
                y: anchorPoint.y - anchorPixels.y,
            };
        } else if (part.placement.mode === 'joint') {
            if (!part.parent) {
                throw new Error(`${partName} is missing a parent for joint placement.`);
            }

            const parentPart = resolvePart(part.parent);
            anchorPoint = {
                x: parentPart.anchor.x + part.placement.x,
                y: parentPart.anchor.y + part.placement.y,
            };
            topLeft = {
                x: anchorPoint.x - anchorPixels.x,
                y: anchorPoint.y - anchorPixels.y,
            };
        } else if (part.placement.mode === 'root-top-left') {
            topLeft = {
                x: rootAnchor.x + part.placement.x,
                y: rootAnchor.y + part.placement.y,
            };
            anchorPoint = {
                x: topLeft.x + anchorPixels.x,
                y: topLeft.y + anchorPixels.y,
            };
        } else {
            throw new Error(`Unsupported placement mode: ${part.placement.mode}`);
        }

        const resolvedPart = {
            name: partName,
            frame: part.frame,
            layer: part.layer,
            scale: part.scale,
            anchor: anchorPoint,
            topLeft: {
                x: Math.round(topLeft.x),
                y: Math.round(topLeft.y),
            },
        };

        resolved.set(partName, resolvedPart);
        return resolvedPart;
    }

    for (const [partName] of partEntries) {
        resolvePart(partName);
    }

    const renderQueue = Array.from(resolved.values()).sort((left, right) => left.layer - right.layer);

    for (const part of renderQueue) {
        const sourceImage = extractedFrames.get(part.frame);
        drawScaled(sourceImage, output, part.topLeft.x, part.topLeft.y, part.scale);
    }

    const assembledImagePath = path.join(rootDir, atlasJson.puppet.output.assembledImage);
    writePng(assembledImagePath, output);

    console.log(`Extracted ${extractedFrames.size} atlas parts to ${partsDir}`);
    console.log(`Assembled puppet image at ${assembledImagePath}`);
}

main();