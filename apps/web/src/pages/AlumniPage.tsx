import { useEffect, useState } from 'react'

const API = import.meta.env.VITE_API_URL ?? '/api/v1'

type Alumni = {
  id: string
  userId: string
  graduationYear: number
  company?: string | null
  jobTitle?: string | null
  skills: string[]
  isAvailableForMentorship: boolean
  user: {
    id: string
    name: string
    verification?: { alumniVerified: boolean }
  }
}

type Item = {
  id: string
  title?: string
  topic?: string
  description?: string | null
  status?: string
  company?: string | null
  durationMinutes?: number
}

const card = {
  background: '#111827',
  border: '1px solid #263244',
  borderRadius: 12,
  padding: 18,
  marginBottom: 12,
}

export default function AlumniPage() {
  const [tab, setTab] = useState('directory')
  const [alumni, setAlumni] = useState<Alumni[]>([])
  const [connections, setConnections] = useState<Item[]>([])
  const [sessions, setSessions] = useState<Item[]>([])
  const [opportunities, setOpportunities] = useState<Item[]>([])
  const [query, setQuery] = useState('')
  const [error, setError] = useState('')

  const request = async (path: string, init?: RequestInit) => {
    const response = await fetch(API + path, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...init?.headers,
      },
      ...init,
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      throw new Error(data.message ?? 'Request failed')
    }
    return data
  }

  const toList = <T,>(data: Record<string, unknown>, key: string): T[] => {
    return (data[key] ?? data.items ?? data.data ?? []) as T[]
  }

  const load = async () => {
    try {
      const [directory, connectionData, sessionData, referralData, eventData] =
        await Promise.all([
          request('/alumni/directory?q=' + encodeURIComponent(query)),
          request('/alumni/connections'),
          request('/alumni/mentorship/sessions'),
          request('/alumni/referrals'),
          request('/alumni/events'),
        ])

      setAlumni(toList<Alumni>(directory, 'alumni'))
      setConnections(toList<Item>(connectionData, 'connections'))
      setSessions(toList<Item>(sessionData, 'sessions'))
      setOpportunities([
        ...toList<Item>(referralData, 'referrals'),
        ...toList<Item>(eventData, 'events'),
      ])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load alumni data')
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const connect = async (alumniId: string) => {
    try {
      await request('/alumni/connections', {
        method: 'POST',
        body: JSON.stringify({ alumniId }),
      })
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection request failed')
    }
  }

  const mentor = async (alumniId: string) => {
    const topic = window.prompt('What would you like guidance on?')
    if (!topic) return

    try {
      await request('/alumni/mentorship/sessions', {
        method: 'POST',
        body: JSON.stringify({ alumniId, topic }),
      })
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Mentorship request failed')
    }
  }

  const tabs = ['directory', 'connections', 'mentorship', 'opportunities']

  return (
    <main
      style={{
        minHeight: '100vh',
        padding: 24,
        background: '#0b1020',
        color: '#e5e7eb',
      }}
    >
      <section style={{ maxWidth: 1180, margin: '0 auto' }}>
        <p>SECTION 20 · VERIFIED COMMUNITY</p>
        <h1>Lumina Alumni Network</h1>

        <nav style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {tabs.map((name) => (
            <button key={name} onClick={() => setTab(name)}>
              {name}
            </button>
          ))}
        </nav>

        {error && <p>{error}</p>}

        {tab === 'directory' && (
          <>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search alumni"
            />
            <button onClick={() => void load()}>Search</button>

            {alumni.map((item) => (
              <article key={item.id} style={card}>
                <h2>{item.user.name}</h2>
                <p>
                  {item.jobTitle ?? 'Alumnus'} · {item.company ?? 'Company private'}
                </p>
                <p>Class of {item.graduationYear}</p>
                {item.user.verification?.alumniVerified && <p>✓ Verified alumni</p>}
                <button onClick={() => void connect(item.userId)}>Connect</button>
                {item.isAvailableForMentorship && (
                  <button onClick={() => void mentor(item.userId)}>
                    Request mentorship
                  </button>
                )}
              </article>
            ))}
          </>
        )}

        {tab === 'connections' &&
          connections.map((item) => (
            <article key={item.id} style={card}>
              <p>{item.status}</p>
              <p>{item.description}</p>
            </article>
          ))}

        {tab === 'mentorship' &&
          sessions.map((item) => (
            <article key={item.id} style={card}>
              <h2>{item.topic}</h2>
              <p>{item.status}</p>
              <p>{item.durationMinutes} minutes</p>
            </article>
          ))}

        {tab === 'opportunities' &&
          opportunities.map((item) => (
            <article key={item.id} style={card}>
              <h2>{item.title}</h2>
              <p>{item.company}</p>
              <p>{item.description}</p>
            </article>
          ))}
      </section>
    </main>
  )
}
