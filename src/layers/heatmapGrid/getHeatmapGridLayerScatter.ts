/**
 * Heatmap Grid Layer using ScatterplotLayer (circles instead of polygons)
 * Converted from PolygonLayer to match the deckgl-heatmap-master optimized implementation
 *
 * PERF: Returns BOTH aggregated and detailed layers always (one empty, one populated).
 * This prevents DeckGL from destroying/recreating layers when switching between
 * aggregated and detailed views, which caused blank flashes during zoom transitions.
 */

import { ScatterplotLayer } from '@deck.gl/layers';
import { IDS, BASE_ZOOM } from '../../const';
import { OnClickType } from '../../DeckGLHeatmap.types';
import { HeatmapStateShape } from '../../types';

interface CropBox {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

interface HeatmapCellData {
  position: [number, number];
  color: [number, number, number, number];
  value: number;
  row: number;
  col: number;
  rowLabel: string;
  colLabel: string;
  isAggregated: boolean;
  aggregatedCount?: number;
  aggregationFactor?: number;
  rowIndices?: number[];
  colIndices?: number[];
}

// Helper: Determines the aggregation level based on zoom (BASE_ZOOM from const)
function getAggregationFactor(zoom: number): number {
  // Generic thresholds relative to BASE_ZOOM
  if (zoom >= BASE_ZOOM) return 1; // No aggregation at or above BASE_ZOOM
  if (zoom > BASE_ZOOM - 2) return 2; // 2x2 aggregation
  if (zoom > BASE_ZOOM - 4) return 4; // 4x4 aggregation
  return 8; // 8x8 aggregation at farthest zoom
}

// Helper: Checks if a cell is inside the user-defined crop box
function isInFilteredArea(rowIndex: number, colIndex: number, filteredIdxDict: CropBox | null): boolean {
  if (!filteredIdxDict) return true;
  return rowIndex >= filteredIdxDict.startY && rowIndex <= filteredIdxDict.endY &&
         colIndex >= filteredIdxDict.startX && colIndex <= filteredIdxDict.endX;
}

// --- AGGREGATION HELPER (OPTIMIZED WITH BOUNDS) ---
function getAggregatedCells(
  heatmapState: HeatmapStateShape,
  visibleBounds: {startRow: number, endRow: number, startCol: number, endCol: number},
  aggregationFactor: number,
  filteredIdxDict: CropBox | null,
  cellWidth: number,
  cellHeight: number,
  centeringX: number,
  centeringY: number,
  numColumns: number
): HeatmapCellData[] {
  const { cellData, colors, rowLabels, colLabels } = heatmapState;

  const gridCellMap = new Map<string, {
    count: number;
    sumValue: number;
    colors: number[];
    rowIndices: Set<number>;
    colIndices: Set<number>;
  }>();

  // Iterate using bounds for viewport culling
  for (let rowIndex = visibleBounds.startRow; rowIndex <= visibleBounds.endRow; rowIndex++) {
    for (let colIndex = visibleBounds.startCol; colIndex <= visibleBounds.endCol; colIndex++) {
      if (!isInFilteredArea(rowIndex, colIndex, filteredIdxDict)) continue;

      const cellIndex = rowIndex * numColumns + colIndex;

      const value = cellData.values[cellIndex];
      if (isNaN(value)) continue;

      const gridX = Math.floor(colIndex / aggregationFactor);
      const gridY = Math.floor(rowIndex / aggregationFactor);
      const key = `${gridX}:${gridY}`;

      if (!gridCellMap.has(key)) {
        gridCellMap.set(key, { count: 0, sumValue: 0, colors: [0,0,0,0], rowIndices: new Set(), colIndices: new Set() });
      }

      const cell = gridCellMap.get(key)!;
      cell.count++;
      cell.sumValue += value;
      cell.rowIndices.add(rowIndex);
      cell.colIndices.add(colIndex);
      if (colors) {
        cell.colors[0] += colors[cellIndex * 4];
        cell.colors[1] += colors[cellIndex * 4 + 1];
        cell.colors[2] += colors[cellIndex * 4 + 2];
        cell.colors[3] += colors[cellIndex * 4 + 3];
      }
    }
  }

  const cells: HeatmapCellData[] = [];

  Array.from(gridCellMap.entries()).forEach(([key, cell]) => {
    const [gridX, gridY] = key.split(':').map(Number);

    const avgColor: [number, number, number, number] = cell.count > 0 ? [
      Math.round(cell.colors[0] / cell.count),
      Math.round(cell.colors[1] / cell.count),
      Math.round(cell.colors[2] / cell.count),
      Math.round(cell.colors[3] / cell.count)
    ] : [0, 0, 0, 255];

    const startRow = gridY * aggregationFactor;
    const startCol = gridX * aggregationFactor;

    const adjustedRow = filteredIdxDict ? startRow - filteredIdxDict.startY : startRow;
    const adjustedCol = filteredIdxDict ? startCol - filteredIdxDict.startX : startCol;

    const x = (adjustedCol * cellWidth) + (aggregationFactor * cellWidth / 2) - centeringX;
    const y = (adjustedRow * cellHeight) + (aggregationFactor * cellHeight / 2) - centeringY;

    cells.push({
      position: [x, y],
      color: avgColor,
      value: cell.sumValue / cell.count,
      row: startRow,
      col: startCol,
      rowLabel: rowLabels[startRow] || '',
      colLabel: colLabels[startCol] || '',
      isAggregated: true,
      aggregatedCount: cell.count,
      aggregationFactor,
      rowIndices: Array.from(cell.rowIndices),
      colIndices: Array.from(cell.colIndices)
    });
  });

  return cells;
}

// Sentinel empty array — stable reference so DeckGL doesn't re-diff on every render
const EMPTY_DATA: HeatmapCellData[] = [];

/**
 * Returns an array of TWO layers (aggregated + detailed).
 * Only one has data at a time; the other gets EMPTY_DATA.
 * This prevents DeckGL from destroying/recreating layers during zoom transitions.
 */
export function getHeatmapGridLayer(
  heatmapState: HeatmapStateShape | null,
  opacityVal: number,
  onClick: OnClickType,
  viewState: any,
  filteredIdxDict: CropBox | null,
  debug?: boolean,
  visibleBounds?: {startRow: number, endRow: number, startCol: number, endCol: number} | null,
  numColumns?: number
) {
  if (!heatmapState?.cellData?.rowIndices || !viewState) {
    return null;
  }

  const zoom = viewState.zoom as number;
  const aggregationFactor = getAggregationFactor(zoom);
  const needsAggregation = aggregationFactor > 1;

  const { cellData, colors, cellDimensions, rowLabels, colLabels, width: heatmapWidth, height: heatmapHeight } = heatmapState;

  const cellWidth = cellDimensions?.width || 10;
  const cellHeight = cellDimensions?.height || 10;

  const baseScaleFactor = Math.pow(2, BASE_ZOOM);
  const centeringX = heatmapWidth / 2 / baseScaleFactor;
  const centeringY = heatmapHeight / 2 / baseScaleFactor;

  // Build aggregated cells (only when needed)
  let aggregatedCells: HeatmapCellData[] = EMPTY_DATA;
  if (needsAggregation && visibleBounds && numColumns) {
    aggregatedCells = getAggregatedCells(
      heatmapState,
      visibleBounds,
      aggregationFactor,
      filteredIdxDict,
      cellWidth,
      cellHeight,
      centeringX,
      centeringY,
      numColumns
    );
  }

  // Build detailed cells (only when NOT aggregating)
  let detailedCells: HeatmapCellData[] = EMPTY_DATA;
  if (!needsAggregation && visibleBounds && numColumns) {
    const cells: HeatmapCellData[] = [];
    for (let rowIndex = visibleBounds.startRow; rowIndex <= visibleBounds.endRow; rowIndex++) {
      for (let colIndex = visibleBounds.startCol; colIndex <= visibleBounds.endCol; colIndex++) {
        if (!isInFilteredArea(rowIndex, colIndex, filteredIdxDict)) continue;

        const cellIndex = rowIndex * numColumns + colIndex;
        const value = cellData.values[cellIndex];

        if (isNaN(value)) continue;

        const adjustedRow = filteredIdxDict ? rowIndex - filteredIdxDict.startY : rowIndex;
        const adjustedCol = filteredIdxDict ? colIndex - filteredIdxDict.startX : colIndex;

        const x = adjustedCol * cellWidth + cellWidth / 2 - centeringX;
        const y = adjustedRow * cellHeight + cellHeight / 2 - centeringY;

        const colorIndex = cellIndex * 4;
        const cellColor: [number, number, number, number] = colors ? [
          colors[colorIndex],
          colors[colorIndex + 1],
          colors[colorIndex + 2],
          colors[colorIndex + 3]
        ] : [128, 128, 128, 255];

        cells.push({
          position: [x, y],
          color: cellColor,
          value,
          row: rowIndex,
          col: colIndex,
          rowLabel: rowLabels[rowIndex] || '',
          colLabel: colLabels[colIndex] || '',
          isAggregated: false
        });
      }
    }
    detailedCells = cells;
  }

  // Always return BOTH layers — one has data, the other is empty.
  // DeckGL keeps both layer instances alive, avoiding destroy/recreate flashes.
  const aggregatedLayer = new ScatterplotLayer<HeatmapCellData>({
    id: 'heatmap-grid-layer-aggregated',
    viewId: IDS.VIEWS.HEATMAP_GRID,
    data: aggregatedCells,
    pickable: needsAggregation,
    filled: true,
    stroked: debug,

    getPosition: (d: HeatmapCellData) => d.position,

    getFillColor: (d: HeatmapCellData) => {
      const [r, g, b, a] = d.color;
      return [r, g, b, Math.floor(a * opacityVal)];
    },

    getRadius: (d: HeatmapCellData) => {
      const factor = d.aggregationFactor || 1;
      return Math.min(cellWidth, cellHeight) * factor / 2;
    },

    radiusMinPixels: 1,
    radiusMaxPixels: 1000,

    getLineColor: debug ? [255, 255, 255, 255] : [0, 0, 0, 0],
    getLineWidth: 1,

    onHover: (info, event) => {
      if (info.object) {
        const cell = info.object as HeatmapCellData;
        info.object = {
          aggregated: true,
          aggregationFactor: cell.aggregationFactor,
          cellCount: cell.aggregatedCount,
          value: cell.value,
          rowCount: cell.rowIndices?.length || 0,
          colCount: cell.colIndices?.length || 0,
          sampleRows: cell.rowIndices?.slice(0, 3).map(idx => rowLabels[idx]),
          sampleCols: cell.colIndices?.slice(0, 3).map(idx => colLabels[idx])
        };
      }
    },

    onClick,

    updateTriggers: {
      getPosition: [centeringX, centeringY, aggregationFactor, filteredIdxDict],
      getFillColor: [opacityVal, aggregationFactor],
      getRadius: [cellWidth, cellHeight, aggregationFactor],
    },
  });

  const detailedLayer = new ScatterplotLayer<HeatmapCellData>({
    id: 'heatmap-grid-layer-detailed',
    viewId: IDS.VIEWS.HEATMAP_GRID,
    data: detailedCells,
    pickable: !needsAggregation,
    filled: true,
    stroked: debug,

    getPosition: (d: HeatmapCellData) => d.position,

    getFillColor: (d: HeatmapCellData) => {
      const [r, g, b, a] = d.color;
      return [r, g, b, Math.floor(a * opacityVal)];
    },

    getRadius: () => {
      return Math.min(cellWidth, cellHeight) / 2;
    },

    radiusMinPixels: 1,
    radiusMaxPixels: 1000,

    getLineColor: debug ? [255, 255, 255, 255] : [0, 0, 0, 0],
    getLineWidth: 1,

    onHover: (info, _) => {
      if (info.object) {
        const cell = info.object as HeatmapCellData;
        info.object = {
          row: cell.rowLabel,
          col: cell.colLabel,
          value: cell.value,
          aggregated: false,
        };
      }
    },

    onClick,

    updateTriggers: {
      getPosition: [centeringX, centeringY, filteredIdxDict],
      getFillColor: [opacityVal, colors],
      getRadius: [cellWidth, cellHeight],
    },
  });

  return [aggregatedLayer, detailedLayer];
}
