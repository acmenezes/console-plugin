import { Fragment, type FC } from 'react';
import { CompatRouter } from 'react-router-dom-v5-compat';

// Console 4.19–4.21 needs CompatRouter; 4.22+ uses the router without that wrapper.
const RouterBridge: FC = ({ children }) => {
  const Router = (CompatRouter as FC | undefined) ?? Fragment;
  return <Router>{children}</Router>;
};

export default RouterBridge;
