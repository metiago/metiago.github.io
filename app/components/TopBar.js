"use client"
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Button, Container, Form, Image, Nav, Navbar, NavDropdown } from 'react-bootstrap';
import { getSupabaseClient } from '../lib/supabase';

const TopBar = () => {

  const supabase = getSupabaseClient();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    <Navbar expand="lg" className="bg-body-tertiary">
      <Container>
        <Navbar.Brand href="#home">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-code-slash" viewBox="0 0 16 16">
            <path d="M10.478 1.647a.5.5 0 1 0-.956-.294l-4 13a.5.5 0 0 0 .956.294zM4.854 4.146a.5.5 0 0 1 0 .708L1.707 8l3.147 3.146a.5.5 0 0 1-.708.708l-3.5-3.5a.5.5 0 0 1 0-.708l3.5-3.5a.5.5 0 0 1 .708 0m6.292 0a.5.5 0 0 0 0 .708L14.293 8l-3.147 3.146a.5.5 0 0 0 .708.708l3.5-3.5a.5.5 0 0 0 0-.708l-3.5-3.5a.5.5 0 0 0-.708 0" />
          </svg>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav>
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

            {!session ? (
              <Nav className="me-auto">
                <NavDropdown title="Login" id="nav-dropdown">
                  <Form onSubmit={handleSignIn} className="m-2">
                    <Form.Control
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="Email"
                      autoComplete="email"
                      size="sm"
                      className="mt-2"
                    />
                    <Form.Control
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Password"
                      size="sm"
                      className="mt-2"
                    />
                    <Button
                      type='submit'
                      className="mt-2"
                      variant="outline-secondary"
                      size="sm"
                      onClick={toggleLogin}
                      disabled={isSigningIn || !supabase}
                    >
                      Login
                    </Button>
                  </Form>
                </NavDropdown>
              </Nav>

            ) :

              <Button
                type='submit'
                className="mt-2"
                variant="outline-secondary"
                size="sm"
                onClick={handleSignOut}
              >
                Logout
              </Button>
            }
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
