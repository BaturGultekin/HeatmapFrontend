import {
    WorkflowAction,
    WorkflowActionType,
    WorkflowSource,
    WorkflowTarget
} from './types';


interface CreateWorkflowActionOptions {
    type: WorkflowActionType;

    source: WorkflowSource;

    label: string;

    target?: WorkflowTarget;

    parameters?: Record<string, unknown>;
}


const createWorkflowActionId = (): string => {

    if (
        typeof crypto !== 'undefined' &&
        typeof crypto.randomUUID === 'function'
    ) {
        return crypto.randomUUID();
    }

    return [
        'workflow',
        Date.now(),
        Math.random().toString(36).slice(2)
    ].join('-');
};


export const createWorkflowAction = (
    options: CreateWorkflowActionOptions
): WorkflowAction => {

    return {
        id: createWorkflowActionId(),

        type: options.type,

        source: options.source,

        label: options.label,

        target: options.target,

        parameters: options.parameters ?? {},

        createdAt: new Date().toISOString()
    };
};