import React from 'react';
import { User } from './types';

export const AuthContext = React.createContext<{
  user: User | null;
  logout: () => void;
}>({
  user: null,
  logout: () => {},
});
