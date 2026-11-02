'use client';

import React from 'react';
import { USER_ROLE_COOKIE, USER_ID_COOKIE } from './constants';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [role, setRole] = React.useState<string | null>(null);

  React.useEffect(() => {
    const cookies = document.cookie.split('; ').reduce((acc, curr) => {
      const [key, value] = curr.split('=');
      if (key) acc[key] = value;
      return acc;
    }, {} as Record<string, string>);

    if (cookies[USER_ROLE_COOKIE] || cookies[USER_ID_COOKIE]) {
      setIsAuthenticated(true);
      setRole(cookies[USER_ROLE_COOKIE] || 'BENEFICIARY');
    } else {
      setIsAuthenticated(false);
      setRole(null);
    }
  }, []);

  return { isAuthenticated, role };
}
