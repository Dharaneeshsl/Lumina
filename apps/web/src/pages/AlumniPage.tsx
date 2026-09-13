import { useEffect, useMemo, useState } from 'react'

const API = import.meta.env.VITE_API_URL ?? '/api/v1'

type Alumni = {
  id: string
  userId: string
  graduationYear: number
  departmentName?: string | null
  company?: string | null
  jobTitle?: string | null
  industry?: string | null
  location?: string | null
  bio?: string | null
  skills: string[]
  isAvailableForMentorship: boolean
  user: { id: string; name: string; image?: string | null; verification?: { alumniVerified: boolean } }
}

type Connection = {
  id: string
  status: string
  message?: string | null
  student: { id: string; name: string }
  alumni: { id: string; name: string }
}

type Session = {
  id: string
  topic: string
  notes?: string | null
  status: string
  scheduledAt?: string | null
  durationMinutes: number
  student: { id: string; name: string }
  alumni: { id: string; name: string }
}

const button: React.CSSProperties = { border: 0, borderRadius: 8, padding: '9px 14px', cursor: 'pointer', background: '#6366f1', color: '#fff', fontWeight: 600 }
const card: React.CSSProperties = { background: '#111827', border: '1px solid #263244', borderRadius: 12, padding: 18 }

export default function AlumniPage() {
  const [tab, setTab] = useState<'directory' | 'connections' | 'mentorship' | 'opportunities'>('directory')
  const [alumni, setAlumni] = useState<Alumni[]>([])
  const [connections, setConnections] = useState<Connection[]>([])
  const [sessions, setSessions] = useState<Session[]>([])
  const [referrals, setReferrals] = useState<any[]>([])
  const [events, setEvents] = useState<any[]>([])
  const [q, setQ] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const request = async (path: string, init?: RequestInit) => {
    const r = await fetch(API + path, { credentials: 'include', headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) }, ...init })
    const data = await r.json().catch(() => ({}))
    if (!r.ok) throw new Error(data.message ?? 'Request failed')
    return data
  }

  const loadDirectory = async () => {
    setBusy(true); setError('')
    try {
      const data = await request('/alumni/directory?q=' + encodeURIComponent(q))
      setAlumni(data.alumni ?? data.items ?? data.data ?? (Array.isArray(data) ? data : []))
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to load alumni directory') }
    finally { setBusy(false) }
  }

  const loadPrivate = async () => {
    try {
      const [c, s] = await Promise.all([request('/alumni/connections'), request('/alumni/mentorship/sessions')])
      setConnections(c.connections ?? c.items ?? c.data ?? (Array.isArray(c) ? c : []))
      setSessions(s.sessions ?? s.items ?? s.data ?? (Array.isArray(s) ? s : []))
    } catch { /* unauthenticated visitors can still browse public alumni content */ }
  }

  const loadOpportunities = async () => {
    try {
      const [r, e] = await Promise.all([request('/alumni/referrals'), request('/alumni/events')])
      setReferrals(r.referrals ?? r.items ?? r.data ?? (Array.isArray(r) ? r : []))
      setEvents(e.events ?? e.items ?? e.data ?? (Array.isArray(e) ? e : []))
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to load opportunities') }
  }

  useEffect(() => { void loadDirectory(); void loadPrivate(); void loadOpportunities() }, [])
  const visible = useMemo(() => alumni.filter(a => !q || [a.user.name, a.company, a.jobTitle, a.departmentName, a.industry, ...a.skills].filter(Boolean).join(' ').toLowerCase().includes(q.toLowerCase())), [alumni, q])

  const connect = async (alumniId: string) => {
    const text = window.prompt('Introduce yourself (optional):') ?? ''
    try {
      await request('/alumni/connections', { method: 'POST', body: JSON.stringify({ alumniId, message: text }) })
      await loadPrivate()
      setMessage('Connection request sent.')
    } catch (e) { setError(e instanceof Error ? e.message : 'Connection request failed') }
  }

  const mentor = async (alumniId: string) => {
    const topic = window.prompt('What would you like guidance on?')
    if (!topic) return
    const notes = window.prompt('Additional context (optional):') ?? ''
    try {
      await request('/alumni/mentorship/sessions', { method: 'POST', body: JSON.stringify({ alumniId, topic, notes }) })
      await loadPrivate()
      setMessage('Mentorship request submitted.')
    } catch (e) { setError(e instanceof Error ? e.message : 'Mentorship request failed') }
  }

  const updateConnection = async (id: string, status: string) => {
    try { await request('/alumni/connections/' + id, { method: 'PATCH', body: JSON.stringify({ status }) }); await loadPrivate() }
    catch (e) { setError(e instanceof Error ? e.message : 'Update failed') }
  }

  const tabs = [['directory', 'Alumni Directory'], ['connections', 'Connections'], ['mentorship', 'Mentorship'], ['opportunities', 'Careers & Events']] as const

  return <main style={{ minHeight: '100vh', background: '#0b1020', color: '#e5e7eb', padding: 24, fontFamily: 'Inter, system-ui, sans-serif' }}>
    <section style={{ maxWidth: 1180, margin: '0 auto' }}>
      <header style={{ marginBottom: 24 }}>
        <p style={{ color: '#a5b4fc', fontWeight: 700, marginBottom: 6 }}>SECTION 20 · VERIFIED COMMUNITY</p>
        <h1 style={{ margin: 0, fontSize: 34 }}>Lumina Alumni Network</h1>
        <p style={{ color: '#94a3b8' }}>Discover verified alumni, build professional connections, request mentorship, and explore referrals and events.</p>
      </header>

      <nav style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        {tabs.map(([id, label]) => <button key={id} onClick={() => setTab(id)} style={{ ...button, background: tab === id ? '#6366f1' : '#1f2937' }}>{label}</button>)}
      </nav>

      {error && <div style={{ ...card, borderColor: '#7f1d1d', color: '#fecaca', marginBottom: 16 }}>{error}</div>}
      {message && <div style={{ ...card, borderColor: '#166534', color: '#bbf7d0', marginBottom: 16 }}>{message}</div>}

      {tab === 'directory' && <>
        <form onSubmit={e => { e.preventDefault(); void loadDirectory() }} style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search name, company, role, department, industry or skill" style={{ flex: 1, padding: 11, borderRadius: 8, border: '1px solid #334155', background: '#111827', color: '#fff' }} />
          <button style={button}>Search</button>
        </form>
        {busy ? <p>Loading alumni...</p> : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 16 }}>
          {visible.map(a => <article key={a.id} style={card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}><h2 style={{ fontSize: 18, marginTop: 0 }}>{a.user.name}</h2>{a.user.verification?.alumniVerified && <span>✓ Verified</span>}</div>
            <p style={{ color: '#a5b4fc' }}>{a.jobTitle ?? 'Alumnus'} {a.company ? '· ' + a.company : ''}</p>
            <p>{a.departmentName ?? 'Department not shared'} · Class of {a.graduationYear}</p>
            <p style={{ color: '#94a3b8' }}>{a.location ?? 'Location private'}</p>
            {a.bio && <p>{a.bio}</p>}
            <p>{a.skills.map(s => <span key={s} style={{ display: 'inline-block', padding: '4px 7px', margin: '0 5px 5px 0', background: '#1e293b', borderRadius: 999 }}>{s}</span>)}</p>
            <div style={{ display: 'flex', gap: 8 }}><button style={button} onClick={() => void connect(a.userId)}>Connect</button>{a.isAvailableForMentorship && <button style={{ ...button, background: '#0f766e' }} onClick={() => void mentor(a.userId)}>Request mentorship</button>}</div>
          </article>)}
          {!visible.length && <p>No alumni found.</p>}
        </div>}
      </>}

      {tab === 'connections' && <section style={{ display: 'grid', gap: 12 }}>
        {connections.map(c => <article key={c.id} style={card}><strong>{c.student.name} ↔ {c.alumni.name}</strong><p>{c.message}</p><p>Status: <b>{c.status}</b></p>{c.status === 'PENDING' && <div style={{ display: 'flex', gap: 8 }}><button style={button} onClick={() => void updateConnection(c.id, 'ACCEPTED')}>Accept</button><button style={{ ...button, background: '#991b1b' }} onClick={() => void updateConnection(c.id, 'REJECTED')}>Reject</button></div>}</article>)}
        {!connections.length && <p>No alumni connections yet.</p>}
      </section>}

      {tab === 'mentorship' && <section style={{ display: 'grid', gap: 12 }}>
        {sessions.map(s => <article key={s.id} style={card}><h2 style={{ fontSize: 18, marginTop: 0 }}>{s.topic}</h2><p>{s.student.name} ↔ {s.alumni.name}</p><p>Status: <b>{s.status}</b> · {s.durationMinutes} min</p>{s.scheduledAt && <p>{new Date(s.scheduledAt).toLocaleString()}</p>}<p>{s.notes}</p></article>)}
        {!sessions.length && <p>No mentorship sessions yet. Request one from the Alumni Directory.</p>}
      </section>}

      {tab === 'opportunities' && <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 16 }}>
        <div><h2>Referral opportunities</h2>{referrals.map(r => <article key={r.id} style={{ ...card, marginBottom: 12 }}><h3>{r.title}</h3><p>{r.company} · {r.location}</p><p>{r.description}</p>{r.link && <a href={r.link} target="_blank" rel="noreferrer">Open opportunity</a>}</article>)}{!referrals.length && <p>No active referrals.</p>}</div>
        <div><h2>Alumni events</h2>{events.map(e => <article key={e.id} style={{ ...card, marginBottom: 12 }}><h3>{e.title}</h3><p>{e.description}</p><p>{new Date(e.eventDate).toLocaleString()} · {e.location}</p>{e.virtualLink && <a href={e.virtualLink} target="_blank" rel="noreferrer">Join event</a>}</article>)}{!events.length && <p>No upcoming alumni events.</p>}</div>
      </section>}
    </section>
  </main>
}
