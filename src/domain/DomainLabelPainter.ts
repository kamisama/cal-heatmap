import { Position } from '../constant';
import { DOMAIN_FORMAT } from '../calendar/DomainCollection';

import type CalHeatmap from '../CalHeatmap';

const DEFAULT_CLASSNAME = 'graph-label';

export default class DomainLabelPainter {
  calendar: CalHeatmap;

  constructor(calendar: CalHeatmap) {
    this.calendar = calendar;
  }

  paint(root: any): void {
    const { label, type } = this.calendar.options.options.domain;
    const { dateHelper } = this.calendar;
    let format = label.text;
    if (format === null || format === '') {
      return;
    }

    if (typeof format === 'undefined') {
      format = DOMAIN_FORMAT[type];
    }

    root
      .selectAll(`.${DEFAULT_CLASSNAME}`)
      .data(
        (d: any) => [d],
        (d: any) => d,
      )
      .join(
        (enter: any) => enter
          .append('text')
          .attr('class', DEFAULT_CLASSNAME)
          .attr('x', (d: any) => this.#getX(d))
          .attr('y', (d: any) => this.#getY(d))
          .attr('text-anchor', label.textAlign)
          .attr('dominant-baseline', () => this.#textVerticalAlign())
          .text((d: any, i: number, nodes: any[]) =>
          // eslint-disable-next-line implicit-arrow-linebreak
            dateHelper.format(d, format!, nodes[i]))
          .call((s: any) => this.#domainRotate(s)),
        (update: any) => {
          update
            .attr('x', (d: any) => this.#getX(d))
            .attr('y', (d: any) => this.#getY(d))
            .attr('text-anchor', label.textAlign)
            .attr('dominant-baseline', () => this.#textVerticalAlign())
            .text((d: any, i: number, nodes: any[]) =>
              // eslint-disable-next-line implicit-arrow-linebreak
              dateHelper.format(d, format!, nodes[i]))
            .call((s: any) => this.#domainRotate(s));
        },
      );
  }

  #textVerticalAlign(): string {
    const { position, rotate } = this.calendar.options.options.domain.label;

    if (['top', 'bottom'].includes(position)) {
      return 'middle';
    }

    if (
      (rotate === 'left' && position === 'left') ||
      (rotate === 'right' && position === 'right')
    ) {
      return 'bottom';
    }

    return 'hanging';
  }

  #getX(d: any): number {
    const {
      padding,
      label: { position, textAlign, offset },
    } = this.calendar.options.options.domain;
    const { domainHorizontalLabelWidth } = this.calendar.options.options.x;

    let x = padding[Position.LEFT];

    if (position === 'right') {
      x += this.#getDomainInsideWidth(d);
    }

    if (textAlign === 'middle') {
      if (['top', 'bottom'].includes(position)) {
        x += this.#getDomainInsideWidth(d) / 2;
      } else {
        x += domainHorizontalLabelWidth / 2;
      }
    }

    if (textAlign === 'end') {
      if (['top', 'bottom'].includes(position)) {
        x += this.#getDomainInsideWidth(d);
      } else {
        x += domainHorizontalLabelWidth;
      }
    }

    return x + offset.x;
  }

  #getY(d: any): number {
    const {
      domain: {
        label: { position, offset },
        padding,
      },
      x,
    } = this.calendar.options.options;

    let y = padding[Position.TOP] + x.domainVerticalLabelHeight / 2;

    if (position === 'bottom') {
      y += this.#getDomainInsideHeight(d);
    }

    return y + offset.y;
  }

  #getDomainInsideWidth(d: number): number {
    const {
      domain: { padding },
      x,
    } = this.calendar.options.options;
    return (
      this.calendar.calendarPainter.domainPainter.coordinates.get(d)!
        .inner_width -
      x.domainHorizontalLabelWidth -
      padding[Position.RIGHT] -
      padding[Position.LEFT]
    );
  }

  #getDomainInsideHeight(d: number): number {
    const {
      x,
      domain: { padding },
    } = this.calendar.options.options;
    return (
      this.calendar.calendarPainter.domainPainter.coordinates.get(d)!
        .inner_height -
      x.domainVerticalLabelHeight -
      padding[Position.TOP] -
      padding[Position.BOTTOM]
    );
  }

  #domainRotate(selection: any) {
    const {
      domain: {
        label: { rotate, textAlign, position },
      },
      x,
    } = this.calendar.options.options;
    const labelWidth = x.domainHorizontalLabelWidth;

    switch (rotate) {
      // Rotating the text clockwise
      case 'right':
        selection.attr('transform', (d: any) => {
          const domainWidth = this.#getDomainInsideWidth(d);
          const domainHeight = this.#getDomainInsideHeight(d);
          const s = [
            `rotate(90, ${position === 'right' ? domainWidth : labelWidth}, 0)`,
          ];

          switch (position) {
            case 'right':
              if (textAlign === 'middle') {
                s.push(`translate(${domainHeight / 2 - labelWidth / 2})`);
              } else if (textAlign === 'end') {
                s.push(`translate(${domainHeight - labelWidth})`);
              }
              break;
            case 'left':
              if (textAlign === 'start') {
                s.push(`translate(${labelWidth})`);
              } else if (textAlign === 'middle') {
                s.push(`translate(${labelWidth / 2 + domainHeight / 2})`);
              } else if (textAlign === 'end') {
                s.push(`translate(${domainHeight})`);
              }
              break;
            default:
          }

          return s.join(',');
        });
        break;
      // Rotating the text anticlockwise
      case 'left':
        selection.attr('transform', (d: any) => {
          const domainWidth = this.#getDomainInsideWidth(d);
          const domainHeight = this.#getDomainInsideHeight(d);
          const s = [
            `rotate(270, ${
              position === 'right' ? domainWidth : labelWidth
            }, 0)`,
          ];

          switch (position) {
            case 'right':
              if (textAlign === 'start') {
                s.push(`translate(-${domainHeight})`);
              } else if (textAlign === 'middle') {
                s.push(`translate(-${domainHeight / 2 + labelWidth / 2})`);
              } else if (textAlign === 'end') {
                s.push(`translate(-${labelWidth})`);
              }
              break;
            case 'left':
              if (textAlign === 'start') {
                s.push(`translate(${labelWidth - domainHeight})`);
              } else if (textAlign === 'middle') {
                s.push(`translate(${labelWidth / 2 - domainHeight / 2})`);
              }
              break;
            default:
          }

          return s.join(',');
        });
        break;
      default:
    }
  }
}