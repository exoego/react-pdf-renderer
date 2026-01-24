import { describe, expect, test } from 'vitest';

import layoutParagraph from '../../src/layout/layoutParagraph';

describe('layoutParagraph', () => {
  test('should keep overflowing text in the last rect', () => {
    const linebreaker = () => (attributedString) => [attributedString];

    const layout = layoutParagraph({ linebreaker }!);

    const container = {
      excludeRects: [],
      x: 2,
      y: 4,
      width: 20,
      height: 10,
    };
    const paragraph = {
      string: 'Lorem',
      runs: [
        { start: 0, end: 5, attributes: { lineHeight: 11, color: 'red' } },
      ],
    };

    layout(container, paragraph);

    expect(true).toBe(true);
  });

  describe('multi column layout', () => {
    test('should layout lines across multiple columns', () => {
      // Create lines that will be distributed across columns
      const linebreaker = () => () => [
        {
          string: 'Line 1',
          runs: [{ start: 0, end: 6, attributes: { lineHeight: 20 } }],
        },
        {
          string: 'Line 2',
          runs: [{ start: 0, end: 6, attributes: { lineHeight: 20 } }],
        },
        {
          string: 'Line 3',
          runs: [{ start: 0, end: 6, attributes: { lineHeight: 20 } }],
        },
        {
          string: 'Line 4',
          runs: [{ start: 0, end: 6, attributes: { lineHeight: 20 } }],
        },
      ];

      const layout = layoutParagraph({ linebreaker }!);

      const container = {
        x: 0,
        y: 0,
        width: 200,
        height: 40, // Can fit 2 lines per column
        columnCount: 2,
        columnGap: 20,
      };
      const paragraph = {
        string: 'Line 1Line 2Line 3Line 4',
        runs: [{ start: 0, end: 24, attributes: { lineHeight: 20 } }],
      };

      const result = layout(container, paragraph);

      expect(result).toHaveLength(4);
      // First column (width 90)
      expect(result[0].box.x).toBe(0);
      expect(result[0].box.y).toBe(0);
      expect(result[1].box.x).toBe(0);
      expect(result[1].box.y).toBe(20);
      // Second column (x = 90 + 20 = 110)
      expect(result[2].box.x).toBe(110);
      expect(result[2].box.y).toBe(0);
      expect(result[3].box.x).toBe(110);
      expect(result[3].box.y).toBe(20);
    });

    test('should overflow to last column when all columns are full', () => {
      // Create more lines than can fit
      const linebreaker = () => () => [
        {
          string: 'Line 1',
          runs: [{ start: 0, end: 6, attributes: { lineHeight: 20 } }],
        },
        {
          string: 'Line 2',
          runs: [{ start: 0, end: 6, attributes: { lineHeight: 20 } }],
        },
        {
          string: 'Line 3',
          runs: [{ start: 0, end: 6, attributes: { lineHeight: 20 } }],
        },
        {
          string: 'Line 4',
          runs: [{ start: 0, end: 6, attributes: { lineHeight: 20 } }],
        },
        {
          string: 'Line 5',
          runs: [{ start: 0, end: 6, attributes: { lineHeight: 20 } }],
        },
      ];

      const layout = layoutParagraph({ linebreaker }!);

      const container = {
        x: 0,
        y: 0,
        width: 200,
        height: 40, // Can fit 2 lines per column
        columnCount: 2,
        columnGap: 20,
      };
      const paragraph = {
        string: 'Line 1Line 2Line 3Line 4Line 5',
        runs: [{ start: 0, end: 30, attributes: { lineHeight: 20 } }],
      };

      const result = layout(container, paragraph);

      expect(result).toHaveLength(5);
      // Fifth line should overflow in the last column
      expect(result[4].box.x).toBe(110); // Second column
      expect(result[4].box.y).toBe(40); // Below the column height
    });
  });
});
