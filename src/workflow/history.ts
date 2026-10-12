import { WorkflowAction } from './types';

/*
 * `cursor` is the number of workflow actions currently applied.
 *
 * Example:
 *
 * actions = [A, B, C, D]
 * cursor  = 2
 *
 * Active workflow:
 * A → B
 *
 * Redo branch:
 * C → D
 */
export interface WorkflowHistoryState {
    actions: WorkflowAction[];
    cursor: number;
}

export const createEmptyWorkflowHistory =
    (): WorkflowHistoryState => ({
        actions: [],
        cursor: 0
    });


/*
 * Return only the actions that belong to the currently
 * active analysis path.
 */
export const getActiveWorkflowActions = (
    history: WorkflowHistoryState
): WorkflowAction[] => {
    return history.actions.slice(0, history.cursor);
};


/*
 * Actions after the cursor are currently available for redo.
 */
export const getRedoWorkflowActions = (
    history: WorkflowHistoryState
): WorkflowAction[] => {
    return history.actions.slice(history.cursor);
};


export const canUndoWorkflow = (
    history: WorkflowHistoryState
): boolean => {
    return history.cursor > 0;
};


export const canRedoWorkflow = (
    history: WorkflowHistoryState
): boolean => {
    return history.cursor < history.actions.length;
};


/*
 * Add a new analytical action.
 *
 * If the user previously undid one or more operations,
 * discard that abandoned redo branch before appending
 * the new action.
 *
 * Example:
 *
 * A → B → C → D
 *         ↑ cursor after undo
 *
 * append X
 *
 * becomes:
 *
 * A → B → X
 */
export const appendWorkflowAction = (
    history: WorkflowHistoryState,
    action: WorkflowAction
): WorkflowHistoryState => {

    const activeActions =
        history.actions.slice(0, history.cursor);

    const nextActions = [
        ...activeActions,
        action
    ];

    return {
        actions: nextActions,
        cursor: nextActions.length
    };
};


export const undoWorkflowAction = (
    history: WorkflowHistoryState
): WorkflowHistoryState => {

    if (!canUndoWorkflow(history)) {
        return history;
    }

    return {
        ...history,
        cursor: history.cursor - 1
    };
};


export const redoWorkflowAction = (
    history: WorkflowHistoryState
): WorkflowHistoryState => {

    if (!canRedoWorkflow(history)) {
        return history;
    }

    return {
        ...history,
        cursor: history.cursor + 1
    };
};


export const clearWorkflowHistory =
    (): WorkflowHistoryState => ({
        actions: [],
        cursor: 0
    });


/*
 * Replace the complete history.
 *
 * This will later be useful after importing a workflow
 * or resetting/replaying one.
 */
export const replaceWorkflowHistory = (
    actions: WorkflowAction[],
    cursor: number = actions.length
): WorkflowHistoryState => {

    const safeCursor = Math.max(
        0,
        Math.min(cursor, actions.length)
    );

    return {
        actions: [...actions],
        cursor: safeCursor
    };
};