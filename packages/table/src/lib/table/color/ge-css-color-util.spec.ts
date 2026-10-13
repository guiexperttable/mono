import { describe, expect, it } from 'vitest';
import { ColorRgb, GeCssColorUtil, ThreeColorGradientArg, TwoColorGradientArg } from '@guiexpert/table';
import type { ColorRgbIf, ThreeColorGradientArgIf, TwoColorGradientArgIf } from '@guiexpert/table';

const black = new ColorRgb(0, 0, 0);
const white = new ColorRgb(255, 255, 255);
const red = new ColorRgb(255, 0, 0);
const green = new ColorRgb(0, 128, 0);

describe('ColorRgb', () => {
  it('holds r, g, b', () => {
    const c: ColorRgbIf = new ColorRgb(1, 2, 3);
    expect(c).toEqual({ r: 1, g: 2, b: 3 });
  });
});

describe('TwoColorGradientArg', () => {
  it('holds min value/color and max value/color', () => {
    const arg: TwoColorGradientArgIf = new TwoColorGradientArg(0, black, 10, white);
    expect(arg).toEqual({ minValue: 0, minColor: black, maxValue: 10, maxColor: white });
  });
});

describe('ThreeColorGradientArg', () => {
  it('holds min, middle and max value/color', () => {
    const arg: ThreeColorGradientArgIf = new ThreeColorGradientArg(-1, red, 0, white, 1, green);
    expect(arg).toEqual({ minValue: -1, minColor: red, middleValue: 0, middleColor: white, maxValue: 1, maxColor: green });
  });
});

describe('GeCssColorUtil', () => {

  describe('normalize', () => {

    it('maps a range linearly to [0, 1] by default', () => {
      expect(GeCssColorUtil.normalize(5, 0, 10)).toBe(0.5);
      expect(GeCssColorUtil.normalize(0, 0, 10)).toBe(0);
      expect(GeCssColorUtil.normalize(10, 0, 10)).toBe(1);
    });

    it('maps to a given target range', () => {
      expect(GeCssColorUtil.normalize(5, 0, 10, 100, 200)).toBe(150);
      expect(GeCssColorUtil.normalize(-1, -1, 1, 0, 255)).toBe(0);
    });

    it('extrapolates outside the source range (no clamping)', () => {
      expect(GeCssColorUtil.normalize(20, 0, 10)).toBe(2);
      expect(GeCssColorUtil.normalize(-10, 0, 10)).toBe(-1);
    });

    it('works with a reversed source range', () => {
      expect(GeCssColorUtil.normalize(2, 10, 0)).toBe(0.8);
    });

    it('returns NaN for an empty source range (division by zero)', () => {
      // NOTE: min === max → 0/0.
      expect(GeCssColorUtil.normalize(5, 5, 5)).toBeNaN();
    });
  });

  describe('getTwoColorGradientRGB', () => {
    const blackToWhite = new TwoColorGradientArg(0, black, 100, white);

    it('returns the min color at minValue and the max color at maxValue', () => {
      expect(GeCssColorUtil.getTwoColorGradientRGB(0, blackToWhite)).toBe('rgb(0, 0, 0)');
      expect(GeCssColorUtil.getTwoColorGradientRGB(100, blackToWhite)).toBe('rgb(255, 255, 255)');
    });

    it('interpolates each channel linearly and rounds', () => {
      expect(GeCssColorUtil.getTwoColorGradientRGB(50, blackToWhite)).toBe('rgb(128, 128, 128)'); // 127.5 → 128
      expect(GeCssColorUtil.getTwoColorGradientRGB(25, blackToWhite)).toBe('rgb(64, 64, 64)'); // 63.75 → 64
    });

    it('interpolates channels independently (red → green)', () => {
      expect(GeCssColorUtil.getTwoColorGradientRGB(5, new TwoColorGradientArg(0, red, 10, green))).toBe('rgb(128, 64, 0)');
    });

    it('accepts plain objects (the ...If interfaces)', () => {
      const arg: TwoColorGradientArgIf = { minValue: 0, minColor: { r: 10, g: 20, b: 30 }, maxValue: 1, maxColor: { r: 20, g: 40, b: 60 } };
      expect(GeCssColorUtil.getTwoColorGradientRGB(0.5, arg)).toBe('rgb(15, 30, 45)');
    });

    it('does not clamp values outside [min, max]', () => {
      // NOTE: out-of-range values give channels < 0 or > 255.
      expect(GeCssColorUtil.getTwoColorGradientRGB(200, blackToWhite)).toBe('rgb(510, 510, 510)');
      expect(GeCssColorUtil.getTwoColorGradientRGB(-100, blackToWhite)).toBe('rgb(-255, -255, -255)');
    });

    it('returns "rgb(NaN, NaN, NaN)" when minValue equals maxValue', () => {
      // NOTE: a constant column (all values equal) gives an invalid CSS colour.
      expect(GeCssColorUtil.getTwoColorGradientRGB(5, new TwoColorGradientArg(5, black, 5, white))).toBe('rgb(NaN, NaN, NaN)');
    });
  });

  describe('getThreeColorGradientRGB', () => {
    const redWhiteGreen = new ThreeColorGradientArg(-100, red, 0, white, 100, green);

    it('returns min, middle and max color exactly at their values', () => {
      expect(GeCssColorUtil.getThreeColorGradientRGB(-100, redWhiteGreen)).toBe('rgb(255, 0, 0)');
      expect(GeCssColorUtil.getThreeColorGradientRGB(0, redWhiteGreen)).toBe('rgb(255, 255, 255)');
      expect(GeCssColorUtil.getThreeColorGradientRGB(100, redWhiteGreen)).toBe('rgb(0, 128, 0)');
    });

    it('interpolates between min and middle below the middle value', () => {
      expect(GeCssColorUtil.getThreeColorGradientRGB(-50, redWhiteGreen)).toBe('rgb(255, 128, 128)'); // 127.5 → 128
    });

    it('interpolates between middle and max above the middle value', () => {
      expect(GeCssColorUtil.getThreeColorGradientRGB(50, redWhiteGreen)).toBe('rgb(128, 192, 128)'); // 127.5, 191.5
    });

    it('works with an asymmetric middle value', () => {
      const arg = new ThreeColorGradientArg(0, black, 10, white, 110, black);
      expect(GeCssColorUtil.getThreeColorGradientRGB(5, arg)).toBe('rgb(128, 128, 128)');
      expect(GeCssColorUtil.getThreeColorGradientRGB(60, arg)).toBe('rgb(128, 128, 128)');
    });

    it('returns the middle color unrounded', () => {
      // NOTE: only interpolated colours are rounded; a fractional middle colour is returned as is.
      const arg = new ThreeColorGradientArg(0, black, 5, new ColorRgb(1.5, 2.25, 3), 10, white);
      expect(GeCssColorUtil.getThreeColorGradientRGB(5, arg)).toBe('rgb(1.5, 2.25, 3)');
    });

    it('does not clamp values outside [min, max]', () => {
      expect(GeCssColorUtil.getThreeColorGradientRGB(200, redWhiteGreen)).toBe('rgb(-255, 1, -255)');
    });
  });
});
