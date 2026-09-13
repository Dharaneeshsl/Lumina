import { useEffect, useState } from 'react'

const API = import.meta.env.VITE_API_URL ?? '/api/v1'

type Alumni = {
  id: string
  userId: string
  graduationYear: number
  company?: string | null
  jobTitle?: string | null
  isAvailableForMentorship: boolean
  user: {
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

const list = <T,>(data: Record<string, unknown>, key: string): T[] =>
  (data[key] ?? data.items ?? data.data ?? []) as T[]

export default function AlumniPage() {
  const [tab, setTab] = useState('directory')
  const [alumni, setAlumni] = useState<Alumni[]>([])
  const [items, setItems] = useState<Item[]>([])
  const [query, setQuery] = useState('')
  const [error, setError] = useState('')

  const request = async (path: string, init?: RequestInit) => {
    const response = await fetch(API + path, {
      credentials: 'include',
      ...init,
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(data.message ?? 'Request failed')
    return data
  }

  const load = async () => {
    try {
      const directory = await request(
        '/alumni/directory?q=' + encodeURIComponent(query)
      )
      setAlumni(list<Alumni>(directory, 'alumni'))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load alumni')
    }
  }

  const loadTab = async (name: string) => {
    const paths: Record<string, string> = {
      connections: '/alumni/connections',
      mentorship: '/alumni/mentorship/sessions',
      opportunities: '/alumni/referrals',
    }
    if (!paths[name]) return
    try {
      const data = await request(paths[name])
      const key =
        name === 'connections'
          ? 'connections'
          : name === 'mentorship'
            ? 'sessions'
            : 'referrals'
      setItems(list<Item>(data, key))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load data')
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
      await loadTab('connections')
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
      await loadTab('mentorship')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Mentorship request failed')
    }
  }

  const tabs = ['directory', 'connections', 'mentorship', 'opportunities']

  return (
    <main>
      <section>
        <p>SECTION 20 · VERIFIED COMMUNITY</p>
        <h1>Lumina Alumni Network</h1>

        <nav>
          {tabs.map((name) => (
            <button
              key={name}
              onClick={() => {
                setTab(name)
                void loadTab(name)
              }}
            >
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
              <article key={item.id}>
                <h2>{item.user.name}</h2>
                <p>{item.jobTitle ?? 'Alumnus'}</p>
                <p>{item.company ?? 'Company private'}</p>
                <p>Class of {item.graduationYear}</p>
                {item.user.verification?.alumniVerified && (
                  <p>✓ Verified alumni</p>
                )}
                <button onClick={() => void connect(item.userId)}>
                  Connect
                </button>
                {item.isAvailableForMentorship && (
                  <button onClick={() => void mentor(item.userId)}>
                    Request mentorship
                  </button>
                )}
              </article>
            ))}
          </>
        )}

        {tab !== 'directory' &&
          items.map((item) => (
            <article key={item.id}>
              <h2>{item.title ?? item.topic}</h2>
              <p>{item.status}</p>
              <p>{item.company}</p>
              <p>{item.description}</p>
              <p>{item.durationMinutes}</p>
            </article>
          ))}
      </section>
    </main>
  )
}
