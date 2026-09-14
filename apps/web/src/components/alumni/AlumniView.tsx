import React, { useEffect, useState } from 'react'

export interface AlumniProfileData {
  id: string
  userId: string
  graduationYear: number
  departmentName: string | null
  company: string | null
  jobTitle: string | null
  industry: string | null
  location: string | null
  bio: string | null
  isAvailableForMentorship: boolean
  directoryVisible: boolean
  linkedIn: string | null
  github: string | null
  skills: string[]
  user: {
    id: string
    name: string
    email: string
    image: string | null
    verification?: {
      alumniVerified: boolean
    }
  }
}

export interface AlumniConnectionData {
  id: string
  studentId: string
  alumniId: string
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN'
  message: string | null
  createdAt: string
  student: { id: string; name: string; email: string; image: string | null }
  alumni: { id: string; name: string; email: string; image: string | null }
}

export interface MentorshipSessionData {
  id: string
  studentId: string
  alumniId: string
  topic: string
  notes: string | null
  status: 'REQUESTED' | 'SCHEDULED' | 'COMPLETED' | 'CANCELLED'
  scheduledAt: string | null
  durationMinutes: number
  meetingUrl: string | null
  createdAt: string
  student: { id: string; name: string; email: string; image: string | null }
  alumni: { id: string; name: string; email: string; image: string | null }
}

export interface AlumniReferralData {
  id: string
  alumniId: string
  title: string
  company: string
  location: string | null
  description: string | null
  link: string | null
  status: string
  createdAt: string
  alumni: { id: string; name: string; email: string; image: string | null }
}

export interface AlumniEventData {
  id: string
  organizerId: string
  title: string
  description: string | null
  eventDate: string
  location: string | null
  virtualLink: string | null
  createdAt: string
  organizer: { id: string; name: string; email: string; image: string | null }
}

