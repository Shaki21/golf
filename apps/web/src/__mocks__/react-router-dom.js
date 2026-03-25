/**
 * Manual mock for react-router-dom
 * Used when the actual module isn't available in test environment
 */
const React = require('react');

const mockNavigate = jest.fn();
const mockLocation = { pathname: '/', search: '', hash: '', state: null, key: 'default' };

module.exports = {
  BrowserRouter: ({ children }) => React.createElement('div', null, children),
  HashRouter: ({ children }) => React.createElement('div', null, children),
  MemoryRouter: ({ children }) => React.createElement('div', null, children),
  Router: ({ children }) => React.createElement('div', null, children),
  Routes: ({ children }) => React.createElement('div', null, children),
  Route: () => null,
  Link: ({ children, to, ...props }) => React.createElement('a', { href: to, ...props }, children),
  NavLink: ({ children, to, ...props }) => React.createElement('a', { href: to, ...props }, children),
  Navigate: () => null,
  Outlet: () => null,
  useNavigate: () => mockNavigate,
  useLocation: () => mockLocation,
  useParams: () => ({}),
  useSearchParams: () => [new URLSearchParams(), jest.fn()],
  useMatch: () => null,
  useRoutes: () => null,
  useHref: (to) => to,
  useResolvedPath: (to) => ({ pathname: to, search: '', hash: '' }),
  useOutlet: () => null,
  useOutletContext: () => null,
  createBrowserRouter: () => ({}),
  createHashRouter: () => ({}),
  createMemoryRouter: () => ({}),
  RouterProvider: ({ children }) => React.createElement('div', null, children),

  // For tests that need to access the mock
  __mockNavigate: mockNavigate,
  __mockLocation: mockLocation,
};
