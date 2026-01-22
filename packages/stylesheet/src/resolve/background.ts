import transformUnit from '../utils/units';
import offsetKeyword from '../utils/offsetKeyword';
import { processNoopValue } from './utils';
import { Container, Style, StyleKey } from '../types';

const isVerticalKeyword = (value: string) =>
  value === 'top' || value === 'bottom';

const processBackgroundPosition = <K extends StyleKey>(
  key: K,
  value: Style[K],
  container: Container,
) => {
  const match = `${value}`.split(' ');

  let xValue: string;
  let yValue: string;

  if (match.length === 1) {
    // Per CSS spec, single vertical keywords (top/bottom) default X to 'center'
    // Single horizontal keywords (left/right/center) default Y to 'center'
    if (isVerticalKeyword(match[0])) {
      xValue = 'center';
      yValue = match[0];
    } else {
      xValue = match[0];
      yValue = 'center';
    }
  } else {
    xValue = match[0];
    yValue = match[1];
  }

  const backgroundPositionX = offsetKeyword(transformUnit(container, xValue));
  const backgroundPositionY = offsetKeyword(transformUnit(container, yValue));

  return { backgroundPositionX, backgroundPositionY };
};

const processBackgroundPositionValue = <K extends StyleKey>(
  key: K,
  value: Style[K],
  container: Container,
) => ({
  [key]: offsetKeyword(transformUnit(container, value)),
});

const handlers = {
  backgroundImage: processNoopValue<'backgroundImage'>,
  backgroundSize: processNoopValue<'backgroundSize'>,
  backgroundPosition: processBackgroundPosition<'backgroundPosition'>,
  backgroundPositionX: processBackgroundPositionValue<'backgroundPositionX'>,
  backgroundPositionY: processBackgroundPositionValue<'backgroundPositionY'>,
  backgroundRepeat: processNoopValue<'backgroundRepeat'>,
};

export default handlers;
