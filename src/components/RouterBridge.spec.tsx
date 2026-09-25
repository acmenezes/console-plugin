import { render, screen } from '@testing-library/react';

jest.mock('react-router-dom-v5-compat', () => ({ CompatRouter: undefined }));

import RouterBridge from './RouterBridge';

it('renders pages when Console does not export CompatRouter', () => {
  render(
    <RouterBridge>
      <span data-test="plugin-page" />
    </RouterBridge>,
  );
  expect(screen.getByTestId('plugin-page')).toBeInTheDocument();
});
