import type { PluginFunc } from 'dayjs';
import type dayjs from 'dayjs';

import type { OptionsType } from './options/Options';
import type DateHelper from './helpers/DateHelper';

declare namespace CalHeatmap {
  export type Timestamp = number;
  export type DomainType =
    | 'year'
    | 'month'
    | 'week'
    | 'xDay'
    | 'ghDay'
    | 'day'
    | 'hour'
    | 'minute';

  export type DeepPartial<T> = T extends object
    ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
    : T;

  // Template

  export type Template = {
    (dateHelper: DateHelper, options: OptionsType): TemplateResult;
  };

  export type TemplateResult = {
    name: string;
    parent?: string;
    allowedDomainType: DomainType[];
    rowsCount: (ts: Timestamp) => number;
    columnsCount: (ts: Timestamp) => number;
    mapping: (
      startTimestamp: Timestamp,
      endTimestamp: Timestamp,
    ) => SubDomain[];
    extractUnit: (ts: Timestamp) => Timestamp;
  };

  export type SubDomain = {
    t: Timestamp;
    x: number;
    y: number;
    v?: number | string | null;
  };

  export type Dimensions = {
    width: number;
    height: number;
  };

  // Plugin

  export interface IPlugin {
    name: string;
    calendar: CalHeatmap;
    options: PluginOptions;
    root: any;

    setup: (options?: PluginOptions) => void;
    paint: () => Promise<unknown>;
    destroy: () => Promise<unknown>;
  }
  export interface IPluginContructor {
    new (calendar?: CalHeatmap): IPlugin;
  }

  export interface PluginOptions {
    position?: 'top' | 'right' | 'bottom' | 'left';
    dimensions?: Dimensions;
    key?: string;
  }
  export type PluginDefinition = [IPluginContructor, Partial<PluginOptions>?];

  // Plugin Options

  export interface LegendOptions extends PluginOptions {
    enabled: boolean;
    itemSelector: string | null;
    label: string | null;
    width: number;
  }

  export interface LegendLiteOptions extends PluginOptions {
    enabled: boolean;
    itemSelector: string | null;
    width: number;
    height: number;
    radius: number;
    gutter: number;
    includeBlank: boolean;
  }

  export interface PopperOptions {
    placement: any;
    modifiers: any[];
    strategy: any;
    onFirstUpdate?: any;
  }

  export interface TooltipOptions extends PluginOptions, PopperOptions {
    enabled: boolean;
    text: (
      timestamp: CalHeatmap.Timestamp,
      value: number,
      dayjsDate: dayjs.Dayjs,
    ) => string;
  }

  export type ComputedOptions = {
    radius: number;
    width: number;
    height: number;
    gutter: number;
    textAlign: TextAlign;
  };

  export type Padding = [number, number, number, number];
  export type TextAlign = 'start' | 'middle' | 'end';

  export interface CalendarLabelOptions extends PluginOptions, Partial<ComputedOptions> {
    enabled: boolean;
    text: () => string[];
    padding: Padding;
  }

  // Built-in plugins

  export class Legend implements IPlugin {
    constructor(calendar: CalHeatmap);
    name: string;
    calendar: CalHeatmap;
    options: LegendOptions;
    root: any;
    shown: boolean;
    setup(options?: Partial<LegendOptions>): void;
    paint(): Promise<unknown>;
    destroy(): Promise<unknown>;
  }

  export class LegendLite implements IPlugin {
    constructor(calendar: CalHeatmap);
    name: string;
    calendar: CalHeatmap;
    options: LegendLiteOptions;
    root: any;
    shown: boolean;
    setup(options?: Partial<LegendLiteOptions>): void;
    paint(): Promise<unknown>;
    destroy(): Promise<unknown>;
  }

  export class Tooltip implements IPlugin {
    constructor(calendar: CalHeatmap);
    name: string;
    calendar: CalHeatmap;
    options: Partial<TooltipOptions>;
    root: HTMLElement | null;
    popperInstance: any;
    popperOptions: any;
    listenerAttached: boolean;
    setup(options?: Partial<TooltipOptions>): void;
    paint(): Promise<unknown>;
    destroy(): Promise<unknown>;
  }

  export class CalendarLabel implements IPlugin {
    constructor(calendar: CalHeatmap);
    name: string;
    calendar: CalHeatmap;
    options: CalendarLabelOptions;
    root: any;
    shown: boolean;
    computedOptions: ComputedOptions;
    setup(options?: Partial<CalendarLabelOptions>): void;
    paint(): Promise<unknown>;
    destroy(): Promise<unknown>;
  }
}

declare class CalHeatmap {
  constructor();

  paint(
    options?: CalHeatmap.DeepPartial<OptionsType>,
    plugins?: CalHeatmap.PluginDefinition[] | CalHeatmap.PluginDefinition,
  ): Promise<unknown>;

  addTemplates(templates: CalHeatmap.Template | CalHeatmap.Template[]): void;

  next(n?: number): Promise<unknown>;

  previous(n?: number): Promise<unknown>;

  jumpTo(date: Date, reset?: boolean): Promise<unknown>;

  fill(dataSource?: OptionsType['data']['source']): Promise<unknown>;

  on(name: string, fn: () => any): void;

  dimensions(): CalHeatmap.Dimensions;

  destroy(): Promise<unknown>;

  extendDayjs(plugin: PluginFunc): dayjs.Dayjs;
}

export = CalHeatmap;
export as namespace CalHeatmap;
