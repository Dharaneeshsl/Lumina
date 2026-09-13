import { useState } from 'react'

import './App.css'
import ClubsView from './components/clubs/ClubsView'
import AlumniPage from './pages/AlumniPage'
import { NotificationsView } from './components/notifications/NotificationsView'
import LoginPage from './LoginPage'
import InternshipsPage from './pages/InternshipsPage'
import SignupPage from './SignupPage'

export default function App() {
  const [currentView, setCurrentView] = useState<
    'landing' | 'signup' | 'login' | 'clubs' | 'internships' | 'alumni' | 'notifications'
  >('landing')

  if (currentView === 'clubs') {
    return <ClubsView onBackToHome={() => setCurrentView('landing')} />
  }

  if (currentView === 'internships') {
    return <InternshipsPage />
  }

  if (currentView === 'alumni') {
    return (
      <div>
        <div style={{ background: '#111827', padding: '12px 24px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button onClick={() => setCurrentView('landing')} style={{ background: 'transparent', color: '#818cf8', border: '1px solid rgba(129, 140, 248, 0.4)', borderRadius: '6px', padding: '6px 14px', fontSize: '13px', cursor: 'pointer' }}>← Back to Home</button>
        </div>
        <AlumniPage />
      </div>
    )
  }

  if (currentView === 'notifications') {
    return (
      <div>
        <div style={{ background: '#111827', padding: '12px 24px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button onClick={() => setCurrentView('landing')} style={{ background: 'transparent', color: '#818cf8', border: '1px solid rgba(129, 140, 248, 0.4)', borderRadius: '6px', padding: '6px 14px', fontSize: '13px', cursor: 'pointer' }}>← Back to Home</button>
        </div>
        <NotificationsView />
      </div>
    )
  }



  if (currentView === 'signup') {
    return (
      <SignupPage
        onBackToHome={() => setCurrentView('landing')}
        onGoToLogin={() => setCurrentView('login')}
      />
    )
  }

  if (currentView === 'login') {
    return (
      <LoginPage
        onBackToHome={() => setCurrentView('landing')}
        onGoToSignup={() => setCurrentView('signup')}
      />
    )
  }

  return (
    <div className="page-wrapper">
      <header className="site-header">
        <div className="site-header-inner">
          <a
            href="#home"
            className="brand-header-left"
            aria-label="Lumino home"
          >
            <svg
              className="brand-logo-icon"
              viewBox="0 0 20 20"
              fill="none"
              aria-hidden="true"
            >
              <circle
                cx="10"
                cy="10"
                r="10"
                fill="currentColor"
              />
              <g clipPath="url(#lumino-logo-clip)">
                <rect
                  x="-2"
                  y="10.5"
                  width="16"
                  height="1.6"
                  transform="rotate(-38 10 10)"
                  fill="#000000"
                />
                <rect
                  x="-2"
                  y="13.2"
                  width="16"
                  height="1.6"
                  transform="rotate(-38 10 10)"
                  fill="#000000"
                />
                <rect
                  x="-2"
                  y="15.9"
                  width="16"
                  height="1.6"
                  transform="rotate(-38 10 10)"
                  fill="#000000"
                />
              </g>
              <defs>
                <clipPath id="lumino-logo-clip">
                  <circle
                    cx="10"
                    cy="10"
                    r="10"
                  />
                </clipPath>
              </defs>
            </svg>
            <span className="brand-logo">Lumino</span>
          </a>

          <div className="header-right">
            <nav
              className="site-nav"
              aria-label="Main navigation"
            >
              <ul className="nav-menu">
                <li>
                  <a
                    href="#features"
                    className="nav-link"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#colleges"
                    className="nav-link"
                  >
                    Colleges
                  </a>
                </li>
                <li>
                  <a
                    href="#clubs"
                    className="nav-link"
                    onClick={(e) => {
                      e.preventDefault()
                      setCurrentView('clubs')
                    }}
                  >
                    Clubs
                  </a>
                </li>
                <li>
                  <a
                    href="#internships"
                    className="nav-link"
                    onClick={(e) => {
                      e.preventDefault()
                      setCurrentView('internships')
                    }}
                  >
                    Internships
                  </a>
                </li>
                <li>
                  <a
                    href="#alumni"
                    className="nav-link"
                    onClick={(e) => {
                      e.preventDefault()
                      setCurrentView('alumni')
                    }}
                  >
                    Alumni Network
                  </a>
                </li>
                <li>
                  <a
                    href="#notifications"
                    className="nav-link"
                    onClick={(e) => {
                      e.preventDefault()
                      setCurrentView('notifications')
                    }}
                  >
                    Notifications 🔔
                  </a>
                </li>


                <li>
                  <a
                    href="#pricing"
                    className="nav-link"
                  >
                    Pricing
                  </a>
                </li>
                <li>
                  <a
                    href="#contact"
                    className="nav-link"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </nav>

            <div
              className="header-divider"
              aria-hidden="true"
            />

            <div className="header-actions">
              <button
                type="button"
                className="header-login-btn"
                onClick={() => setCurrentView('login')}
              >
                Log in
              </button>
              <button
                type="button"
                className="header-signup-btn"
                onClick={() => setCurrentView('signup')}
              >
                Sign up
              </button>
            </div>
          </div>
        </div>
      </header>

      <main
        className="hero-section"
        id="home"
      >
        <div className="hero-content">
          <h1 className="hero-title">
            Your campus life,
            <br />
            all in one place.
          </h1>

          <p className="hero-subtitle">
            Join your college community using your verified college email. Discover friends, clubs,
            internships, events, study groups and more.
          </p>

          <div className="hero-cta-group">
            <button
              type="button"
              className="btn-primary-join"
              onClick={() => setCurrentView('signup')}
            >
              Get started
            </button>
            <button
              type="button"
              className="btn-secondary-learn"
              onClick={() => setCurrentView('signup')}
            >
              Learn more <span className="arrow-icon">→</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
