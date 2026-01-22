import { isNil } from '@react-pdf/fns';
import { BackgroundRepeat } from '@react-pdf/stylesheet';

import clipNode from '../operations/clipNode';
import parseColor from '../utils/parseColor';
import resolveBackgroundSize from '../utils/resolveBackgroundSize';
import {
  parseGradient,
  type LinearGradientInfo,
  type RadialGradientInfo,
} from '../utils/parseGradient';
import { Context, RenderOptions } from '../types';
import { BackgroundImage, BackgroundLayer, SafeNode } from '@react-pdf/layout';

type NodeWithBackgroundImage = SafeNode & { backgroundImage: BackgroundImage };
type NodeWithBackgroundLayers = SafeNode & {
  backgroundLayers: BackgroundLayer[];
};

const hasBackgroundImage = (
  node: SafeNode,
): node is NodeWithBackgroundImage => {
  return !!(node as any).backgroundImage?.data;
};

const hasBackgroundLayers = (
  node: SafeNode,
): node is NodeWithBackgroundLayers => {
  return Array.isArray((node as any).backgroundLayers);
};

const getNodeOpacity = (node: SafeNode): number => {
  return isNil(node.style?.opacity) ? 1 : node.style.opacity;
};

// TODO: Rename to drawBackgroundColor
const drawBackground = (ctx: Context, node: SafeNode) => {
  if (!node.box) return;

  const { top, left, width, height } = node.box;
  const color = parseColor(node.style.backgroundColor);
  const opacity = Math.min(color.opacity, getNodeOpacity(node));

  ctx
    .fillOpacity(opacity)
    .fillColor(color.value)
    .rect(left, top, width, height)
    .fill();
};

function drawTiledImages(
  ctx: Context,
  image: any,
  containerLeft: number,
  containerTop: number,
  containerWidth: number,
  containerHeight: number,
  imgWidth: number,
  imgHeight: number,
  xOffset: number,
  yOffset: number,
  repeat: BackgroundRepeat,
): void {
  const repeatX = repeat === 'repeat' || repeat === 'repeat-x';
  const repeatY = repeat === 'repeat' || repeat === 'repeat-y';

  // Calculate starting positions (may be negative for proper tiling)
  let startX = xOffset;
  let startY = yOffset;
  if (repeatX) while (startX > 0) startX -= imgWidth;
  if (repeatY) while (startY > 0) startY -= imgHeight;

  const endX = repeatX ? containerWidth : startX + imgWidth;
  const endY = repeatY ? containerHeight : startY + imgHeight;

  for (let y = startY; y < endY; y += imgHeight) {
    for (let x = startX; x < endX; x += imgWidth) {
      ctx.image(image, containerLeft + x, containerTop + y, {
        width: imgWidth,
        height: imgHeight,
      });
      if (!repeatX) break;
    }
    if (!repeatY) break;
  }
}

type GradientPoints = { x1: number; y1: number; x2: number; y2: number };

function calculateLinearGradientPoints(
  angle: number,
  left: number,
  top: number,
  width: number,
  height: number,
): GradientPoints {
  // Convert CSS angle to radians (CSS: 0deg = to top, 90deg = to right)
  const angleRad = ((angle - 90) * Math.PI) / 180;
  const centerX = left + width / 2;
  const centerY = top + height / 2;
  const diagLength = Math.sqrt(width * width + height * height) / 2;

  return {
    x1: centerX - Math.cos(angleRad) * diagLength,
    y1: centerY - Math.sin(angleRad) * diagLength,
    x2: centerX + Math.cos(angleRad) * diagLength,
    y2: centerY + Math.sin(angleRad) * diagLength,
  };
}

function addGradientStops(
  grad: any,
  stops: LinearGradientInfo['stops'],
  nodeOpacity: number,
): void {
  for (const stop of stops) {
    const color = parseColor(stop.color);
    const opacity = stop.opacity * nodeOpacity * color.opacity;
    grad.stop(stop.offset, color.value, opacity);
  }
}

function drawLinearGradient(
  ctx: Context,
  node: SafeNode,
  gradient: LinearGradientInfo,
): void {
  if (!node.box) return;

  const { top, left, width, height } = node.box;
  const { x1, y1, x2, y2 } = calculateLinearGradientPoints(
    gradient.angle,
    left,
    top,
    width,
    height,
  );
  const grad = ctx.linearGradient(x1, y1, x2, y2);

  addGradientStops(grad, gradient.stops, getNodeOpacity(node));
  ctx.rect(left, top, width, height).fill(grad);
}

function calculateCornerDistances(
  posX: number,
  posY: number,
  width: number,
  height: number,
): number[] {
  const dx1 = posX * width;
  const dx2 = (1 - posX) * width;
  const dy1 = posY * height;
  const dy2 = (1 - posY) * height;

  return [
    Math.sqrt(dx1 * dx1 + dy1 * dy1),
    Math.sqrt(dx2 * dx2 + dy1 * dy1),
    Math.sqrt(dx1 * dx1 + dy2 * dy2),
    Math.sqrt(dx2 * dx2 + dy2 * dy2),
  ];
}

