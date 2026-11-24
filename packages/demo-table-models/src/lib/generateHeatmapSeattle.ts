import { getRawData, RawData } from "./generateHeatmapSeattleData";
import {
  AreaModel,
  ColorRgb,
  GeCssColorUtil,
  TableFactory,
  TableModelIf,
  ThreeColorGradientArg
} from "@guiexpert/table";

const defaultRowHeights = 30;
const defaultColumnWidth = 3;
const times = ["06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00",
  "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00",
  "00:00", "01:00", "02:00", "03:00", "04:00", "05:00"];

/** The weather data grouped by day and hour, with the temperature range. */
interface SeattleWeather {
  /** date → "HH:MM" → value */
  map: { [key: string]: { [key: string]: RawData } };
  days: string[];
  min: number;
  max: number;
}

let seattleWeather: SeattleWeather | undefined;

/**
 * Reads and groups the 8,759 values once, on the first model – never on import (before 1.1.116 this ran on module
 * level: a side effect, so every app that imported anything from this package kept the weather data in its bundle).
 */
function getSeattleWeather(): SeattleWeather {
  if (!seattleWeather) {
    const map: SeattleWeather["map"] = {};
    let min = 10;
    let max = 0;
    getRawData().forEach(item => {
      const [d, t] = item.date.split("T") as [string, string];
      if (!map[d]) {
        map[d] = {};
      }
      map[d][t.substring(0, 5)] = item;
      min = Math.min(min, item.temperature);
      max = Math.max(max, item.temperature);
    });
    seattleWeather = { map, days: Object.keys(map), min, max };
  }
  return seattleWeather;
}

export function createHeatMapSeattleModel(): TableModelIf {
  const weather = getSeattleWeather();
  const bodyAreaModel = new HeatMapSeattleBodyModel(weather);
  const footerAreaModel = new HeatMapSeattleFooterModel();
  const columnSizes = [60, ...(new Array(weather.days.length).fill(defaultColumnWidth))];

  return TableFactory.createTableModel({
    bodyAreaModel,
    footerAreaModel,
    columnSizes,
    fixedLeftColumnCount: 1
  });
}

// TODO  split   time vs date, see https://vega.github.io/vega/examples/heatmap/
// colors  from   #430355 -> #1F908D  -> #FAE625

class HeatMapSeattleBodyModel extends AreaModel {

  constructor(private readonly weather: SeattleWeather) {
    super();
  }

  override getRowCount(): number {
    return times.length;
  }

  override getRowHeight(_rowIndex: number): number {
    return defaultRowHeights;
  }

  override getValueAt(rowIndex: number, columnIndex: number): any {
    if (columnIndex === 0) return times[rowIndex];
    return "";
  }


  override getTooltipAt(rowIndex: number, columnIndex: number): any {
    if (columnIndex === 0) {
      return "";
    }
    columnIndex--;
    const { map, days } = this.weather;
    const date = days[columnIndex];
    const time = times[rowIndex];
    if (map[date] && map[date][time]) {
      return `${date} ${time} → ${map[date][time].temperature}`;
    }
    return "";
  }

  override getCustomStyleAt(rowIndex: number, columnIndex: number): { [p: string]: string } | undefined {
    if (columnIndex === 0) {
      return undefined;
    }
    columnIndex--;
    const { map, days, min: MIN, max: MAX } = this.weather;
    const date = days[columnIndex];
    const time = times[rowIndex];
    if (!map[date] || !map[date][time]) return undefined;

    const n = map[date][time].temperature;

    // const red = new ColorRgb(255, 0, 0);
    // const blue = new ColorRgb(0, 0, 255);
    // const p = new TwoColorGradientArg(MIN, red, MAX, blue);
    // -> "background": GeCssColorUtil.getTwoColorGradientRGB(n, p),

    const minColor = new ColorRgb(67, 1, 84);
    const middleColor = new ColorRgb(31, 144, 141);
    const maxColor = new ColorRgb(250, 230, 37);
    const MIDDLE = (MAX + MIN) / 2;
    const p = new ThreeColorGradientArg(MIN, minColor, MIDDLE, middleColor, MAX, maxColor);

    return {
      "background": GeCssColorUtil.getThreeColorGradientRGB(n, p),
      "color": "transparent" // we only want to show the bg color
    };
  }
}


class HeatMapSeattleFooterModel extends AreaModel {

  override getRowCount(): number {
    return 1;
  }

  override getRowHeight(_rowIndex: number): number {
    return defaultRowHeights;
  }

  override getValueAt(_rowIndex: number, columnIndex: number): any {
    if (columnIndex === 1) return "Jan";
    if (columnIndex === 32) return "Feb";
    if (columnIndex === 60) return "Mar";
    if (columnIndex === 91) return "Apr";
    if (columnIndex === 121) return "May";
    if (columnIndex === 152) return "Jun";
    if (columnIndex === 182) return "Jul";
    if (columnIndex === 213) return "Aug";
    if (columnIndex === 244) return "Sep";
    if (columnIndex === 274) return "Oct";
    if (columnIndex === 305) return "Nov";
    if (columnIndex === 335) return "Dec";
    return "";
  }

  override getColspanAt(_rowIndex: number, columnIndex: number): number {
    if (columnIndex === 1) return 31;
    if (columnIndex === 32) return 28;
    if (columnIndex === 60) return 31;
    if (columnIndex === 91) return 30;
    if (columnIndex === 121) return 31;
    if (columnIndex === 152) return 30;
    if (columnIndex === 182) return 31;
    if (columnIndex === 213) return 31;
    if (columnIndex === 244) return 30;
    if (columnIndex === 274) return 31;
    if (columnIndex === 305) return 30;
    if (columnIndex === 335) return 31;
    return 0;
  }

  override getMaxColspan(): number {
    return 32;
  }

  override getCustomStyleAt(_rowIndex: number, columnIndex: number): { [p: string]: string } | undefined {
    return {
      "border-left": columnIndex > 2 ? "solid 1px #555" : "none"
    };
  }
}
