"use client"
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button, Container, Form, Nav, Navbar } from 'react-bootstrap';
import { getSupabaseClient } from '../lib/supabase';

const TopBar = () => {

  const supabase = getSupabaseClient();
  const pathname = usePathname();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [authError, setAuthError] = useState('');

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
        setEmail('');
        setPassword('');
        setAuthError('');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const toggleTheme = () => {
    const newTheme = isDarkMode ? 'light' : 'dark';
    setIsDarkMode(!isDarkMode);
    document.body.setAttribute('data-bs-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  async function handleSignIn(event) {
    event.preventDefault();
    setAuthError('');

    if (!supabase) {
      setAuthError('Login is currently unavailable.');
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setAuthError('Enter your email address.');
      return;
    }

    if (!password) {
      setAuthError('Enter your password.');
      return;
    }

    setIsSigningIn(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (error) {
        setAuthError('Invalid email or password.');
        return;
      }

      setEmail('');
      setPassword('');
    } catch {
      setAuthError('Unable to log in. Please try again.');
    } finally {
      setIsSigningIn(false);
    }
  }

  async function handleSignOut() {
    if (!supabase) {
      return;
    }

    await supabase.auth.signOut();
  }

  return (
    <Navbar expand="lg" className="site-navbar">
      <Container>
        <Navbar.Brand as={Link} href="/">Tiago Souza<span className="brand-dot">.</span></Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" aria-label="Toggle navigation" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="site-nav me-auto">
            <Nav.Item>
              <Nav.Link as={Link} href="/" eventKey="/" active={pathname === '/' || pathname.startsWith('/posts/')} aria-current={pathname === '/' || pathname.startsWith('/posts/') ? 'page' : undefined}>
                Home
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link as={Link} href="/ebooks" eventKey="/ebooks" active={pathname === '/ebooks'} aria-current={pathname === '/ebooks' ? 'page' : undefined}>
                eBooks
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link as={Link} href="/about" eventKey="/about" active={pathname === '/about'} aria-current={pathname === '/about' ? 'page' : undefined}>
                About
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link as={Link} href="/snippets" eventKey="/snippets" active={pathname.startsWith('/snippets')} aria-current={pathname.startsWith('/snippets') ? 'page' : undefined}>
                Snippets
              </Nav.Link>
            </Nav.Item>

          </Nav>
          <Nav className="site-actions ms-auto align-items-lg-center gap-2">
            {!session ? (
              <Form onSubmit={handleSignIn} className="login-form d-flex gap-2 my-2 my-lg-0">
                <Form.Control
                  type="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setAuthError('');
                  }}
                  placeholder="Email"
                  aria-label="Email"
                  autoComplete="email"
                  size="sm"
                />
                <Form.Control
                  type="password"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setAuthError('');
                  }}
                  placeholder="Password"
                  aria-label="Password"
                  autoComplete="current-password"
                  size="sm"
                />
                <Button
                  type="submit"
                  variant="outline-secondary"
                  size="sm"
                  disabled={isSigningIn || !supabase}
                >
                  {isSigningIn ? 'Logging in...' : 'Login'}
                </Button>
                {authError && (
                  <span className="text-danger small align-self-center text-nowrap" role="alert">
                    {authError}
                  </span>
                )}
              </Form>
            ) : (
              <Button
                type="button"
                variant="outline-secondary"
                size="sm"
                onClick={handleSignOut}
              >
                Logout
              </Button>
            )}
            <Nav.Item>
              <button type="button" className="nav-link theme-toggle" onClick={toggleTheme} aria-label={isDarkMode ? 'Use light theme' : 'Use dark theme'}>
                {isDarkMode ? (
                  <i className="bi bi-sun"></i>
                ) : (
                  <i className="bi bi-moon"></i>
                )}
              </button>
            </Nav.Item>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default TopBar;