export const AlumniView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'directory' | 'mentorship' | 'connections' | 'referrals' | 'verification'
  >('directory')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIndustry, setSelectedIndustry] = useState('ALL')
  const [mentorshipOnlyFilter, setMentorshipOnlyFilter] = useState(false)
  const [selectedAlumnus, setSelectedAlumnus] = useState<AlumniProfileData | null>(null)

  // Modals & form state
  const [showConnectModal, setShowConnectModal] = useState(false)
  const [showMentorshipModal, setShowMentorshipModal] = useState(false)
  const [showReferralModal, setShowReferralModal] = useState(false)
  const [connectionMessage, setConnectionMessage] = useState('')
  const [mentorshipTopic, setMentorshipTopic] = useState('')
  const [mentorshipNotes, setMentorshipNotes] = useState('')
  const [referralTitle, setReferralTitle] = useState('')
  const [referralCompany, setReferralCompany] = useState('')
  const [referralLocation, setReferralLocation] = useState('')
  const [referralDescription, setReferralDescription] = useState('')
  const [referralLink, setReferralLink] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Verification request form state
  const [verificationYear, setVerificationYear] = useState('2023')
  const [verificationDept, setVerificationDept] = useState('Computer Science')
  const [verificationProofUrl, setVerificationProofUrl] = useState('')
  const [verificationSuccess, setVerificationSuccess] = useState(false)

  // Local state for connections & requests
  const [connections, setConnections] = useState<AlumniConnectionData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [mentorshipSessions, setMentorshipSessions] = useState<MentorshipSessionData[]>([])

  const [referrals, setReferrals] = useState<AlumniReferralData[]>([])
  const [events, setEvents] = useState<AlumniEventData[]>([])
  const [alumni, setAlumni] = useState<AlumniProfileData[]>([])

  const api = (import.meta as any).env?.VITE_API_BASE_URL || '/api/v1'
  const unwrap = (value: any) => value?.data ?? value
  const list = (value: any, key: string) => Array.isArray(value) ? value : unwrap(value)?.[key] || unwrap(value)?.items || []
  const request = async (path: string, options: RequestInit = {}) => {
    const response = await fetch(api + path, { credentials: 'include', headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }, ...options })
    const payload = response.status === 204 ? null : await response.json().catch(() => null)
    if (!response.ok) throw new Error(payload?.message || payload?.error || 'Request failed')
    return unwrap(payload)
  }
  const loadNetwork = async () => { setLoading(true); setError(null); try {
    const [directory, connectionData, sessionData, referralData, eventData] = await Promise.all([
      request('/alumni/directory'), request('/alumni/connections').catch(() => []), request('/alumni/mentorship/sessions').catch(() => []), request('/alumni/referrals'), request('/alumni/events')
    ])
    setAlumni(list(directory, 'alumni')); setConnections(list(connectionData, 'connections')); setMentorshipSessions(list(sessionData, 'sessions')); setReferrals(list(referralData, 'referrals')); setEvents(list(eventData, 'events'))
  } catch (e: any) { setError(e.message) } finally { setLoading(false) } }
  useEffect(() => { void loadNetwork() }, [])

  // Filtering
  const filteredAlumni = alumni.filter((alum) => {
    const matchesSearch =
      alum.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (alum.company && alum.company.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (alum.jobTitle && alum.jobTitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (alum.departmentName && alum.departmentName.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesIndustry = selectedIndustry === 'ALL' || alum.industry === selectedIndustry
    const matchesMentorship = !mentorshipOnlyFilter || alum.isAvailableForMentorship

    return matchesSearch && matchesIndustry && matchesMentorship
  })

  const handleSendConnection = async (e: React.FormEvent) => {
    e.preventDefault(); if (!selectedAlumnus) return
    try { await request('/alumni/connections', { method: 'POST', body: JSON.stringify({ alumniId: selectedAlumnus.userId, message: connectionMessage || undefined }) }); await loadNetwork(); setShowConnectModal(false); setConnectionMessage('') } catch (e: any) { setError(e.message) }
  }

  const handleRequestMentorship = async (e: React.FormEvent) => {
    e.preventDefault(); if (!selectedAlumnus) return
    try { await request('/alumni/mentorship/sessions', { method: 'POST', body: JSON.stringify({ alumniId: selectedAlumnus.userId, topic: mentorshipTopic, notes: mentorshipNotes || undefined, durationMinutes: 30 }) }); await loadNetwork(); setShowMentorshipModal(false); setMentorshipTopic(''); setMentorshipNotes('') } catch (e: any) { setError(e.message) }
  }

  const handleCreateReferral = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true)
    try {
      await request('/alumni/referrals', { method: 'POST', body: JSON.stringify({ title: referralTitle, company: referralCompany, location: referralLocation || undefined, description: referralDescription || undefined, link: referralLink || undefined }) })
      setShowReferralModal(false); setReferralTitle(''); setReferralCompany(''); setReferralLocation(''); setReferralDescription(''); setReferralLink(''); await loadNetwork()
    } catch (e: any) { setError(e.message) } finally { setSubmitting(false) }
  }

  const handleVerificationSubmit = async (e: React.FormEvent) => { e.preventDefault(); try { await request('/alumni/profile', { method: 'POST', body: JSON.stringify({ graduationYear: Number(verificationYear), departmentName: verificationDept, bio: verificationProofUrl ? 'Verification proof: ' + verificationProofUrl : undefined }) }); setVerificationSuccess(true); await loadNetwork() } catch (e: any) { setError(e.message) } }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0a0d14',
        color: '#f3f4f6',
        fontFamily: 'Inter, system-ui, sans-serif',
        padding: '24px',
      }}
    >
      {error && <div style={{ background: '#451a1a', color: '#fecaca', padding: '12px', borderRadius: '8px', marginBottom: '12px' }}>{error}</div>}
      {loading && <div style={{ color: '#a5b4fc', marginBottom: '12px' }}>Loading alumni network…</div>}
      {/* Header Banner */}
      <div
        style={{
          background:
            'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.15) 50%, rgba(236, 72, 153, 0.15) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          padding: '32px',
          marginBottom: '24px',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 12px',
                borderRadius: '20px',
                background: 'rgba(99, 102, 241, 0.2)',
                border: '1px solid rgba(99, 102, 241, 0.4)',
                fontSize: '12px',
                fontWeight: 600,
                color: '#818cf8',
                marginBottom: '12px',
              }}
            >
              ✦ Lumina Global Alumni Network
            </div>
            <h1
              style={{
                fontSize: '32px',
                fontWeight: 800,
                margin: 0,
                background: 'linear-gradient(to right, #ffffff, #c7d2fe, #a855f7)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Alumni Directory & Mentorship Network
            </h1>
            <p
              style={{ margin: '8px 0 0 0', color: '#9ca3af', fontSize: '15px', maxWidth: '650px' }}
            >
              Connect with verified institution alumni, request 1:1 mentorship sessions, explore
              referral opportunities, and attend exclusive alumni networking summits.
            </p>
          </div>
          <button
            onClick={() => setActiveTab('verification')}
            style={{
              background: 'linear-gradient(135deg, #6366f1, #a855f7)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              padding: '12px 24px',
              fontWeight: 600,
              fontSize: '14px',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
              transition: 'all 0.2s ease',
            }}
          >
            🎓 Verify Alumni Status
          </button>
        </div>

        {/* Tab Bar */}
        <div
          style={{
            display: 'flex',
            gap: '12px',
            marginTop: '28px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            paddingBottom: '12px',
            overflowX: 'auto',
          }}
        >
          {[
            { id: 'directory', label: '🔍 Alumni Directory' },
            { id: 'mentorship', label: '🤝 Mentorship Hub' },
            { id: 'connections', label: '🌐 Network Connections' },
            { id: 'referrals', label: '💼 Referrals & Events' },
            { id: 'verification', label: '🎓 Alumni Verification' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                background: activeTab === tab.id ? 'rgba(99, 102, 241, 0.25)' : 'transparent',
                color: activeTab === tab.id ? '#ffffff' : '#9ca3af',
                border:
                  activeTab === tab.id
                    ? '1px solid rgba(99, 102, 241, 0.5)'
                    : '1px solid transparent',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Directory Tab */}
      {activeTab === 'directory' && (
        <div>
          {/* Filters Bar */}
          <div
            style={{
              display: 'flex',
              gap: '16px',
              flexWrap: 'wrap',
              marginBottom: '24px',
              background: 'rgba(17, 24, 39, 0.7)',
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              alignItems: 'center',
            }}
          >
            <input
              type="text"
              placeholder="Search by name, company, role, department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: 1,
                minWidth: '240px',
                background: 'rgba(31, 41, 55, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '8px',
                padding: '10px 14px',
                color: '#ffffff',
                fontSize: '14px',
                outline: 'none',
              }}
            />
            <select
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              style={{
                background: 'rgba(31, 41, 55, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '8px',
                padding: '10px 14px',
                color: '#ffffff',
                fontSize: '14px',
                outline: 'none',
              }}
            >
              <option value="ALL">All Industries</option>
              <option value="Artificial Intelligence">Artificial Intelligence</option>
              <option value="Fintech & Cloud Systems">Fintech & Cloud Systems</option>
              <option value="Enterprise Software">Enterprise Software</option>
            </select>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#cbd5e1',
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={mentorshipOnlyFilter}
                onChange={(e) => setMentorshipOnlyFilter(e.target.checked)}
                style={{ accentColor: '#6366f1' }}
              />
              Available for Mentorship
            </label>
          </div>

          {/* Alumni Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '20px',
            }}
          >
            {filteredAlumni.map((alum) => (
              <div
                key={alum.id}
                style={{
                  background: 'rgba(17, 24, 39, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '14px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'transform 0.2s ease, border-color 0.2s ease',
                }}
              >
                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      marginBottom: '14px',
                    }}
                  >
                    <img
                      src={alum.user.image || 'https://via.placeholder.com/60'}
                      alt={alum.user.name}
                      style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '2px solid #6366f1',
                      }}
                    />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <h3
                          style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: '#ffffff' }}
                        >
                          {alum.user.name}
                        </h3>
                        {alum.user.verification?.alumniVerified && (
                          <span
                            title="Verified Alumnus"
                            style={{ color: '#38bdf8', fontSize: '14px' }}
                          >
                            ✓
                          </span>
                        )}
                      </div>
                      <p
                        style={{
                          margin: '2px 0 0 0',
                          color: '#818cf8',
                          fontSize: '13px',
                          fontWeight: 600,
                        }}
                      >
                        {alum.jobTitle} @ {alum.company}
                      </p>
                      <p style={{ margin: '2px 0 0 0', color: '#6b7280', fontSize: '12px' }}>
                        Class of {alum.graduationYear} • {alum.departmentName}
                      </p>
                    </div>
                  </div>

                  <p
                    style={{
                      fontSize: '13px',
                      color: '#d1d5db',
                      lineHeight: '1.5',
                      margin: '0 0 16px 0',
                    }}
                  >
                    {alum.bio}
                  </p>

                  <div
                    style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}
                  >
                    {alum.skills.map((skill) => (
                      <span
                        key={skill}
                        style={{
                          background: 'rgba(99, 102, 241, 0.12)',
                          border: '1px solid rgba(99, 102, 241, 0.25)',
                          color: '#a5b4fc',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 500,
                        }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    gap: '10px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                    paddingTop: '14px',
                  }}
                >
                  <button
                    onClick={() => {
                      setSelectedAlumnus(alum)
                      setShowConnectModal(true)
                    }}
                    style={{
                      flex: 1,
                      background: 'rgba(255, 255, 255, 0.06)',
                      color: '#ffffff',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '8px',
                      padding: '8px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    💬 Connect
                  </button>
                  {alum.isAvailableForMentorship && (
                    <button
                      onClick={() => {
                        setSelectedAlumnus(alum)
                        setShowMentorshipModal(true)
                      }}
                      style={{
                        flex: 1,
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '8px',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      🤝 Request 1:1
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mentorship Tab */}
      {activeTab === 'mentorship' && (
        <div
          style={{
            background: 'rgba(17, 24, 39, 0.6)',
            padding: '24px',
            borderRadius: '14px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <h2 style={{ fontSize: '20px', fontWeight: 700, marginTop: 0, color: '#ffffff' }}>
            Your Mentorship Sessions
          </h2>
          <p style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '20px' }}>
            Track and manage your scheduled 1:1 mentorship sessions with verified institution
            alumni.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {mentorshipSessions.map((sess) => (
              <div
                key={sess.id}
                style={{
                  background: 'rgba(31, 41, 55, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '10px',
                  padding: '16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      marginBottom: '6px',
                    }}
                  >
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 700,
                        background:
                          sess.status === 'SCHEDULED'
                            ? 'rgba(34, 197, 94, 0.2)'
                            : sess.status === 'REQUESTED'
                              ? 'rgba(234, 179, 8, 0.2)'
                              : 'rgba(156, 163, 175, 0.2)',
                        color:
                          sess.status === 'SCHEDULED'
                            ? '#4ade80'
                            : sess.status === 'REQUESTED'
                              ? '#fde047'
                              : '#9ca3af',
                      }}
                    >
                      {sess.status}
                    </span>
                    <h4 style={{ margin: 0, fontSize: '15px', color: '#ffffff' }}>{sess.topic}</h4>
                  </div>
                  <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#cbd5e1' }}>
                    Mentor: <strong>{sess.alumni.name}</strong> ({sess.alumni.email})
                  </p>
                  {sess.scheduledAt && (
                    <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>
                      📅 Scheduled for: {new Date(sess.scheduledAt).toLocaleString()} (
                      {sess.durationMinutes} mins)
                    </p>
                  )}
                </div>

                {sess.meetingUrl && (
                  <a
                    href={sess.meetingUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      background: '#22c55e',
                      color: '#ffffff',
                      textDecoration: 'none',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 600,
                    }}
                  >
                    🎥 Join Video Call
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Network Connections Tab */}
      {activeTab === 'connections' && (
        <div
          style={{
            background: 'rgba(17, 24, 39, 0.6)',
            padding: '24px',
            borderRadius: '14px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <h2 style={{ fontSize: '20px', fontWeight: 700, marginTop: 0, color: '#ffffff' }}>
            Your Network Connections
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
            {connections.map((conn) => (
              <div
                key={conn.id}
                style={{
                  background: 'rgba(31, 41, 55, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '10px',
                  padding: '14px 18px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', color: '#ffffff' }}>
                    {conn.alumni.name}
                  </h4>
                  <p style={{ margin: 0, fontSize: '13px', color: '#9ca3af' }}>
                    {conn.message || 'No message provided.'}
                  </p>
                </div>
                <span
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 600,
                    background:
                      conn.status === 'ACCEPTED'
                        ? 'rgba(34, 197, 94, 0.2)'
                        : 'rgba(234, 179, 8, 0.2)',
                    color: conn.status === 'ACCEPTED' ? '#4ade80' : '#fde047',
                  }}
                >
                  {conn.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Referrals & Events Tab */}
      {activeTab === 'referrals' && (
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px',
            }}
          >
            <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0, color: '#ffffff' }}>
              Alumni Referrals & Opportunities
            </h2>
            <button
              onClick={() => setShowReferralModal(true)}
              style={{
                background: 'rgba(99, 102, 241, 0.2)',
                color: '#818cf8',
                border: '1px solid rgba(99, 102, 241, 0.4)',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              + Post Referral
            </button>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
              gap: '16px',
              marginBottom: '32px',
            }}
          >
            {referrals.map((ref) => (
              <div
                key={ref.id}
                style={{
                  background: 'rgba(17, 24, 39, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  padding: '18px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '8px',
                  }}
                >
                  <h3 style={{ margin: 0, fontSize: '16px', color: '#ffffff' }}>{ref.title}</h3>
                  <span
                    style={{
                      background: 'rgba(34, 197, 94, 0.2)',
                      color: '#4ade80',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 600,
                    }}
                  >
                    {ref.status}
                  </span>
                </div>
                <p
                  style={{
                    margin: '0 0 6px 0',
                    fontSize: '13px',
                    color: '#818cf8',
                    fontWeight: 600,
                  }}
                >
                  {ref.company} • {ref.location}
                </p>
                <p
                  style={{
                    margin: '0 0 12px 0',
                    fontSize: '13px',
                    color: '#9ca3af',
                    lineHeight: '1.4',
                  }}
                >
                  {ref.description}
                </p>
                <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>
                  Posted by: {ref.alumni.name}
                </p>
              </div>
            ))}
          </div>

          <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '16px', color: '#ffffff' }}>
            Upcoming Alumni Events
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {events.map((evt) => (
              <div
                key={evt.id}
                style={{
                  background: 'rgba(17, 24, 39, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  padding: '18px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <div>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', color: '#ffffff' }}>
                    {evt.title}
                  </h3>
                  <p style={{ margin: '0 0 6px 0', fontSize: '13px', color: '#9ca3af' }}>
                    {evt.description}
                  </p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#818cf8' }}>
                    📅 {new Date(evt.eventDate).toLocaleString()} | 📍 {evt.location}
                  </p>
                </div>
                {evt.virtualLink && (
                  <a
                    href={evt.virtualLink}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      background: 'rgba(168, 85, 247, 0.2)',
                      color: '#c084fc',
                      border: '1px solid rgba(168, 85, 247, 0.4)',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      fontSize: '13px',
                      fontWeight: 600,
                    }}
                  >
                    🎟️ Event Link
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Verification Tab */}
      {activeTab === 'verification' && (
        <div
          style={{
            maxWidth: '600px',
            margin: '0 auto',
            background: 'rgba(17, 24, 39, 0.7)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            padding: '32px',
          }}
        >
          <h2 style={{ fontSize: '22px', fontWeight: 700, marginTop: 0, color: '#ffffff' }}>
            Apply for Alumni Verification
          </h2>
          <p style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '24px' }}>
            Submit your graduation records to get verified by institution administrators and unlock
            full alumni networking capabilities.
          </p>

          {verificationSuccess ? (
            <div
              style={{
                background: 'rgba(34, 197, 94, 0.15)',
                border: '1px solid rgba(34, 197, 94, 0.4)',
                color: '#4ade80',
                padding: '16px',
                borderRadius: '10px',
                textAlign: 'center',
              }}
            >
              <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>
                ✓ Application Submitted Successfully!
              </h3>
              <p style={{ margin: 0, fontSize: '14px' }}>
                Your verification request has been forwarded to the administration. You will receive
                a notification once approved.
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleVerificationSubmit}
              style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
            >
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#d1d5db',
                    marginBottom: '6px',
                  }}
                >
                  Graduation Year
                </label>
                <input
                  type="number"
                  value={verificationYear}
                  onChange={(e) => setVerificationYear(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(31, 41, 55, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '8px',
                    padding: '10px',
                    color: '#ffffff',
                  }}
                  required
                />
              </div>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#d1d5db',
                    marginBottom: '6px',
                  }}
                >
                  Department / Degree
                </label>
                <input
                  type="text"
                  value={verificationDept}
                  onChange={(e) => setVerificationDept(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(31, 41, 55, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '8px',
                    padding: '10px',
                    color: '#ffffff',
                  }}
                  required
                />
              </div>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#d1d5db',
                    marginBottom: '6px',
                  }}
                >
                  Diploma or ID Proof Document URL
                </label>
                <input
                  type="url"
                  placeholder="https://storage.lumina.edu/proof.pdf"
                  value={verificationProofUrl}
                  onChange={(e) => setVerificationProofUrl(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(31, 41, 55, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '8px',
                    padding: '10px',
                    color: '#ffffff',
                  }}
                  required
                />
              </div>
              <button
                type="submit"
                style={{
                  background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '12px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  marginTop: '8px',
                }}
              >
                Submit Verification Request
              </button>
            </form>
          )}
        </div>
      )}

      {/* Connect Modal */}
      {showConnectModal && selectedAlumnus && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px',
          }}
        >
          <div
            style={{
              background: '#111827',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '16px',
              padding: '24px',
              width: '100%',
              maxWidth: '480px',
            }}
          >
            <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', color: '#ffffff' }}>
              Connect with {selectedAlumnus.user.name}
            </h3>
            <form onSubmit={handleSendConnection}>
              <textarea
                placeholder="Include a short message introducing yourself..."
                value={connectionMessage}
                onChange={(e) => setConnectionMessage(e.target.value)}
                rows={4}
                style={{
                  width: '100%',
                  background: 'rgba(31,41,55,0.8)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '8px',
                  padding: '10px',
                  color: '#ffffff',
                  outline: 'none',
                  resize: 'none',
                  marginBottom: '16px',
                }}
              />
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowConnectModal(false)}
                  style={{
                    background: 'transparent',
                    color: '#9ca3af',
                    border: '1px solid rgba(255,255,255,0.2)',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    background: '#6366f1',
                    color: '#ffffff',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Send Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mentorship Modal */}
      {showMentorshipModal && selectedAlumnus && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px',
          }}
        >
          <div
            style={{
              background: '#111827',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '16px',
              padding: '24px',
              width: '100%',
              maxWidth: '480px',
            }}
          >
            <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', color: '#ffffff' }}>
              Request Mentorship Session
            </h3>
            <p style={{ fontSize: '13px', color: '#9ca3af', marginTop: 0 }}>
              Requesting session with {selectedAlumnus.user.name} ({selectedAlumnus.jobTitle} @{' '}
              {selectedAlumnus.company})
            </p>
            <form onSubmit={handleRequestMentorship}>
              <div style={{ marginBottom: '12px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    color: '#d1d5db',
                    marginBottom: '4px',
                  }}
                >
                  Topic of Discussion
                </label>
                <input
                  type="text"
                  placeholder="e.g. AI Systems Career Guidance & Resume Feedback"
                  value={mentorshipTopic}
                  onChange={(e) => setMentorshipTopic(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(31,41,55,0.8)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '8px',
                    padding: '10px',
                    color: '#ffffff',
                    outline: 'none',
                  }}
                  required
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    color: '#d1d5db',
                    marginBottom: '4px',
                  }}
                >
                  Additional Context & Questions
                </label>
                <textarea
                  placeholder="Share details on what you hope to cover during the 30-min call..."
                  value={mentorshipNotes}
                  onChange={(e) => setMentorshipNotes(e.target.value)}
                  rows={3}
                  style={{
                    width: '100%',
                    background: 'rgba(31,41,55,0.8)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '8px',
                    padding: '10px',
                    color: '#ffffff',
                    outline: 'none',
                    resize: 'none',
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowMentorshipModal(false)}
                  style={{
                    background: 'transparent',
                    color: '#9ca3af',
                    border: '1px solid rgba(255,255,255,0.2)',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    color: '#ffffff',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Submit Session Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Referral Modal */}
      {showReferralModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px',
          }}
        >
          <div
            style={{
              background: '#111827',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '16px',
              padding: '24px',
              width: '100%',
              maxWidth: '480px',
            }}
          >
            <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', color: '#ffffff' }}>
              Post Referral Opportunity
            </h3>
            <form
              onSubmit={handleCreateReferral}
            >
              <p style={{ fontSize: '13px', color: '#9ca3af' }}>
                Share a real referral slot or opportunity with current students.
              </p>
              <input required placeholder="Opportunity title" value={referralTitle} onChange={(e) => setReferralTitle(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', marginBottom: '10px', padding: '10px', borderRadius: '8px' }} />
              <input required placeholder="Company" value={referralCompany} onChange={(e) => setReferralCompany(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', marginBottom: '10px', padding: '10px', borderRadius: '8px' }} />
              <input placeholder="Location" value={referralLocation} onChange={(e) => setReferralLocation(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', marginBottom: '10px', padding: '10px', borderRadius: '8px' }} />
              <textarea placeholder="Description" value={referralDescription} onChange={(e) => setReferralDescription(e.target.value)} rows={3} style={{ width: '100%', boxSizing: 'border-box', marginBottom: '10px', padding: '10px', borderRadius: '8px' }} />
              <input type="url" placeholder="Opportunity URL (optional)" value={referralLink} onChange={(e) => setReferralLink(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', marginBottom: '10px', padding: '10px', borderRadius: '8px' }} />
              <div
                style={{
                  display: 'flex',
                  gap: '10px',
                  justifyContent: 'flex-end',
                  marginTop: '20px',
                }}
              >
                <button type="submit" disabled={submitting} style={{ background: '#6366f1', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>
                  {submitting ? 'Posting…' : 'Post Referral'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowReferralModal(false)}
                  style={{
                    background: 'transparent',
                    color: '#9ca3af',
                    border: '1px solid rgba(255,255,255,0.2)',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                  }}
                >
                  Close
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}