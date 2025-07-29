import { Link } from 'react-router-dom';

// Define the type of roles used in your app
export type Role = 'user' | 'seller' | 'admin';

interface NavLinksProps {
  role: Role;
  direction?: 'horizontal' | 'vertical';
  className?: string;
}

// Define common nav items for all roles
const COMMON_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/products', label: 'Shop' },
];

// Role-specific navigation items
const ROLE_LINKS: Record<Role, { to: string; label: string }[]> = {
  user: [
    { to: '/cart', label: 'Cart' },
    { to: '/orders', label: 'My Orders' },
  ],
  seller: [
    { to: '/dashboard', label: 'Seller Dashboard' },
    { to: '/products/add', label: 'Add Product' },
    { to: '/products/manage', label: 'Manage Products' },
  ],
  admin: [
    { to: '/admin/dashboard', label: 'Admin Dashboard' },
    { to: '/admin/users', label: 'Manage Users' },
    { to: '/admin/sellers', label: 'Verify Sellers' },
    { to: '/admin/products', label: 'Product Moderation' },
  ],
};

// Account-related links (can be used by all)
const ACCOUNT_LINKS = [
  { to: '/profile', label: 'Profile' },
  { to: '/logout', label: 'Logout' },
];

export const NavLinks = ({
  role,
  direction = 'horizontal',
  className = '',
}: NavLinksProps) => {
  const allLinks = [
    ...COMMON_LINKS,
    ...ROLE_LINKS[role],
    ...ACCOUNT_LINKS,
  ];

  const layout =
    direction === 'horizontal'
      ? 'flex space-x-4'
      : 'flex flex-col space-y-2';

  return (
    <nav className={`${layout} ${className}`}>
      {allLinks.map((link) => (
        <Link
          key={link.to}
          to={link.to}
          className="text-sm text-gray-700 hover:text-blue-600 px-3 py-2 rounded transition"
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
};
