// __mocks__/react-router-dom.js
export const useNavigate = jest.fn();
export const useLocation = jest.fn(() => ({}));
export const Link = ({ children }) => <div>{children}</div>;
export const Navigate = ({ children }) => <div>{children}</div>;
export const Outlet = () => <div />;
export const useParams = jest.fn(() => ({}));

// Add other router components you use