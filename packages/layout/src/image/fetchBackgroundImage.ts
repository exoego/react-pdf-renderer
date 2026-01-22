import { splitByComma } from '@react-pdf/fns';
import resolveImage from '@react-pdf/image';
import { BackgroundLayer, SafeNode } from '../types';

const URL_PATTERN = /url\(['"]?([^'"()]+)['"]?\)/i;

const parseBackgroundImageUrl = (value: string): string | null => {
  const match = URL_PATTERN.exec(value);
  return match ? match[1] : null;
};

const isGradient = (value: string): boolean => {
  const trimmed = value.trim().toLowerCase();
  return (
    trimmed.startsWith('linear-gradient(') ||
    trimmed.startsWith('radial-gradient(')
  );
};

const hasBackgroundImageStyle = (
  node: SafeNode,
): node is SafeNode & { style: { backgroundImage: string } } => {
  return !!node.style?.backgroundImage;
};

const resolveBackgroundLayer = async (
  value: string,
): Promise<BackgroundLayer | null> => {
  if (isGradient(value)) {
    return { type: 'gradient', value };
  }

  const url = parseBackgroundImageUrl(value);
  if (!url) {
    console.warn(`Invalid background-image value: ${value}`);
    return null;
  }

  try {
    const image = await resolveImage({ uri: url }, { cache: true });
    return { type: 'image', value, image: { ...image, key: url } };
  } catch (e: any) {
    console.warn(`Failed to load background image: ${e.message}`);
    return null;
  }
};

/**
 * Fetches background images and stores layer information on node.
 * Supports multiple backgrounds (comma-separated) and gradients.
 */
const fetchBackgroundImage = async (node: SafeNode): Promise<void> => {
  if (!hasBackgroundImageStyle(node)) return;

  const values = splitByComma(node.style.backgroundImage);
  const layerPromises = values.map(resolveBackgroundLayer);
  const resolvedLayers = await Promise.all(layerPromises);
  const layers = resolvedLayers.filter(
    (layer): layer is BackgroundLayer => layer !== null,
  );

  if (layers.length === 0) return;

  (node as any).backgroundLayers = layers;

  // Maintain backwards compatibility with single backgroundImage property
  const firstImageLayer = layers.find((l) => l.type === 'image');
  if (firstImageLayer?.image) {
    (node as any).backgroundImage = firstImageLayer.image;
  }
};

export default fetchBackgroundImage;
