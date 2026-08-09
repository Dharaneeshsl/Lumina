import { useState } from "react";
import SideRays from "./SideRays";
import SignupPage from "./SignupPage";
import LoginPage from "./LoginPage";
import "./App.css";

export default function App() {
  const [currentView, setCurrentView] = useState<"landing" | "signup" | "login">("landing");

  if (currentView === "signup") {
    return (
      <SignupPage
        onBackToHome={() => setCurrentView("landing")}
        onGoToLogin={() => setCurrentView("login")}
      />
    );
  }

  if (currentView === "login") {
    return (
      <LoginPage
        onBackToHome={() => setCurrentView("landing")}
        onGoToSignup={() => setCurrentView("signup")}
      />
    );
  }

  return (
    <div className="page-wrapper">
      {/* Background SideRays WebGL rays in sleek gray theme */}
      <SideRays
        rayColor1="#DFD3C3"
        rayColor2="#F8EDE3"
        speed={1.8}
        intensity={0.8}
        spread={3.5}
        origin="top-right"
        saturation={0.0}
        opacity={0.2}
        className="side-rays-bg"
      />

      {/* Navigation Header */}
      <header className="site-header">
        <div className="brand-header-left">
          <div className="brand-logo-wrapper">
            <div className="brand-logo">
              Lum
              <span className="logo-letter-i-wrapper">
                ı
                <svg
                  className="graduation-cap-dot-icon"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M12 3L1 9L12 15L21 10.09V17H23V9M5 13.18V17.18C5 17.18 8 21 12 21C16 21 19 17.18 19 17.18V13.18L12 17L5 13.18Z" />
                </svg>
              </span>
              no
            </div>
            {/* Underline with Arrow-Like Tip */}
            <svg
              className="brand-logo-underline"
              viewBox="0 0 135 14"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M 2 7 Q 60 12 116 7"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              {/* Sharp Arrowhead Tip */}
              <path
                d="M 110 2.5 L 124 7 L 110 11.5 L 113.5 7 Z"
                fill="currentColor"
              />
            </svg>
          </div>
        </div>

        <nav className="site-nav">
          <ul className="nav-menu">
            <li>
              <a href="#home" className="nav-link">
                Home
              </a>
            </li>
            <li>
              <a href="#features" className="nav-link">
                Features
              </a>
            </li>
            <li>
              <a href="#colleges" className="nav-link">
                Colleges
              </a>
            </li>
            <li>
              <a href="#clubs" className="nav-link">
                Clubs
              </a>
            </li>
            <li>
              <a href="#pricing" className="nav-link">
                Pricing
              </a>
            </li>
            <li>
              <a href="#contact" className="nav-link">
                Contact
              </a>
            </li>
          </ul>
        </nav>

        {/* Black & White Social Icons */}
        <div className="social-icons-group">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="social-icon-link"
            aria-label="GitHub"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
              />
            </svg>
          </a>

          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="social-icon-link"
            aria-label="LinkedIn"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.67a1.62 1.62 0 1 0 0 3.24 1.62 1.62 0 0 0 0-3.24z" />
            </svg>
          </a>

          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            className="social-icon-link"
            aria-label="Twitter"
          >
            <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>

          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="social-icon-link"
            aria-label="Instagram"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
          </a>

          <button className="header-signin-btn" onClick={() => setCurrentView("login")}>
            Sign In
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="hero-section">
        {/* Floating Icon 2: Top Left Grad Cap + Motion Line */}
        <div className="floating-badge-group floating-badge-top-left">
          <svg
            className="badge-motion-lines-left"
            viewBox="0 0 80 40"
            fill="none"
          >
            <path
              d="M 75 12 Q 35 32 8 18"
              stroke="#18181b"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          </svg>
          <div className="floating-badge blue-grad-badge">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3L1 9L12 15L21 10.09V17H23V9M5 13.18V17.18C5 17.18 8 21 12 21C16 21 19 17.18 19 17.18V13.18L12 17L5 13.18Z" />
            </svg>
          </div>
        </div>

        <h1 className="hero-title">
          One Platform.
          <br />
          Every <span className="hero-title-highlight-college">College.</span>
        </h1>

        <p className="hero-subtitle">
          Join your college community using your verified college email.
          <br />
          Discover friends, clubs, internships, events, study groups and more.
        </p>

        <div className="hero-cta-group">
          <button className="btn-primary-join" onClick={() => setCurrentView("signup")}>
            Join Now
          </button>

          <button className="btn-secondary-learn" onClick={() => setCurrentView("signup")}>
            Learn More <span className="arrow-icon">↗</span>
          </button>
        </div>
      </main>
    </div>
  );
}
