import {
  DocumentTitle,
  k8sListItems,
  ListPageHeader,
  ResourceLink,
  useActiveNamespace,
  useQuickStartContext,
  type K8sModel,
  type K8sResourceCommon,
} from '@openshift-console/dynamic-plugin-sdk';
import {
  Alert,
  Breadcrumb,
  BreadcrumbItem,
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  CodeBlock,
  CodeBlockCode,
  Gallery,
  GalleryItem,
  Label,
  PageSection,
  Spinner,
  Title,
} from '@patternfly/react-core';
import { useEffect, useRef, useState, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom-v5-compat';
import { ALL_NAMESPACES_KEY } from '../data/namespace';
import { cards } from '../data/cards';
import { ExampleLivePods } from './ExampleLivePods';
import RouterBridge from './RouterBridge';
import './example.css';

type ResourceKind = 'Pod' | 'Deployment' | 'ConfigMap';

const resources: Record<
  ResourceKind,
  {
    model: K8sModel;
    cliPlural: string;
    cliKind: string;
    groupVersionKind: { group?: string; version: string; kind: string };
  }
> = {
  Pod: {
    model: {
      apiVersion: 'v1',
      kind: 'Pod',
      abbr: 'P',
      label: 'Pod',
      labelPlural: 'Pods',
      plural: 'pods',
      namespaced: true,
    },
    cliPlural: 'pods',
    cliKind: 'pod',
    groupVersionKind: { version: 'v1', kind: 'Pod' },
  },
  Deployment: {
    model: {
      apiGroup: 'apps',
      apiVersion: 'v1',
      kind: 'Deployment',
      abbr: 'D',
      label: 'Deployment',
      labelPlural: 'Deployments',
      plural: 'deployments',
      namespaced: true,
    },
    cliPlural: 'deployments',
    cliKind: 'deployment.apps',
    groupVersionKind: { group: 'apps', version: 'v1', kind: 'Deployment' },
  },
  ConfigMap: {
    model: {
      apiVersion: 'v1',
      kind: 'ConfigMap',
      abbr: 'CM',
      label: 'ConfigMap',
      labelPlural: 'ConfigMaps',
      plural: 'configmaps',
      namespaced: true,
    },
    cliPlural: 'configmaps',
    cliKind: 'configmap',
    groupVersionKind: { version: 'v1', kind: 'ConfigMap' },
  },
};

interface CommandResult {
  kind: ResourceKind;
  namespace: string;
  items: K8sResourceCommon[];
}

const ExamplePageBody: FC<{ namespace: string }> = ({ namespace }) => {
  const { t } = useTranslation('plugin__partner-labs-console-plugin');
  const { setActiveQuickStart } = useQuickStartContext();
  const quickStartCard = cards.find((card) => card.kind === 'quickstart');
  const [selectedKind, setSelectedKind] = useState<ResourceKind>('Pod');
  const [result, setResult] = useState<CommandResult>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>('idle');
  const requestId = useRef(0);
  const hasProject = Boolean(namespace) && namespace !== ALL_NAMESPACES_KEY;
  const option = resources[selectedKind];
  const visibleItems = result?.items.slice(0, 20) ?? [];
  const command = hasProject
    ? `oc get ${option.cliPlural} -n ${namespace} -o name`
    : `oc get ${option.cliPlural} -n <project> -o name`;

  useEffect(() => {
    // Ignore a query that completes after this project view unmounts.
    return () => {
      requestId.current += 1;
    };
  }, []);

  const runList = async (kind: ResourceKind) => {
    setSelectedKind(kind);
    setResult(undefined);
    setError(undefined);
    setCopyState('idle');
    if (!hasProject) return;
    const currentRequest = ++requestId.current;
    setLoading(true);
    try {
      const items = await k8sListItems({
        model: resources[kind].model,
        queryParams: { ns: namespace },
      });
      if (currentRequest === requestId.current) setResult({ kind, namespace, items });
    } catch (cause) {
      if (currentRequest === requestId.current) {
        setError(cause instanceof Error ? cause.message : String(cause));
      }
    } finally {
      if (currentRequest === requestId.current) setLoading(false);
    }
  };

  const copyCommand = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopyState('copied');
    } catch {
      setCopyState('error');
    }
  };

  return (
    <>
      <DocumentTitle>{t('Custom Page')}</DocumentTitle>
      <ListPageHeader title={t('Custom Page')} />
      <PageSection>
        <div className="partner-labs-console-plugin__example">
          <Breadcrumb>
            <BreadcrumbItem>
              <Link to="/partner-labs-demos" data-test="back-to-demos">
                {t('Partner Labs Demos')}
              </Link>
            </BreadcrumbItem>
            <BreadcrumbItem isActive>{t('Custom Page')}</BreadcrumbItem>
          </Breadcrumb>
          <Title headingLevel="h2" size="xl">
            {t('Console SDK examples')}
          </Title>
          <p>
            {t(
              'This page is provided by a console.page/route extension. It uses Console SDK APIs to read resources in the active project.',
            )}
          </p>
          <Gallery hasGutter minWidths={{ default: '320px' }}>
            <GalleryItem>
              <Card isFullHeight>
                <CardHeader>
                  <CardTitle>{t('Active project')}</CardTitle>
                </CardHeader>
                <CardBody>
                  <Label data-test="active-project">
                    {hasProject ? namespace : t('All projects')}
                  </Label>
                  <p>
                    {t(
                      'useActiveNamespace keeps this page in sync with the Console project selector.',
                    )}
                  </p>
                </CardBody>
              </Card>
            </GalleryItem>
            <GalleryItem>
              <Card isFullHeight>
                <CardHeader>
                  <CardTitle>{t('Web Terminal')}</CardTitle>
                </CardHeader>
                <CardBody>
                  <p>
                    {t(
                      'If the Web Terminal Operator is installed, open Web Terminal from the Console header and paste the copied command.',
                    )}
                  </p>
                  <p>
                    {t(
                      'The Console SDK does not expose a shell execution API. The buttons below use read-only Kubernetes API calls instead.',
                    )}
                  </p>
                </CardBody>
              </Card>
            </GalleryItem>
            <GalleryItem>
              <ExampleLivePods namespace={namespace} />
            </GalleryItem>
            <GalleryItem>
              <Card isFullHeight>
                <CardHeader>
                  <CardTitle>{t('Quick Start integration')}</CardTitle>
                </CardHeader>
                <CardBody>
                  <p>
                    {t(
                      'useQuickStartContext opens a guided walkthrough provided by a ConsoleQuickStart resource.',
                    )}
                  </p>
                  <p>
                    {t(
                      'The bundled walkthrough is available when this plugin is installed with its Helm chart.',
                    )}
                  </p>
                  <Button
                    variant="link"
                    isDisabled={!setActiveQuickStart || quickStartCard?.kind !== 'quickstart'}
                    onClick={() => {
                      if (quickStartCard?.kind === 'quickstart') {
                        setActiveQuickStart?.(quickStartCard.quickStartId);
                      }
                    }}
                    data-test="open-example-quickstart"
                  >
                    {t('Open VM walkthrough')}
                  </Button>
                </CardBody>
              </Card>
            </GalleryItem>
          </Gallery>
          <Card className="partner-labs-console-plugin__example-runner">
            <CardHeader>
              <CardTitle>{t('Run a read-only SDK query')}</CardTitle>
            </CardHeader>
            <CardBody>
              <p>
                {t(
                  'Choose a resource. The matching oc command is shown for Web Terminal, while k8sListItems returns the result here.',
                )}
              </p>
              <div className="partner-labs-console-plugin__example-actions">
                <Button
                  variant="secondary"
                  isDisabled={!hasProject || loading}
                  onClick={() => void runList('Pod')}
                  data-test="list-pods"
                >
                  {t('List pods')}
                </Button>
                <Button
                  variant="secondary"
                  isDisabled={!hasProject || loading}
                  onClick={() => void runList('Deployment')}
                  data-test="list-deployments"
                >
                  {t('List deployments')}
                </Button>
                <Button
                  variant="secondary"
                  isDisabled={!hasProject || loading}
                  onClick={() => void runList('ConfigMap')}
                  data-test="list-configmaps"
                >
                  {t('List config maps')}
                </Button>
              </div>
              {!hasProject && (
                <Alert variant="info" isInline title={t('Select a project to run a query')} />
              )}
              <div className="partner-labs-console-plugin__example-command">
                <CodeBlock>
                  <CodeBlockCode>{command}</CodeBlockCode>
                </CodeBlock>
                <Button
                  variant="link"
                  onClick={() => void copyCommand()}
                  data-test="copy-example-command"
                >
                  {copyState === 'copied' ? t('Copied') : t('Copy command')}
                </Button>
              </div>
              {copyState === 'error' && (
                <Alert
                  variant="warning"
                  isInline
                  title={t('Clipboard unavailable. Select and copy the command above.')}
                />
              )}
              {loading && (
                <div role="status">
                  <Spinner size="md" /> {t('Loading resources…')}
                </div>
              )}
              {error && (
                <Alert
                  variant="danger"
                  isInline
                  title={t('Could not load resources')}
                  data-test="example-query-error"
                >
                  {error}
                </Alert>
              )}
              {result && (
                <div
                  className="partner-labs-console-plugin__example-output"
                  data-test="example-query-output"
                >
                  <Title headingLevel="h3" size="md">
                    {t('SDK result')}
                  </Title>
                  <CodeBlock>
                    <CodeBlockCode>
                      {result.items.length
                        ? visibleItems
                            .map(
                              (item) =>
                                `${resources[result.kind].cliKind}/${item.metadata?.name ?? ''}`,
                            )
                            .join('\n')
                        : t('No resources found.')}
                    </CodeBlockCode>
                  </CodeBlock>
                  {result.items.length > visibleItems.length && (
                    <p>
                      {t('Showing the first {{count}} resources.', { count: visibleItems.length })}
                    </p>
                  )}
                  {result.items.length > 0 && (
                    <div className="partner-labs-console-plugin__example-links">
                      {visibleItems.map((item) => (
                        <ResourceLink
                          key={item.metadata?.uid ?? item.metadata?.name}
                          groupVersionKind={resources[result.kind].groupVersionKind}
                          name={item.metadata?.name}
                          namespace={result.namespace}
                          dataTest={`example-resource-${item.metadata?.name ?? ''}`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardBody>
          </Card>
          <p>
            {t('Build your own page:')}{' '}
            <a
              href="https://github.com/redhat-openshift-partner-labs/console-plugin/blob/main/AGENTS.md#adding-a-new-page"
              target="_blank"
              rel="noopener noreferrer"
              data-test="adding-page-guide"
            >
              {t('Adding a New Page')}
            </a>
          </p>
        </div>
      </PageSection>
    </>
  );
};

const ExamplePageContent: FC = () => {
  const [namespace] = useActiveNamespace();
  return <ExamplePageBody key={namespace} namespace={namespace} />;
};

const ExamplePage: FC = () => (
  <RouterBridge>
    <ExamplePageContent />
  </RouterBridge>
);

export default ExamplePage;
