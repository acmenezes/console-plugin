import type { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

export const PipelineRunModel = {
  apiVersion: 'v1',
  apiGroup: 'tekton.dev',
  kind: 'PipelineRun',
  abbr: 'PLR',
  label: 'PipelineRun',
  labelPlural: 'PipelineRuns',
  plural: 'pipelineruns',
  namespaced: true,
};

export type RunStatus = 'running' | 'succeeded' | 'failed';

export function getRunStatus(run: K8sResourceCommon | undefined): RunStatus {
  const conditions = (
    run as { status?: { conditions?: { type: string; status: string }[] } } | undefined
  )?.status?.conditions;
  const succeeded = conditions?.find((condition) => condition.type === 'Succeeded');
  if (succeeded?.status === 'True') return 'succeeded';
  if (succeeded?.status === 'False') return 'failed';
  return 'running';
}

// A stable name lets Kubernetes enforce one card run per namespace until it is deleted.
export const CARD_PIPELINE_RUN_NAME = 'partner-labs-demo';

export function pipelineRunPath(namespace: string, name: string): string {
  return `/k8s/ns/${encodeURIComponent(namespace)}/tekton.dev~v1~PipelineRun/${encodeURIComponent(name)}`;
}
