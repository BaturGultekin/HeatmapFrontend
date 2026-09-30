// data-worker.ts

import { computeDataState } from '../computeDatastate'; // This function contains the logic from useDataState without hooks
import { getHeatmapState } from '../state/getHeatmapState'; // Your heatmap state computation function
import { DataStateShape } from '../types';

// Global state stored between messages
let currentDataState: DataStateShape | null = null;
// Cache the last heatmapState params so we can recompute heatmapState when dataState changes
let lastHeatmapParams: {
  colLabelsWidth: number;
  rowLabelsWidth: number;
  dimensions: any;
  ID: any;
  panelWidth: number;
} | null = null;

function transposeDataState(
  dataState: DataStateShape | null
): DataStateShape | null {
  if (!dataState) return null;

  const {
    values,
    numRows,
    numColumns,
    rowLabels,
    colLabels,
    sortedRowIndices,
    sortedColIndices,
  } = dataState;

  const transposedValues = new Float32Array(values.length);

  // Original index:
  // values[row * numColumns + col]
  //
  // Transposed index:
  // values[col * numRows + row]
  for (let row = 0; row < numRows; row++) {
    for (let col = 0; col < numColumns; col++) {
      transposedValues[col * numRows + row] =
        values[row * numColumns + col];
    }
  }

  return {
    ...dataState,

    values: transposedValues,

    // R × C becomes C × R
    numRows: numColumns,
    numColumns: numRows,

    // Column labels become row labels and vice versa
    rowLabels: colLabels.map((label, index) => ({
      ...label,
      position: index,
    })),

    colLabels: rowLabels.map((label, index) => ({
      ...label,
      position: index,
      metadata: {},
    })),

    // Preserve mapping back to the original data axes
    sortedRowIndices: sortedColIndices,
    sortedColIndices: sortedRowIndices,
  };
}

self.addEventListener('message', (event: MessageEvent) => {
  const message = event.data;

  if (message.messageType === 'dataState') {
    // Compute the data state based on the incoming JSON data, order, categories
    // croppedRowIndices/croppedColIndices: Arrays of ORIGINAL indices to include (for crop)
    const computedDataState = computeDataState(
      message.data,
      message.order,
      message.catTemporary,
      message.croppedRowIndices,
      message.croppedColIndices
    );

    currentDataState =
      message.transpose === true
        ? transposeDataState(computedDataState)
        : computedDataState;

    // Also recompute heatmapState if we have cached dimension params.
    // This ensures both states are sent together — preventing a blank frame where
    // the main thread has new dataState but stale heatmapState (old colors/values).
    if (lastHeatmapParams) {
      const heatmapState = getHeatmapState(
        currentDataState,
        lastHeatmapParams.colLabelsWidth,
        lastHeatmapParams.rowLabelsWidth,
        lastHeatmapParams.dimensions,
        lastHeatmapParams.ID,
        lastHeatmapParams.panelWidth
      );
      self.postMessage({ dataState: currentDataState, heatmapState });
    } else {
      self.postMessage({ dataState: currentDataState });
    }
  } else if (message.messageType === 'heatmapState') {
    // Cache the dimension params for future dataState recomputes
    lastHeatmapParams = {
      colLabelsWidth: message.colLabelsWidth,
      rowLabelsWidth: message.rowLabelsWidth,
      dimensions: message.dimensions,
      ID: message.ID,
      panelWidth: message.panelWidth,
    };

    if (currentDataState) {
      const heatmapState = getHeatmapState(
        currentDataState,
        message.colLabelsWidth,
        message.rowLabelsWidth,
        message.dimensions,
        message.ID,
        message.panelWidth
      );
      self.postMessage({ heatmapState });
    } else {
      self.postMessage({ heatmapState: null, error: 'dataState not computed yet' });
    }
  }
});