function calculateRadialGradientRadius(
  gradient: RadialGradientInfo,
  width: number,
  height: number,
): number {
  const { positionX: posX, positionY: posY, size } = gradient;
  const sideDistances = [
    posX * width,
    (1 - posX) * width,
    posY * height,
    (1 - posY) * height,
  ];

  switch (size) {
    case 'closest-side':
      return Math.min(...sideDistances);
    case 'farthest-side':
      return Math.max(...sideDistances);
    case 'closest-corner':
      return Math.min(...calculateCornerDistances(posX, posY, width, height));
    case 'farthest-corner':
    default:
      return Math.max(...calculateCornerDistances(posX, posY, width, height));
  }
}

function drawRadialGradient(
  ctx: Context,
  node: SafeNode,
  gradient: RadialGradientInfo,
): void {
  if (!node.box) return;

  const { top, left, width, height } = node.box;
  const cx = left + width * gradient.positionX;
  const cy = top + height * gradient.positionY;
  const needsEllipseTransform =
    gradient.shape === 'ellipse' && width !== height;

  let radius = calculateRadialGradientRadius(gradient, width, height);

  if (needsEllipseTransform) {
    ctx.save();
    const maxDim = Math.max(width, height);
    ctx.translate(cx, cy);
    ctx.scale(width / maxDim, height / maxDim);
    ctx.translate(-cx, -cy);
    radius = maxDim / 2;
  }

  const grad = ctx.radialGradient(cx, cy, 0, cx, cy, radius);
  addGradientStops(grad, gradient.stops, getNodeOpacity(node));
  ctx.rect(left, top, width, height).fill(grad);

  if (needsEllipseTransform) {
    ctx.restore();
  }
}

function drawBackgroundLayer(
  ctx: Context,
  node: SafeNode,
  layer: BackgroundLayer,
  options: RenderOptions,
): void {
  if (!node.box) return;

  if (layer.type === 'gradient') {
    const gradientInfo = parseGradient(layer.value);
    if (!gradientInfo) return;

    if (gradientInfo.type === 'linear') {
      drawLinearGradient(ctx, node, gradientInfo);
    } else {
      drawRadialGradient(ctx, node, gradientInfo);
    }
  } else if (layer.type === 'image' && layer.image) {
    drawBackgroundImageLayer(ctx, node, layer.image, options);
  }
}

function getOrCacheImage(
  ctx: Context,
  backgroundImage: BackgroundImage,
  imageCache: Map<string | undefined, any>,
): any {
  const cacheKey = backgroundImage.key;
  const cached = cacheKey ? imageCache.get(cacheKey) : null;
  if (cached) return cached;

  const src = backgroundImage.data;
  let image = typeof src === 'string' ? ctx._imageRegistry[src] : null;

  if (!image) {
    image = ctx.openImage(src);
  }

  if (!image.obj) {
    image.embed(ctx);
  }

  if (cacheKey) {
    imageCache.set(cacheKey, image);
  }

  return image;
}

function drawBackgroundImageLayer(
  ctx: Context,
  node: SafeNode,
  backgroundImage: BackgroundImage,
  options: RenderOptions,
): void {
  if (!node.box) return;

  const { top, left, width, height } = node.box;
  const imageCache = options.imageCache || new Map();
  const repeat = (node.style?.backgroundRepeat as BackgroundRepeat) || 'repeat';

  const { imgWidth, imgHeight, xOffset, yOffset } = resolveBackgroundSize(
    node.style?.backgroundSize,
    width,
    height,
    backgroundImage.width,
    backgroundImage.height,
    node.style?.backgroundPositionX,
    node.style?.backgroundPositionY,
  );

  if (imgWidth === 0 || imgHeight === 0) {
    console.warn('Background image skipped due to invalid dimensions');
    return;
  }

  const image = getOrCacheImage(ctx, backgroundImage, imageCache);
  ctx.fillOpacity(getNodeOpacity(node));

  if (repeat === 'no-repeat') {
    ctx.image(image, left + xOffset, top + yOffset, {
      width: imgWidth,
      height: imgHeight,
    });
  } else {
    drawTiledImages(
      ctx,
      image,
      left,
      top,
      width,
      height,
      imgWidth,
      imgHeight,
      xOffset,
      yOffset,
      repeat,
    );
  }
}

const renderBackground = (
  ctx: Context,
  node: SafeNode,
  options: RenderOptions,
): void => {
  if (!node.box) return;

  const hasColor = !!node.style?.backgroundColor;
  const hasBgImage = hasBackgroundImage(node);
  const hasBgLayers = hasBackgroundLayers(node);

  if (!hasColor && !hasBgImage && !hasBgLayers) return;

  ctx.save();
  clipNode(ctx, node);

  if (hasColor) {
    drawBackground(ctx, node);
  }

  if (hasBgLayers) {
    // Multiple backgrounds: render in reverse order (last is bottom)
    for (let i = node.backgroundLayers.length - 1; i >= 0; i--) {
      drawBackgroundLayer(ctx, node, node.backgroundLayers[i], options);
    }
  } else if (hasBgImage) {
    drawBackgroundImageLayer(ctx, node, node.backgroundImage, options);
  }

  ctx.restore();
};

export default renderBackground;
