import { matchPercent } from '@react-pdf/fns';
import { BackgroundSize } from '@react-pdf/stylesheet';

const isNumeric = (n: unknown): n is number => {
  return typeof n === 'number' && Number.isFinite(n);
};

/**
 * Scale dimensions to fit or cover a container while maintaining aspect ratio
 */
const scaleToFitOrCover = (
  containerWidth: number,
  containerHeight: number,
  imageRatio: number,
  mode: 'contain' | 'cover',
): { width: number; height: number } => {
  const containerRatio = containerWidth / containerHeight;
  const useWidth =
    mode === 'contain'
      ? containerRatio <= imageRatio
      : containerRatio > imageRatio;

  if (useWidth) {
    return { width: containerWidth, height: containerWidth / imageRatio };
  }

  return { width: containerHeight * imageRatio, height: containerHeight };
};

/**
 * Parse background-size value
 * Supports: 'cover', 'contain', 'auto', percentage, and numeric values
 */
const parseBackgroundSize = (
  size: BackgroundSize | undefined,
  containerWidth: number,
  containerHeight: number,
  imageWidth: number,
  imageHeight: number,
): { width: number; height: number } => {
  if (!size || size === 'auto') {
    return { width: imageWidth, height: imageHeight };
  }

  const imageRatio = imageWidth / imageHeight;

  if (size === 'contain' || size === 'cover') {
    return scaleToFitOrCover(containerWidth, containerHeight, imageRatio, size);
  }

  // Handle percentage or numeric value
  const parts = `${size}`.split(' ');

  const parseDimension = (
    value: string,
    containerSize: number,
    fallback: number,
  ): number => {
    if (value === 'auto') return -1;
    const percent = matchPercent(value);
    return percent
      ? containerSize * percent.percent
      : parseFloat(value) || fallback;
  };

  let width = parseDimension(parts[0], containerWidth, imageWidth);
  let height =
    parts.length === 1
      ? -1 // Single value: height is auto
      : parseDimension(parts[1], containerHeight, imageHeight);

  // Resolve auto values using aspect ratio
  if (width === -1 && height === -1) {
    return { width: imageWidth, height: imageHeight };
  }

  if (width === -1) {
    width = height * imageRatio;
  } else if (height === -1) {
    height = width / imageRatio;
  }

  return { width, height };
};

/**
 * Calculate background position offset.
 * CSS background-position percentage aligns the X% point of the image
 * with the X% point of the container.
 */
const parseBackgroundPosition = (
  position: number | string | undefined,
  containerSize: number,
  imageSize: number,
): number => {
  if (position === undefined) {
    // Default to center (50%)
    return (containerSize - imageSize) / 2;
  }

  if (isNumeric(position)) {
    return position;
  }

  const posStr = `${position}`;
  const percentMatch = matchPercent(posStr);

  if (percentMatch) {
    return (containerSize - imageSize) * percentMatch.percent;
  }

  return parseFloat(posStr) || 0;
};

type BackgroundSizeResult = {
  imgWidth: number;
  imgHeight: number;
  xOffset: number;
  yOffset: number;
};

/**
 * Resolve background-size and background-position to actual dimensions and offsets
 */
const resolveBackgroundSize = (
  backgroundSize: BackgroundSize | undefined,
  containerWidth: number,
  containerHeight: number,
  imageWidth: number,
  imageHeight: number,
  backgroundPositionX?: number | string,
  backgroundPositionY?: number | string,
): BackgroundSizeResult => {
  const { width: imgWidth, height: imgHeight } = parseBackgroundSize(
    backgroundSize,
    containerWidth,
    containerHeight,
    imageWidth,
    imageHeight,
  );

  const xOffset = parseBackgroundPosition(
    backgroundPositionX,
    containerWidth,
    imgWidth,
  );
  const yOffset = parseBackgroundPosition(
    backgroundPositionY,
    containerHeight,
    imgHeight,
  );

  return { imgWidth, imgHeight, xOffset, yOffset };
};

export default resolveBackgroundSize;
