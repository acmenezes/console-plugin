import {
  ResourceLink,
  Timestamp,
  useK8sWatchResource,
  useUserSettings,
  type K8sResourceCommon,
} from '@openshift-console/dynamic-plugin-sdk';
import {
  Alert,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Label,
  Spinner,
  Switch,
} from '@patternfly/react-core';
import { useMemo, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { ALL_NAMESPACES_KEY } from '../data/namespace';

const POD_KIND = { version: 'v1', kind: 'Pod' };
const SETTING_KEY = 'partner-labs-console-plugin.example.showPodLinks';

export const ExampleLivePods: FC<{ namespace: string }> = ({ namespace }) => {
  const { t } = useTranslation('plugin__partner-labs-console-plugin');
  const hasProject = Boolean(namespace) && namespace !== ALL_NAMESPACES_KEY;
  const watch = useMemo(
    () => (hasProject ? { groupVersionKind: POD_KIND, namespace, isList: true, limit: 20 } : null),
    [hasProject, namespace],
  );
  const [pods, loaded, error] = useK8sWatchResource<K8sResourceCommon[]>(watch) as [
    K8sResourceCommon[],
    boolean,
    unknown,
  ];
  const [showPodLinks, setShowPodLinks, settingsLoaded] = useUserSettings<boolean>(
    SETTING_KEY,
    true,
  );
  const errorMessage =
    error instanceof Error
      ? error.message
      : typeof error === 'string'
        ? error
        : t('The watch failed.');

  return (
    <Card isFullHeight>
      <CardHeader>
        <CardTitle>{t('Live pod watch')}</CardTitle>
      </CardHeader>
      <CardBody>
        <p>{t('useK8sWatchResource updates this list when pods change in the active project.')}</p>
        <p>{t('This example watches up to 20 pods and displays the first five links.')}</p>
        <Switch
          id="partner-labs-console-plugin-show-pod-links"
          label={t('Show pod links')}
          isChecked={showPodLinks}
          isDisabled={!settingsLoaded}
          onChange={(_event, checked) => {
            setShowPodLinks(checked);
          }}
          data-test="show-pod-links"
        />
        <p>{t('useUserSettings saves this display choice in Console user preferences.')}</p>
        {!hasProject ? (
          <Alert variant="info" isInline title={t('Select a project to watch pods')} />
        ) : error ? (
          <Alert variant="danger" isInline title={t('Could not watch pods')}>
            {errorMessage}
          </Alert>
        ) : !loaded ? (
          <div role="status">
            <Spinner size="md" /> {t('Watching pods…')}
          </div>
        ) : (
          <>
            <Label data-test="live-pod-count">
              {t('{{count}} watched pods', { count: pods.length })}
            </Label>
            {showPodLinks && (
              <div
                className="partner-labs-console-plugin__example-live-list"
                data-test="live-pod-list"
              >
                {pods.length ? (
                  pods.slice(0, 5).map((pod) => (
                    <div
                      key={pod.metadata?.uid ?? pod.metadata?.name}
                      className="partner-labs-console-plugin__example-live-item"
                    >
                      <ResourceLink
                        groupVersionKind={POD_KIND}
                        name={pod.metadata?.name}
                        namespace={namespace}
                        dataTest={`live-pod-${pod.metadata?.name ?? ''}`}
                      />
                      {pod.metadata?.creationTimestamp && (
                        <Timestamp timestamp={pod.metadata.creationTimestamp} />
                      )}
                    </div>
                  ))
                ) : (
                  <p>{t('No pods in this project.')}</p>
                )}
              </div>
            )}
          </>
        )}
      </CardBody>
    </Card>
  );
};
