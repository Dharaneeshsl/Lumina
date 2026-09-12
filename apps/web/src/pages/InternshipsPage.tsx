import { useEffect, useState } from 'react'
import './InternshipsPage.css'

const API = import.meta.env.VITE_API_URL ?? '/api/v1'

export default function InternshipsPage() {
  const [items, setItems] = useState<any[]>([])
  const [applications, setApplications] = useState<any[]>([])
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(true)
  const load = async () => {
    setLoading(true)
    try {
      const r = await fetch(API + '/internships?q=' + encodeURIComponent(q), { credentials: 'include' })
      const data = await r.json()
      setItems(data.internships ?? data.items ?? data.data ?? (Array.isArray(data) ? data : []))
    } finally { setLoading(false) }
  }
  const loadApplications = async () => {
    const r = await fetch(API + '/internships/my-applications', { credentials: 'include' })
    if (r.ok) { const data = await r.json(); setApplications(data.applications ?? data.items ?? data.data ?? (Array.isArray(data) ? data : [])) }
  }
  useEffect(() => { load(); loadApplications() }, [])
  const apply = async (id: string) => {
    const resumeUrl = window.prompt('Resume URL (PDF):')
    if (!resumeUrl) return
    const r = await fetch(API + '/internships/' + id + '/apply', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ resumeUrl }) })
    if (!r.ok) return alert('Application failed')
    alert('Application submitted successfully')
    loadApplications()
  }
  return <main className="internships-page">
    <h1>Internships</h1><p>Discover opportunities, apply, and track every application.</p>
    <form onSubmit={e => { e.preventDefault(); load() }}><input value={q} onChange={e => setQ(e.target.value)} placeholder="Search internships..." /><button>Search</button></form>
    <section><h2>Open opportunities</h2>{loading ? <p>Loading...</p> : items.map(i => <article key={i.id}><h3>{i.title}</h3><strong>{i.company?.name}</strong><p>{i.description}</p><p>{[i.location, i.mode, i.type].filter(Boolean).join(' · ')}</p><button onClick={() => apply(i.id)}>Apply</button></article>)}</section>
    <section><h2>My applications</h2>{applications.length === 0 ? <p>No applications yet.</p> : applications.map(a => <article key={a.id}><h3>{a.internship?.title}</h3><p>{a.internship?.company?.name} · <b>{a.status}</b></p></article>)}</section>
  </main>
}
