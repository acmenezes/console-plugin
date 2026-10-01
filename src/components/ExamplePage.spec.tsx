import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

let mockNamespace = 'demo';
let mockPods: { metadata: { name: string; uid: string; creationTimestamp?: string } }[] = [];
const mockSetActiveQuickStart = jest.fn();
const mockSetUserSetting = jest.fn();

jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  DocumentTitle: ({ children }: { children: React.ReactNode }) => <title>{children}</title>,
  ListPageHeader: ({ title }: { title: string }) => <h1>{title}</h1>,
  ResourceLink: ({ name }: { name: string }) => <a href={`#${name}`}>{name}</a>,
  Timestamp: ({ timestamp }: { timestamp: string }) => <span>{timestamp}</span>,
  useActiveNamespace: () => [mockNamespace],
  useQuickStartContext: () => ({ setActiveQuickStart: mockSetActiveQuickStart }),
  useK8sWatchResource: jest.fn(() => [mockPods, true, undefined]),
  useUserSettings: () => [true, mockSetUserSetting, true],
  k8sListItems: jest.fn(),
}));

import ExamplePage from './ExamplePage';

const sdk = jest.requireMock<{ k8sListItems: jest.Mock; useK8sWatchResource: jest.Mock }>(
  '@openshift-console/dynamic-plugin-sdk',
);

function renderPage() {
  return render(
    <MemoryRouter>
      <ExamplePage />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  mockNamespace = 'demo';
  mockPods = [];
  jest.clearAllMocks();
  sdk.k8sListItems.mockResolvedValue([]);
});

describe('ExamplePage', () => {
  it('runs a read-only SDK query and prints output with resource links', async () => {
    sdk.k8sListItems.mockResolvedValue([{ metadata: { name: 'api-123', uid: '1' } }]);
    renderPage();
    fireEvent.click(screen.getByTestId('list-pods'));
    await waitFor(() => {
      expect(sdk.k8sListItems).toHaveBeenCalledTimes(1);
    });
    const calls = sdk.k8sListItems.mock.calls as unknown[][];
    expect(calls[0][0]).toMatchObject({ model: { kind: 'Pod' }, queryParams: { ns: 'demo' } });
    expect(await screen.findByTestId('example-query-output')).toHaveTextContent('pod/api-123');
    expect(screen.getByRole('link', { name: 'api-123' })).toBeInTheDocument();
    expect(screen.getByText('oc get pods -n demo -o name')).toBeInTheDocument();
  });

  it('requires a project before making a namespace-scoped query', () => {
    mockNamespace = '#ALL_NS#';
    renderPage();
    expect(screen.getByTestId('list-pods')).toBeDisabled();
    expect(screen.getByText('Select a project to run a query')).toBeInTheDocument();
    expect(sdk.k8sListItems).not.toHaveBeenCalled();
  });

  it.each([
    ['list-deployments', 'Deployment', 'oc get deployments -n demo -o name'],
    ['list-configmaps', 'ConfigMap', 'oc get configmaps -n demo -o name'],
  ])('shows the %s query', async (testId, kind, command) => {
    renderPage();
    fireEvent.click(screen.getByTestId(testId));
    await waitFor(() => {
      expect(sdk.k8sListItems).toHaveBeenCalledTimes(1);
    });
    const calls = sdk.k8sListItems.mock.calls as unknown[][];
    expect(calls[0][0]).toMatchObject({ model: { kind }, queryParams: { ns: 'demo' } });
    expect(screen.getByText(command)).toBeInTheDocument();
  });

  it('copies the displayed command for Web Terminal', async () => {
    const writeText = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
    renderPage();
    fireEvent.click(screen.getByTestId('copy-example-command'));
    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith('oc get pods -n demo -o name');
    });
    expect(await screen.findByText('Copied')).toBeInTheDocument();
  });

  it('shows API errors without presenting them as shell output', async () => {
    sdk.k8sListItems.mockRejectedValue(new Error('forbidden'));
    renderPage();
    fireEvent.click(screen.getByTestId('list-configmaps'));
    expect(await screen.findByTestId('example-query-error')).toHaveTextContent('forbidden');
    expect(screen.queryByTestId('example-query-output')).not.toBeInTheDocument();
  });

  it('watches pods in the active project and shows resource links', () => {
    mockPods = [
      { metadata: { name: 'api-123', uid: '1', creationTimestamp: '2026-09-24T00:00:00Z' } },
    ];
    renderPage();
    const calls = sdk.useK8sWatchResource.mock.calls as unknown[][];
    expect(calls[0][0]).toMatchObject({
      groupVersionKind: { kind: 'Pod' },
      namespace: 'demo',
      isList: true,
    });
    expect(screen.getByTestId('live-pod-count')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'api-123' })).toBeInTheDocument();
    expect(screen.getByText('2026-09-24T00:00:00Z')).toBeInTheDocument();
  });

  it('does not watch pods in All projects', () => {
    mockNamespace = '#ALL_NS#';
    renderPage();
    const calls = sdk.useK8sWatchResource.mock.calls as unknown[][];
    expect(calls[0][0]).toBeNull();
    expect(screen.getByText('Select a project to watch pods')).toBeInTheDocument();
  });

  it('saves the display choice and opens the bundled walkthrough', () => {
    renderPage();
    fireEvent.click(screen.getByTestId('show-pod-links'));
    expect(mockSetUserSetting).toHaveBeenCalledWith(false);
    fireEvent.click(screen.getByTestId('open-example-quickstart'));
    expect(mockSetActiveQuickStart).toHaveBeenCalledWith('vm-instancetypes-and-preferences');
  });
});
