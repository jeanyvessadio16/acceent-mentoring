'use client';

import React from 'react';
import {
  USER_ROLE_COOKIE,
  USER_ID_COOKIE,
  USER_NAME_COOKIE,
  USER_EMAIL_COOKIE,
} from './constants';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [role, setRole] = React.useState<string | null>(null);
  const [userId, setUserId] = React.useState<string | null>(null);
  const [userName, setUserName] = React.useState<string | null>(null);
  const [userEmail, setUserEmail] = React.useState<string | null>(null);

  React.useEffect(() => {
    const cookies = document.cookie.split('; ').reduce((acc, curr) => {
      const [key, value] = curr.split('=');
      if (key) acc[key] = value;
      return acc;
    }, {} as Record<string, string>);

    if (cookies[USER_ROLE_COOKIE] || cookies[USER_ID_COOKIE]) {
      setIsAuthenticated(true);
      setRole(cookies[USER_ROLE_COOKIE] || 'BENEFICIARY');
      setUserId(cookies[USER_ID_COOKIE] || null);

      if (cookies[USER_NAME_COOKIE]) {
        try {
          setUserName(decodeURIComponent(cookies[USER_NAME_COOKIE]));
        } catch {
          setUserName(cookies[USER_NAME_COOKIE]);
        }
      }

      if (cookies[USER_EMAIL_COOKIE]) {
        setUserEmail(cookies[USER_EMAIL_COOKIE]);
      }
    } else {
      setIsAuthenticated(false);
      setRole(null);
      setUserId(null);
      setUserName(null);
      setUserEmail(null);
    }
  }, []);

  return { isAuthenticated, role, userId, userName, userEmail };
}
