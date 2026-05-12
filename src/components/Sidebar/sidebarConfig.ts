export interface NavItem {
  label:    string;
  to:       string;
  icon:     string; // inline SVG path data
  end?:     boolean; // exact match for NavLink
  badge?:   string;
}

export interface NavGroup {
  heading?: string;
  items:    NavItem[];
}

// SVG path strings for icons (24x24 viewBox, stroke-based)
const icons = {
  home:       'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10',
  shop:       'M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z M3 6h18 M16 10a4 4 0 01-8 0',
  orders:     'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2 M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
  wishlist:   'M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z',
  profile:    'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 3a4 4 0 110 8 4 4 0 010-8z',
  dashboard:  'M3 3h7v7H3z M14 3h7v7h-7z M14 14h7v7h-7z M3 14h7v7H3z',
  products:   'M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z M3.27 6.96L12 12.01l8.73-5.05 M12 22.08V12',
  analytics:  'M18 20V10 M12 20V4 M6 20v-6',
  users:      'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 3a4 4 0 110 8 4 4 0 010-8z M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75',
  categories: 'M4 6h16M4 12h16M4 18h7',
  audit:      'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  settings:   'M12 15a3 3 0 100-6 3 3 0 000 6z M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z',
  address:    'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z',
  wallet:     'M21 12V7H5a2 2 0 010-4h14v4 M3 5v14a2 2 0 002 2h16v-5 M18 12a2 2 0 000 4h3v-4z',
};

export const SIDEBAR_NAV: Record<string, NavGroup[]> = {
  USER: [
    {
      items: [
        { label: 'Home',       to: '/',          icon: icons.home,     end: true },
        { label: 'Shop',       to: '/products',  icon: icons.shop },
        { label: 'My Orders',  to: '/orders',    icon: icons.orders },
        { label: 'Wishlist',   to: '/wishlist',  icon: icons.wishlist },
        { label: 'Addresses',  to: '/addresses', icon: icons.address },
        { label: 'Wallet',     to: '/wallet',    icon: icons.wallet },
      ],
    },
    {
      heading: 'Account',
      items: [
        { label: 'Profile',    to: '/profile',   icon: icons.profile },
        { label: 'Settings',   to: '/settings',  icon: icons.settings },
      ],
    },
  ],

  SELLER: [
    {
      items: [
        { label: 'Dashboard',  to: '/seller',              icon: icons.dashboard,  end: true },
        { label: 'Products',   to: '/seller/products',     icon: icons.products },
        { label: 'Orders',     to: '/seller/orders',       icon: icons.orders },
        { label: 'Analytics',  to: '/seller/analytics',    icon: icons.analytics },
      ],
    },
    {
      heading: 'Account',
      items: [
        { label: 'Profile',    to: '/seller/profile',   icon: icons.profile },
        { label: 'Settings',   to: '/seller/settings',  icon: icons.settings },
      ],
    },
  ],

  ADMIN: [
    {
      items: [
        { label: 'Dashboard',  to: '/admin',              icon: icons.dashboard,  end: true },
        { label: 'Users',      to: '/admin/users',        icon: icons.users },
        { label: 'Products',   to: '/admin/products',     icon: icons.products },
        { label: 'Orders',     to: '/admin/orders',       icon: icons.orders },
        { label: 'Categories', to: '/admin/categories',   icon: icons.categories },
        { label: 'Analytics',  to: '/admin/analytics',    icon: icons.analytics },
        { label: 'Audit Logs', to: '/admin/audit',        icon: icons.audit },
      ],
    },
    {
      heading: 'System',
      items: [
        { label: 'Settings',   to: '/admin/settings',  icon: icons.settings },
      ],
    },
  ],
};
