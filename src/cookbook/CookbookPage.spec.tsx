import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route } from 'react-router-dom';

let mockNamespace = 'demo';

jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  DocumentTitle: ({ children }: { children: React.ReactNode }) => <title>{children}</title>,
  useActiveNamespace: () => [mockNamespace],
  k8sListItems: jest.fn().mockResolvedValue([]),
}));

import CookbookPage from './CookbookPage';
import { cookbookContent } from './content';
import { sectionId } from './types';

function renderCookbook(id: string) {
  render(
    <MemoryRouter initialEntries={[`/partner-labs-demos/${id}`]}>
      <Route path="/partner-labs-demos/:demoId" component={CookbookPage} />
    </MemoryRouter>,
  );
}

describe('CookbookPage', () => {
  beforeEach(() => {
    mockNamespace = 'demo';
  });
  it.each([
    ['create-vm', 'Creating Virtual Machines'],
    ['vm-templates-cookbook', 'Custom VM Templates'],
  ])('renders the %s cookbook', (id, title) => {
    renderCookbook(id);
    expect(screen.getByRole('heading', { level: 1, name: title })).toBeInTheDocument();
  });

  it('renders the how-to video', () => {
    renderCookbook('how-to-use-demos');
    expect(screen.getByTitle('How to Use Demos')).toHaveAttribute(
      'src',
      'https://www.youtube.com/embed/KWdPUqYu5tY?si=AAqlpK2Tml_Z5s0h',
    );
  });

  it('renders a jump link for every section', () => {
    renderCookbook('create-vm');
    const links = screen.getAllByRole('link', { hidden: true });
    expect(links).toHaveLength(cookbookContent['create-vm'].length + 1);
    expect(screen.getByText('On this page')).toBeInTheDocument();
  });

  it('keeps the contents panel sticky and scrolls a selected heading into view', () => {
    const scrollIntoView = jest.fn();
    Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
      configurable: true,
      value: scrollIntoView,
    });
    renderCookbook('create-vm');
    expect(screen.getByTestId('cookbook-toc')).toHaveClass('pf-m-sticky');
    const heading = cookbookContent['create-vm'][1].heading;
    const id = sectionId(heading, 1);
    fireEvent.click(within(screen.getByTestId(`jump-${id}`)).getByRole('link', { hidden: true }));
    expect(scrollIntoView).toHaveBeenCalledWith({ block: 'start' });
    expect(screen.getByRole('heading', { name: heading })).toHaveAttribute('tabindex', '-1');
  });

  it('disables project-scoped commands in All projects', () => {
    mockNamespace = '#ALL_NS#';
    renderCookbook('create-vm');
    expect(screen.getByText('All projects')).toBeInTheDocument();
    const disabledRun = screen
      .getAllByTestId('run-command')
      .find((button) => button.hasAttribute('disabled'));
    expect(disabledRun).toBeDefined();
    expect(screen.getByText('Select a project first')).toBeInTheDocument();
  });

  it('keeps placeholder commands manual and expands command output', async () => {
    renderCookbook('create-vm');
    expect(screen.getAllByText('Edit before running').length).toBeGreaterThan(0);
    const runButtons = screen.getAllByTestId('run-command');
    fireEvent.click(runButtons[0]);
    expect(await screen.findByTestId('command-output')).toBeInTheDocument();
    expect(screen.getByTestId('command-output')).toBeInTheDocument();
  });

  it('shows copied feedback after a successful clipboard write', async () => {
    const writeText = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
    renderCookbook('create-vm');
    const copyButton = screen.getAllByTestId('copy-command')[0];
    fireEvent.click(copyButton);
    expect(writeText).toHaveBeenCalled();
    fireEvent.mouseOver(copyButton);
    expect(await screen.findByText('Copied')).toBeInTheDocument();
  });
});
