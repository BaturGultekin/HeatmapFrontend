export const WORKFLOW_FORMAT = 'clusterchirp-workflow' as const;
export const WORKFLOW_SCHEMA_VERSION = '2.0' as const;

export type WorkflowSource =
    | 'gui'
    | 'nl'
    | 'imported';

export type WorkflowTarget =
    | 'rows'
    | 'columns'
    | 'both'
    | 'matrix';

export type WorkflowActionType =
    | 'filter'
    | 'inverse_filter'
    | 'variance_filter'
    | 'clear_filters'
    | 'zscore'
    | 'rezscore_filtered_subset'
    | 'cluster'
    | 'sort'
    | 'sort_by_metadata'
    | 'sort_by_expression'
    | 'set_distance'
    | 'set_linkage'
    | 'set_clustering'
    | 'transpose'
    | 'crop';

export interface WorkflowAction {
    id: string;

    type: WorkflowActionType;

    source: WorkflowSource;

    label: string;

    target?: WorkflowTarget;

    parameters: Record<string, unknown>;

    createdAt: string;
}

export interface WorkflowRecipe {
    format: typeof WORKFLOW_FORMAT;

    schemaVersion: typeof WORKFLOW_SCHEMA_VERSION;

    createdAt: string;

    actions: WorkflowAction[];
}


/*
 * Imported-workflow compatibility
 */

export type WorkflowValidationStatus =
    | 'ready'
    | 'warning'
    | 'needs_resolution'
    | 'blocked';

export type WorkflowIssueCode =
    | 'MISSING_METADATA_FIELD'
    | 'MISSING_METADATA_VALUE'
    | 'MISSING_FEATURE'
    | 'INVALID_PARAMETER'
    | 'UNSUPPORTED_ACTION'
    | 'DEPENDENCY_FAILED'
    | 'INCOMPATIBLE_WORKFLOW_VERSION';

export interface WorkflowIssue {
    code: WorkflowIssueCode;

    message: string;

    parameter?: string;

    availableValues?: string[];

    suggestedValue?: unknown;

    dependsOnActionId?: string;
}

export interface WorkflowStepValidation {
    status: WorkflowValidationStatus;

    issues: WorkflowIssue[];
}


/*
 * When an imported action must be adapted, always preserve
 * the original workflow action.
 */

export interface WorkflowResolutionChange {
    parameter: string;

    originalValue: unknown;

    resolvedValue: unknown;
}

export interface ImportedWorkflowStep {
    originalAction: WorkflowAction;

    /*
     * Present only when the user has adapted the original step
     * for the currently loaded dataset.
     */
    resolvedAction?: WorkflowAction;

    resolutionChanges: WorkflowResolutionChange[];

    /*
     * False means the user chose not to execute this step.
     * The original step remains available for review.
     */
    included: boolean;

    validation: WorkflowStepValidation;
}

export interface WorkflowPreflightResult {
    steps: ImportedWorkflowStep[];

    canRun: boolean;

    totalSteps: number;

    includedSteps: number;

    excludedSteps: number;

    modifiedSteps: number;

    unresolvedSteps: number;
}