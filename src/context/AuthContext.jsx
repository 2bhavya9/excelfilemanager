import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

/** Simple non-cryptographic hash — good enough for local-only localStorage demo */
function simpleHash(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul((h << 5) + h, 1) ^ str.charCodeAt(i);
  }
  return (h >>> 0).toString(36);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => localStorage.getItem('auth_user') || null);

  function register(email, password) {
    email = email.trim();
    if (!email || !password) return { success: false, message: 'Email and password are required.' };
    if (password.length < 6) return { success: false, message: 'Password must be at least 6 characters.' };

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, message: 'Email already registered.' };
    }
    users.push({ email, password: simpleHash(password) });
    localStorage.setItem('users', JSON.stringify(users));
    return { success: true, message: 'Registration successful.' };
  }

  function login(email, password) {
    email = email.trim();
    if (!email || !password) return { success: false, message: 'Email and password are required.' };

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const found = users.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === simpleHash(password)
    );
    if (found) {
      setUser(found.email);
      localStorage.setItem('auth_user', found.email);
      return { success: true };
    }
    return { success: false, message: 'Invalid email or password.' };
  }

  function logout() {
    setUser(null);
    localStorage.removeItem('auth_user');
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
