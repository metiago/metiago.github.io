"use client"
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { getSupabaseClient } from '../lib/supabase';

const TopBar = () => {
  const pathname = usePathname();
  const supabase = getSupabaseClient();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const currentTheme = localStorage.getItem('theme') || 'light';
    setIsDarkMode(currentTheme === 'dark');
    document.body.setAttribute('data-bs-theme', currentTheme);
  }, []);

  useEffect(() => {
    if (!supabase) {
      return undefined;
    }

    async function loadSession() {
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();
      setSession(currentSession);
    }

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      if (currentSession) {
        setIsLoginOpen(false);
        setEmail('');
        setPassword('');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    function handleOutsideClick(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsLoginOpen(false);
      }
    }

    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  const toggleTheme = () => {
    const newTheme = isDarkMode ? 'light' : 'dark';
    setIsDarkMode(!isDarkMode);
    document.body.setAttribute('data-bs-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const toggleLogin = () => {
    setIsLoginOpen((current) => !current);
  };

  async function handleSignIn(event) {
    event.preventDefault();

    if (!supabase) {
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      return;
    }

    if (!password) {
      return;
    }

    setIsSigningIn(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    setIsSigningIn(false);

    if (!error) {
      setIsLoginOpen(false);
      setEmail('');
      setPassword('');
    }
  }

  async function handleSignOut() {
    if (!supabase) {
      return;
    }

    await supabase.auth.signOut();
    setIsLoginOpen(false);
  }

  return (
    <>
      <div className="container">
        <header className="d-flex flex-wrap align-items-center justify-content-between py-3 mb-4 border-bottom gap-3">
          <ul className="nav nav-pills">
            <li className="nav-item">
              <Link href="/" className={`nav-link ${pathname === '/' ? 'active' : ''}`} aria-current="page">
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/ebooks" className={`nav-link ${pathname === '/ebooks' ? 'active' : ''}`}>
                eBooks
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/about" className={`nav-link ${pathname === '/about' ? 'active' : ''}`}>
                About
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/snippets" className={`nav-link ${pathname === '/snippets' ? 'active' : ''}`}>
                Snippets
              </Link>
            </li>
            <li className="nav-item">
              <button className="nav-link" onClick={toggleTheme} aria-label="Toggle theme">
                {isDarkMode ? (
                  <i className="bi bi-sun"></i>
                ) : (
                  <i className="bi bi-moon"></i>
                )}
              </button>
            </li>
          </ul>
          <div className="position-relative" ref={dropdownRef}>
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={session ? handleSignOut : toggleLogin}
            >
              {session ? 'Logout' : 'Login'}
            </Button>
            {!session && isLoginOpen ? (
              <div className="topbar-login-dropdown">
                <Form onSubmit={handleSignIn} className="d-flex gap-2">
                  <div className="d-flex flex-column gap-2 w-100">
                    <Form.Control
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="Email"
                      autoComplete="email"
                      size="sm"
                    />
                    <Form.Control
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Password"
                      autoComplete="current-password"
                      size="sm"
                    />
                  </div>
                  <Button type="submit" size="sm" disabled={isSigningIn || !supabase}>
                    {isSigningIn ? '...' : 'Login'}
                  </Button>
                </Form>
              </div>
            ) : null}
          </div>
        </header>
      </div>
    </>
  );
}

export default TopBar;
