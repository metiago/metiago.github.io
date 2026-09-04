"use client"
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button, Container, Form, Nav, Navbar } from 'react-bootstrap';
import { getSupabaseClient } from '../lib/supabase';

const TopBar = () => {

  const supabase = getSupabaseClient();
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
    <Navbar expand="lg" className="bg-body-tertiary">
      <Container>
        <Navbar.Brand href="#home">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-code-slash" viewBox="0 0 16 16">
            <path d="M10.478 1.647a.5.5 0 1 0-.956-.294l-4 13a.5.5 0 0 0 .956.294zM4.854 4.146a.5.5 0 0 1 0 .708L1.707 8l3.147 3.146a.5.5 0 0 1-.708.708l-3.5-3.5a.5.5 0 0 1 0-.708l3.5-3.5a.5.5 0 0 1 .708 0m6.292 0a.5.5 0 0 0 0 .708L14.293 8l-3.147 3.146a.5.5 0 0 0 .708.708l3.5-3.5a.5.5 0 0 0 0-.708l-3.5-3.5a.5.5 0 0 0-.708 0" />
          </svg>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Item>
              <Nav.Link as={Link} href="/" eventKey="/">
                Home
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link as={Link} href="/ebooks" eventKey="/ebooks">
                eBooks
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link as={Link} href="/about" eventKey="/about">
                About
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link as={Link} href="/snippets" eventKey="/snippets">
                Snippets
              </Nav.Link>
            </Nav.Item>

          </Nav>
          <Nav className="ms-auto align-items-lg-center gap-2">
            {!session ? (
              <Form onSubmit={handleSignIn} className="d-flex gap-2 my-2 my-lg-0">
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
              <button className="nav-link" onClick={toggleTheme} aria-label="Toggle theme">
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
