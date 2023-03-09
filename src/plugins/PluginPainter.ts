import type CalHeatmap from '../CalHeatmap';

class PluginPainter {
  calendar: CalHeatmap;

  constructor(calendar: CalHeatmap) {
    this.calendar = calendar;
  }

  paint(): Promise<unknown>[] {
    let promises: Promise<unknown>[] = [];

    promises = promises.concat(this.calendar.pluginManager.paintAll());
    promises = promises.concat(this.setPluginsPosition());
    promises = promises.concat(this.setDomainsPosition());

    return promises;
  }

  setPluginsPosition(): Promise<unknown>[] {
    const { pluginManager } = this.calendar;
    const { animationDuration } = this.calendar.options.options;
    const { domainsDimensions } = this.calendar.calendarPainter;

    const top = pluginManager.getFromPosition('top');
    const right = pluginManager.getFromPosition('right');
    const bottom = pluginManager.getFromPosition('bottom');
    const left = pluginManager.getFromPosition('left');

    const topHeight = pluginManager.getHeightFromPosition('top');
    const leftWidth = pluginManager.getWidthFromPosition('left');

    const promises: Promise<unknown>[] = [];

    let topOffset = 0;
    top.forEach((plugin) => {
      promises.push(
        plugin.root
          .transition()
          .duration(animationDuration)
          .attr('y', topOffset)
          .attr('x', leftWidth)
          .end(),
      );
      topOffset += plugin.options.dimensions!.height;
    });

    let leftOffset = 0;
    left.forEach((plugin) => {
      promises.push(
        plugin.root
          .transition()
          .duration(animationDuration)
          .attr('x', leftOffset)
          .attr('y', topHeight)
          .end(),
      );
      leftOffset += plugin.options.dimensions!.width;
    });

    bottom.forEach((plugin) => {
      promises.push(
        plugin.root
          .transition()
          .duration(animationDuration)
          .attr('x', leftWidth)
          .attr('y', topHeight + domainsDimensions.height)
          .end(),
      );
    });

    leftOffset += domainsDimensions.width;

    right.forEach((plugin) => {
      promises.push(
        plugin.root
          .transition()
          .duration(animationDuration)
          .attr('x', leftOffset)
          .attr('y', topHeight)
          .end(),
      );
      leftOffset += plugin.options.dimensions!.width;
    });

    return promises;
  }

  setDomainsPosition(): Promise<unknown>[] {
    const { animationDuration } = this.calendar.options.options;
    const topHeight = this.calendar.pluginManager.getHeightFromPosition('top');
    const leftWidth = this.calendar.pluginManager.getWidthFromPosition('left');

    return [
      this.calendar.calendarPainter.root
        .select('.graph')
        .transition()
        .duration(animationDuration)
        .call((selection: any) => {
          selection.attr('x', leftWidth).attr('y', topHeight);
        })
        .end(),
    ];
  }

  insideWidth() {
    return (
      this.calendar.pluginManager.getWidthFromPosition('left') +
      this.calendar.pluginManager.getWidthFromPosition('right')
    );
  }

  insideHeight() {
    return (
      this.calendar.pluginManager.getHeightFromPosition('top') +
      this.calendar.pluginManager.getHeightFromPosition('bottom')
    );
  }
}

export default PluginPainter;
