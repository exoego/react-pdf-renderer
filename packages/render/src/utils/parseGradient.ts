import { splitByComma } from '@react-pdf/fns';
import parseColor from './parseColor';

export interface ColorStop {
  color: string;
  offset: number;
  opacity: number;
}

export interface LinearGradientInfo {
  type: 'linear';
  angle: number; // in degrees, 0 = to top, 90 = to right
  stops: ColorStop[];
}

export interface RadialGradientInfo {
  type: 'radial';
  shape: 'circle' | 'ellipse';
  size: 'closest-side' | 'farthest-side' | 'closest-corner' | 'farthest-corner';
  positionX: number; // 0-1 (percentage)
  positionY: number; // 0-1 (percentage)
  stops: ColorStop[];
}

export type GradientInfo = LinearGradientInfo | RadialGradientInfo;

const parseColorValue = (colorStr: string): { color: string; opacity: number } => {
  const trimmed = colorStr.trim();

  if (trimmed.toLowerCase() === 'transparent') {
    return { color: 'white', opacity: 0 };
  }

  const { value, opacity } = parseColor(trimmed);
  return { color: value, opacity };
};

/**
 * Parse a single color stop (e.g., "red 50%", "blue", "#fff 0%")
 */
const parseColorStop = (
  stopStr: string,
  index: number,
  total: number,
): ColorStop | null => {
  const trimmed = stopStr.trim();
  if (!trimmed) return null;

  // Match color and optional percentage
  // Handle functional colors like rgba() or hsl() with percentage after
  const funcMatch = trimmed.match(
    /^((?:rgba?|hsla?)\([^)]+\))\s*([\d.]+%?)?$/i,
  );

  const color = funcMatch ? funcMatch[1] : trimmed.split(/\s+/)[0];
  const offsetStr = funcMatch ? funcMatch[2] : trimmed.split(/\s+/)[1];

  const { color: parsedColor, opacity } = parseColorValue(color);

  // Parse offset or auto-distribute evenly
  const offset = offsetStr
    ? parseFloat(offsetStr) / 100
    : total > 1
      ? index / (total - 1)
      : 0;

  return {
    color: parsedColor,
    offset: Math.max(0, Math.min(1, offset)),
    opacity,
  };
};

const DIRECTION_ANGLES: Record<string, number> = {
  top: 0,
  right: 90,
  bottom: 180,
  left: 270,
  'top right': 45,
  'right top': 45,
  'bottom right': 135,
  'right bottom': 135,
  'bottom left': 225,
  'left bottom': 225,
  'top left': 315,
  'left top': 315,
};

const parseDirectionToAngle = (direction: string): number => {
  const dir = direction.trim().toLowerCase();

  if (dir.endsWith('deg')) return parseFloat(dir);
  if (dir.endsWith('rad')) return (parseFloat(dir) * 180) / Math.PI;
  if (dir.endsWith('turn')) return parseFloat(dir) * 360;

  if (dir.startsWith('to ')) {
    const target = dir.slice(3).trim();
    return DIRECTION_ANGLES[target] ?? 180;
  }

  return 180;
};

const isDirectionArg = (arg: string): boolean => {
  return (
    arg.endsWith('deg') ||
    arg.endsWith('rad') ||
    arg.endsWith('turn') ||
    arg.startsWith('to ')
  );
};

const parseColorStops = (args: string[]): ColorStop[] => {
  return args
    .map((arg, i) => parseColorStop(arg, i, args.length))
    .filter((stop): stop is ColorStop => stop !== null);
};

const parseLinearGradient = (value: string): LinearGradientInfo | null => {
  const match = value.match(/^linear-gradient\((.+)\)$/i);
  if (!match) return null;

  const args = splitByComma(match[1]);
  if (args.length < 2) return null;

  const first = args[0].trim();
  const hasDirection = isDirectionArg(first);
  const angle = hasDirection ? parseDirectionToAngle(first) : 180;
  const colorStopArgs = hasDirection ? args.slice(1) : args;
  const stops = parseColorStops(colorStopArgs);

  if (stops.length < 2) return null;

  return { type: 'linear', angle, stops };
};

const POSITION_X_KEYWORDS: Record<string, number> = {
  left: 0,
  center: 0.5,
  right: 1,
};

const POSITION_Y_KEYWORDS: Record<string, number> = {
  top: 0,
  center: 0.5,
  bottom: 1,
};

const parsePositionValue = (
  value: string | undefined,
  keywords: Record<string, number>,
): number => {
  if (!value) return 0.5;
  if (value in keywords) return keywords[value];
  if (value.endsWith('%')) return parseFloat(value) / 100;
  return 0.5;
};

const parseRadialSize = (spec: string): RadialGradientInfo['size'] => {
  if (spec.includes('closest-side')) return 'closest-side';
  if (spec.includes('farthest-side')) return 'farthest-side';
  if (spec.includes('closest-corner')) return 'closest-corner';
  return 'farthest-corner';
};

const hasRadialShapeSpec = (arg: string): boolean => {
  return (
    arg.includes('circle') ||
    arg.includes('ellipse') ||
    arg.includes('at ') ||
    arg.includes('closest') ||
    arg.includes('farthest')
  );
};

const parseRadialGradient = (value: string): RadialGradientInfo | null => {
  const match = value.match(/^radial-gradient\((.+)\)$/i);
  if (!match) return null;

  const args = splitByComma(match[1]);
  if (args.length < 2) return null;

  const first = args[0].trim().toLowerCase();
  const hasSpec = hasRadialShapeSpec(first);

  let shape: 'circle' | 'ellipse' = 'ellipse';
  let size: RadialGradientInfo['size'] = 'farthest-corner';
  let positionX = 0.5;
  let positionY = 0.5;

  if (hasSpec) {
    shape = first.includes('circle') ? 'circle' : 'ellipse';
    size = parseRadialSize(first);

    const atIndex = first.indexOf(' at ');
    if (atIndex !== -1) {
      const posParts = first
        .slice(atIndex + 4)
        .trim()
        .split(/\s+/);
      positionX = parsePositionValue(posParts[0], POSITION_X_KEYWORDS);
      positionY = parsePositionValue(posParts[1], POSITION_Y_KEYWORDS);
    }
  }

  const colorStopArgs = hasSpec ? args.slice(1) : args;
  const stops = parseColorStops(colorStopArgs);

  if (stops.length < 2) return null;

  return { type: 'radial', shape, size, positionX, positionY, stops };
};

export const parseGradient = (value: string): GradientInfo | null => {
  const trimmed = value.trim();

  if (trimmed.startsWith('linear-gradient(')) {
    return parseLinearGradient(trimmed);
  }

  if (trimmed.startsWith('radial-gradient(')) {
    return parseRadialGradient(trimmed);
  }

  return null;
};
