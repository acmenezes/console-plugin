import { render, screen } from '@testing-library/react';

jest.mock('react-router-dom-v5-compat', () => ({
  CompatRouter: ({ children }: { children: React.ReactNode }) => (
    <div data-test="compat-router">{children}</div>
  ),
}));

import RouterBridge from './RouterBridge';

it('uses CompatRouter when the Console 4.19–4.21 export is present', () => {
  render(
    <RouterBridge>
      <span data-test="plugin-page" />
    </RouterBridge>,
  );
  expect(screen.getByTestId('compat-router')).toContainElement(screen.getByTestId('plugin-page'));
});
