// src/components/Footer.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import type { UserRole } from '../../types/Roles';
import { commonLinks, roleBasedLinks } from './footerLinks';

interface FooterProps {
  role: UserRole;
}

const Footer: React.FC<FooterProps> = ({ role }) => {
  const roleLinks = roleBasedLinks[role] || [];

  return (
    <footer className="bg-gray-900 text-white p-6 mt-12">
      <div className="max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {/* Common Links */}
        <div>
          <h4 className="text-lg font-semibold mb-2">General</h4>
          {commonLinks.map(link => (
            <Link key={link.path} to={link.path} className="block text-sm hover:underline">
              {link.label}
            </Link>
          ))}
        </div>

        {/* Role-Specific Links */}
        <div>
          <h4 className="text-lg font-semibold mb-2 capitalize">{role} Links</h4>
          {roleLinks.map(link => (
            <Link key={link.path} to={link.path} className="block text-sm hover:underline">
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="text-center text-xs text-gray-400 mt-6">
        © {new Date().getFullYear()} Ecomm Store. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
