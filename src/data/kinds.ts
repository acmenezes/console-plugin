import type { DemoCard } from './cards';
import { ALL_NAMESPACES_KEY } from './namespace';

export function getKinds(
  t: (key: string, options?: { namespace?: string }) => string,
  namespace: string,
): Record<
  DemoCard['kind'],
  { label: string; action: string; color: 'blue' | 'purple' | 'grey' | 'teal' | 'orange' }
> {
  return {
    page: { label: t('Page'), action: t('Open page'), color: 'blue' },
    cookbook: { label: t('Cookbook'), action: t('Open cookbook'), color: 'purple' },
    general: { label: t('Guide'), action: t('Open guide'), color: 'grey' },
    quickstart: { label: t('Walkthrough'), action: t('Start walkthrough'), color: 'teal' },
    pipeline: {
      label: t('Pipeline'),
      action:
        namespace === ALL_NAMESPACES_KEY
          ? t('Select a project to run')
          : t('Run in {{namespace}}', { namespace }),
      color: 'orange',
    },
  };
}
