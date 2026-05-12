export const commonLinks = [
  { label: 'About Us', path: '/about' },
  { label: 'Privacy Policy', path: '/privacy' },
  { label: 'Contact Us', path: '/contact' },
];

export const roleBasedLinks = {
  guest: [
    { label: 'Login', path: '/login' },
    { label: 'Register', path: '/register' },
  ],
  user: [
    { label: 'Orders', path: '/user/orders' },
    { label: 'Wishlist', path: '/user/wishlist' },
  ],
  seller: [
    { label: 'Dashboard', path: '/seller/dashboard' },
    { label: 'Manage Products', path: '/seller/products' },
  ],
  admin: [
    { label: 'Admin Panel', path: '/admin' },
    { label: 'User Management', path: '/admin/users' },
  ],
};
