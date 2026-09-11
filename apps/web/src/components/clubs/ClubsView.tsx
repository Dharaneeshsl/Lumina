import React, { useState } from 'react'

export interface ClubMember {
  id: string
  userId: string
  role: 'PRESIDENT' | 'FACULTY' | 'SECRETARY' | 'CORE_MEMBER' | 'MEMBER'
  joinedAt: string
  user: {
    id: string
    username: string | null
    name: string
    image: string | null
  }
}

export interface ClubEvent {
  id: string
  title: string
  description: string | null
  startTime: string
  endTime: string
  venue: string | null
  organizer: {
    name: string
  }
}

export interface ClubPost {
  id: string
  content: string
  isAnnouncement: boolean
  createdAt: string
  author: {
    name: string
    username: string | null
    image: string | null
  }
}

export interface ClubData {
  id: string
  name: string
  description: string | null
  category: string | null
  status: 'ACTIVE' | 'ARCHIVED'
  logo: string | null
  banner: string | null
  collegeId: string
  members: ClubMember[]
  _count: {
    members: number
    events: number
  }
}

const SAMPLE_CLUBS: ClubData[] = [
  {
    id: 'club-1',
    name: 'Robotics & Automation Society',
    description: 'Designing autonomous drones, competitive bots, and AI algorithms.',
    category: 'TECHNOLOGY',
    status: 'ACTIVE',
    logo: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=150&auto=format&fit=crop&q=80',
    banner:
      'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&auto=format&fit=crop&q=80',
    collegeId: 'college-1',
    members: [
      {
        id: 'm1',
        userId: 'u1',
        role: 'PRESIDENT',
        joinedAt: new Date().toISOString(),
        user: { id: 'u1', username: 'aarav_k', name: 'Aarav Kumar', image: null },
      },
      {
        id: 'm2',
        userId: 'u2',
        role: 'SECRETARY',
        joinedAt: new Date().toISOString(),
        user: { id: 'u2', username: 'riya_s', name: 'Riya Sharma', image: null },
      },
    ],
    _count: { members: 42, events: 5 },
  },
  {
    id: 'club-2',
    name: 'Algorithmic Coding Club',
    description: 'Mastering competitive programming, LeetCode challenges, and hackathons.',
    category: 'CODING',
    status: 'ACTIVE',
    logo: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=150&auto=format&fit=crop&q=80',
    banner:
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80',
    collegeId: 'college-1',
    members: [
      {
        id: 'm3',
        userId: 'u3',
        role: 'PRESIDENT',
        joinedAt: new Date().toISOString(),
        user: { id: 'u3', username: 'dev_m', name: 'Dev Mehta', image: null },
      },
    ],
    _count: { members: 89, events: 8 },
  },
  {
    id: 'club-3',
    name: 'Entrepreneurship & Innovation Cell',
    description: 'Incubating student startups, pitch fests, and VC mentorship.',
    category: 'STARTUP',
    status: 'ACTIVE',
    logo: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=150&auto=format&fit=crop&q=80',
    banner:
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80',
    collegeId: 'college-1',
    members: [
      {
        id: 'm4',
        userId: 'u4',
        role: 'FACULTY',
        joinedAt: new Date().toISOString(),
        user: { id: 'u4', username: 'prof_verma', name: 'Dr. Rajesh Verma', image: null },
      },
    ],
    _count: { members: 64, events: 3 },
  },
]

export default function ClubsView({ onBackToHome }: { onBackToHome: () => void }) {
  const [clubs, setClubs] = useState<ClubData[]>(SAMPLE_CLUBS)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL')
  const [activeClub, setActiveClub] = useState<ClubData | null>(null)
  const [activeTab, setActiveTab] = useState<'feed' | 'events' | 'members' | 'analytics'>('feed')

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newClubName, setNewClubName] = useState('')
  const [newClubCategory, setNewClubCategory] = useState('TECHNOLOGY')
  const [newClubDescription, setNewClubDescription] = useState('')

  const [posts, setPosts] = useState<ClubPost[]>([
    {
      id: 'p1',
      content:
        '📢 Official Announcement: Registrations for the 24-Hour Hackathon are now OPEN! Check out the Events tab to RSVP.',
      isAnnouncement: true,
      createdAt: '2 hours ago',
      author: { name: 'Aarav Kumar (President)', username: 'aarav_k', image: null },
    },
    {
      id: 'p2',
      content:
        'Great workshop session today on ROS2 and LIDAR integration! Special thanks to everyone who attended.',
      isAnnouncement: false,
      createdAt: '1 day ago',
      author: { name: 'Riya Sharma', username: 'riya_s', image: null },
    },
  ])

  const [events] = useState<ClubEvent[]>([
    {
      id: 'e1',
      title: 'Autonomous Robotics Hackathon 2026',
      description: '24-hour hardware and software competition with exciting prizes.',
      startTime: 'Oct 15, 2026 • 09:00 AM',
      endTime: 'Oct 16, 2026 • 09:00 AM',
      venue: 'Main Innovation Lab & Auditorium',
      organizer: { name: 'Aarav Kumar' },
    },
  ])

  const [newPostContent, setNewPostContent] = useState('')
  const [isAnnouncementPost, setIsAnnouncementPost] = useState(false)

  const categories = ['ALL', 'TECHNOLOGY', 'CODING', 'STARTUP', 'CULTURE', 'SPORTS']

  const filteredClubs = clubs.filter((c) => {
    const matchesCategory = selectedCategory === 'ALL' || c.category === selectedCategory
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesCategory && matchesSearch
  })

  const handleCreateClub = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newClubName.trim()) return

    const created: ClubData = {
      id: `club-${Date.now()}`,
      name: newClubName.trim(),
      category: newClubCategory,
      description: newClubDescription.trim() || null,
      status: 'ACTIVE',
      logo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=150&auto=format&fit=crop&q=80',
      banner:
        'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80',
      collegeId: 'college-1',
      members: [
        {
          id: `m-${Date.now()}`,
          userId: 'u-me',
          role: 'PRESIDENT',
          joinedAt: new Date().toISOString(),
          user: { id: 'u-me', username: 'you', name: 'You (Current User)', image: null },
        },
      ],
      _count: { members: 1, events: 0 },
    }

    setClubs([created, ...clubs])
    setNewClubName('')
    setNewClubDescription('')
    setShowCreateModal(false)
    setActiveClub(created)
  }

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPostContent.trim()) return

    const post: ClubPost = {
      id: `p-${Date.now()}`,
      content: newPostContent.trim(),
      isAnnouncement: isAnnouncementPost,
      createdAt: 'Just now',
      author: { name: 'You (Current User)', username: 'you', image: null },
    }

    setPosts([post, ...posts])
    setNewPostContent('')
    setIsAnnouncementPost(false)
  }

  return (
    <div style={styles.container}>
      {/* Top Navbar */}
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <button
            onClick={onBackToHome}
            style={styles.backBtn}
          >
            ← Home
          </button>
          <h1 style={styles.title}>Campus Clubs & Societies</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            style={styles.primaryBtn}
          >
            + Create Club
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main style={styles.main}>
        {!activeClub ? (
          /* Clubs Discovery List View */
          <div>
            {/* Search & Category Filter */}
            <div style={styles.filterBar}>
              <input
                type="text"
                placeholder="Search clubs by name or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={styles.searchInput}
              />
              <div style={styles.categoryPills}>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    style={{
                      ...styles.pill,
                      ...(selectedCategory === cat ? styles.activePill : {}),
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Club Cards Grid */}
            <div style={styles.grid}>
              {filteredClubs.map((club) => (
                <div
                  key={club.id}
                  style={styles.card}
                  onClick={() => {
                    setActiveClub(club)
                    setActiveTab('feed')
                  }}
                >
                  <div
                    style={{
                      ...styles.banner,
                      backgroundImage: `url(${club.banner})`,
                    }}
                  />
                  <div style={styles.cardContent}>
                    <img
                      src={club.logo || 'https://via.placeholder.com/60'}
                      alt={club.name}
                      style={styles.logo}
                    />
                    <div style={styles.badgeRow}>
                      <span style={styles.categoryBadge}>{club.category || 'GENERAL'}</span>
                      <span style={styles.statusBadge}>{club.status}</span>
                    </div>
                    <h2 style={styles.clubName}>{club.name}</h2>
                    <p style={styles.clubDesc}>{club.description}</p>

                    <div style={styles.cardFooter}>
                      <span style={styles.memberCount}>👥 {club._count.members} Members</span>
                      <button style={styles.viewBtn}>View Profile →</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Selected Club Profile Detail View */
          <div>
            <button
              onClick={() => setActiveClub(null)}
              style={styles.backLink}
            >
              ← Back to All Clubs
            </button>

            {/* Club Hero Header */}
            <div style={styles.heroHeader}>
              <div
                style={{
                  ...styles.heroBanner,
                  backgroundImage: `url(${activeClub.banner})`,
                }}
              />
              <div style={styles.heroContent}>
                <img
                  src={activeClub.logo || 'https://via.placeholder.com/80'}
                  alt={activeClub.name}
                  style={styles.heroLogo}
                />
                <div style={styles.heroMeta}>
                  <h1 style={styles.heroTitle}>{activeClub.name}</h1>
                  <p style={styles.heroDesc}>{activeClub.description}</p>
                  <div style={styles.heroTagRow}>
                    <span style={styles.categoryBadge}>{activeClub.category}</span>
                    <span style={styles.statusBadge}>{activeClub.status}</span>
                    <span style={styles.memberCount}>👥 {activeClub.members.length} Members</span>
                  </div>
                </div>
                <div style={styles.heroActions}>
                  <button style={styles.primaryBtn}>Join Club</button>
                  <button style={styles.secondaryBtn}>Invite Member</button>
                </div>
              </div>

              {/* Profile Navigation Tabs */}
              <div style={styles.tabsRow}>
                {(['feed', 'events', 'members', 'analytics'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    style={{
                      ...styles.tabBtn,
                      ...(activeTab === tab ? styles.activeTabBtn : {}),
                    }}
                  >
                    {tab.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Views Content */}
            <div style={styles.tabContentArea}>
              {activeTab === 'feed' && (
                <div>
                  {/* Post Composer */}
                  <form
                    onSubmit={handleCreatePost}
                    style={styles.composerForm}
                  >
                    <textarea
                      placeholder="Share an update or announcement with the club..."
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                      style={styles.composerInput}
                      rows={3}
                    />
                    <div style={styles.composerFooter}>
                      <label style={styles.checkboxLabel}>
                        <input
                          type="checkbox"
                          checked={isAnnouncementPost}
                          onChange={(e) => setIsAnnouncementPost(e.target.checked)}
                        />
                        📢 Mark as Official Announcement
                      </label>
                      <button
                        type="submit"
                        style={styles.primaryBtn}
                      >
                        Publish Post
                      </button>
                    </div>
                  </form>

                  {/* Feed Posts */}
                  <div style={styles.postsList}>
                    {posts.map((post) => (
                      <div
                        key={post.id}
                        style={{
                          ...styles.postCard,
                          ...(post.isAnnouncement ? styles.announcementCard : {}),
                        }}
                      >
                        {post.isAnnouncement && (
                          <div style={styles.announcementPill}>📢 OFFICIAL ANNOUNCEMENT</div>
                        )}
                        <div style={styles.postAuthorRow}>
                          <div style={styles.avatarCircle}>
                            {post.author.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <strong>{post.author.name}</strong>
                            <div style={styles.postTime}>{post.createdAt}</div>
                          </div>
                        </div>
                        <p style={styles.postContent}>{post.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'events' && (
                <div>
                  <div style={styles.sectionHeader}>
                    <h2>Upcoming Club Events ({events.length})</h2>
                    <button style={styles.primaryBtn}>+ Schedule Event</button>
                  </div>
                  <div style={styles.eventsGrid}>
                    {events.map((evt) => (
                      <div
                        key={evt.id}
                        style={styles.eventCard}
                      >
                        <div style={styles.eventDateBadge}>OCT 15</div>
                        <h3>{evt.title}</h3>
                        <p>{evt.description}</p>
                        <div style={styles.eventMeta}>
                          <div>🕒 {evt.startTime}</div>
                          <div>📍 {evt.venue}</div>
                          <div>👤 Organized by {evt.organizer.name}</div>
                        </div>
                        <button style={styles.rsvpBtn}>RSVP Going</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'members' && (
                <div>
                  <div style={styles.sectionHeader}>
                    <h2>Club Members & Leadership ({activeClub.members.length})</h2>
                    <button style={styles.secondaryBtn}>+ Invite User</button>
                  </div>
                  <div style={styles.membersTable}>
                    {activeClub.members.map((m) => (
                      <div
                        key={m.id}
                        style={styles.memberRow}
                      >
                        <div style={styles.memberInfo}>
                          <div style={styles.avatarCircle}>
                            {m.user.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <strong>{m.user.name}</strong>
                            <div style={styles.subtext}>@{m.user.username || 'user'}</div>
                          </div>
                        </div>
                        <span style={styles.roleBadge}>{m.role}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'analytics' && (
                <div style={styles.analyticsBox}>
                  <h2>Club Engagement & Analytics</h2>
                  <div style={styles.statsGrid}>
                    <div style={styles.statCard}>
                      <div style={styles.statNum}>{activeClub._count.members}</div>
                      <div style={styles.statLabel}>Total Members</div>
                    </div>
                    <div style={styles.statCard}>
                      <div style={styles.statNum}>{events.length}</div>
                      <div style={styles.statLabel}>Active Events</div>
                    </div>
                    <div style={styles.statCard}>
                      <div style={styles.statNum}>{posts.length}</div>
                      <div style={styles.statLabel}>Posts & Announcements</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Modal: Create Club */}
      {showCreateModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h2>Create New Campus Club</h2>
            <form onSubmit={handleCreateClub}>
              <div style={styles.fieldGroup}>
                <label>Club Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AI & Machine Learning Society"
                  value={newClubName}
                  onChange={(e) => setNewClubName(e.target.value)}
                  style={styles.modalInput}
                />
              </div>

              <div style={styles.fieldGroup}>
                <label>Category</label>
                <select
                  value={newClubCategory}
                  onChange={(e) => setNewClubCategory(e.target.value)}
                  style={styles.modalInput}
                >
                  <option value="TECHNOLOGY">Technology</option>
                  <option value="CODING">Coding & CP</option>
                  <option value="STARTUP">Startup & E-Cell</option>
                  <option value="CULTURE">Cultural & Arts</option>
                  <option value="SPORTS">Sports & Fitness</option>
                </select>
              </div>

              <div style={styles.fieldGroup}>
                <label>Description</label>
                <textarea
                  rows={3}
                  placeholder="Describe your club's goals, activities, and vision..."
                  value={newClubDescription}
                  onChange={(e) => setNewClubDescription(e.target.value)}
                  style={styles.modalInput}
                />
              </div>

              <div style={styles.modalFooter}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={styles.secondaryBtn}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={styles.primaryBtn}
                >
                  Create Club
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#0a0d14',
    color: '#f3f4f6',
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  header: {
    borderBottom: '1px solid #1f2937',
    backgroundColor: '#111827',
    padding: '1rem 2rem',
  },
  headerInner: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { fontSize: '1.5rem', fontWeight: 700, margin: 0, color: '#6366f1' },
  backBtn: {
    background: 'none',
    border: '1px solid #374151',
    color: '#d1d5db',
    padding: '0.5rem 1rem',
    borderRadius: '0.375rem',
    cursor: 'pointer',
  },
  primaryBtn: {
    backgroundColor: '#6366f1',
    color: '#fff',
    border: 'none',
    padding: '0.6rem 1.2rem',
    borderRadius: '0.375rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
  secondaryBtn: {
    backgroundColor: '#374151',
    color: '#fff',
    border: 'none',
    padding: '0.6rem 1.2rem',
    borderRadius: '0.375rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
  main: { maxWidth: '1200px', margin: '2rem auto', padding: '0 1rem' },
  filterBar: { marginBottom: '2rem' },
  searchInput: {
    width: '100%',
    padding: '0.8rem 1rem',
    backgroundColor: '#1f2937',
    border: '1px solid #374151',
    borderRadius: '0.5rem',
    color: '#fff',
    fontSize: '1rem',
    marginBottom: '1rem',
  },
  categoryPills: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap' },
  pill: {
    backgroundColor: '#1f2937',
    color: '#9ca3af',
    border: 'none',
    padding: '0.4rem 1rem',
    borderRadius: '1rem',
    cursor: 'pointer',
  },
  activePill: { backgroundColor: '#6366f1', color: '#fff' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '1.5rem',
  },
  card: {
    backgroundColor: '#111827',
    borderRadius: '0.75rem',
    border: '1px solid #1f2937',
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'transform 0.2s',
  },
  banner: { height: '120px', backgroundSize: 'cover', backgroundPosition: 'center' },
  cardContent: { padding: '1.2rem', position: 'relative' },
  logo: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    border: '3px solid #111827',
    marginTop: '-40px',
    backgroundColor: '#1f2937',
  },
  badgeRow: { display: 'flex', gap: '0.5rem', margin: '0.5rem 0' },
  categoryBadge: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    color: '#818cf8',
    padding: '0.2rem 0.6rem',
    borderRadius: '0.25rem',
    fontSize: '0.75rem',
    fontWeight: 600,
  },
  statusBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    color: '#34d399',
    padding: '0.2rem 0.6rem',
    borderRadius: '0.25rem',
    fontSize: '0.75rem',
    fontWeight: 600,
  },
  clubName: { fontSize: '1.2rem', margin: '0.5rem 0', fontWeight: 700 },
  clubDesc: { color: '#9ca3af', fontSize: '0.9rem', minHeight: '40px' },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '1rem',
    paddingTop: '0.8rem',
    borderTop: '1px solid #1f2937',
  },
  memberCount: { color: '#9ca3af', fontSize: '0.85rem' },
  viewBtn: { background: 'none', border: 'none', color: '#6366f1', fontWeight: 600 },
  backLink: {
    background: 'none',
    border: 'none',
    color: '#9ca3af',
    cursor: 'pointer',
    marginBottom: '1rem',
  },
  heroHeader: {
    backgroundColor: '#111827',
    borderRadius: '0.75rem',
    overflow: 'hidden',
    border: '1px solid #1f2937',
    marginBottom: '1.5rem',
  },
  heroBanner: { height: '200px', backgroundSize: 'cover', backgroundPosition: 'center' },
  heroContent: {
    padding: '1.5rem',
    display: 'flex',
    gap: '1.5rem',
    alignItems: 'flex-start',
    position: 'relative',
  },
  heroLogo: {
    width: '90px',
    height: '90px',
    borderRadius: '50%',
    border: '4px solid #111827',
    marginTop: '-50px',
    backgroundColor: '#1f2937',
  },
  heroMeta: { flex: 1 },
  heroTitle: { margin: 0, fontSize: '1.8rem', fontWeight: 800 },
  heroDesc: { color: '#9ca3af', margin: '0.5rem 0' },
  heroTagRow: { display: 'flex', gap: '0.8rem', alignItems: 'center' },
  heroActions: { display: 'flex', gap: '0.8rem' },
  tabsRow: {
    display: 'flex',
    borderTop: '1px solid #1f2937',
    backgroundColor: '#0f172a',
  },
  tabBtn: {
    flex: 1,
    padding: '1rem',
    background: 'none',
    border: 'none',
    color: '#9ca3af',
    fontWeight: 600,
    cursor: 'pointer',
  },
  activeTabBtn: { color: '#6366f1', borderBottom: '2px solid #6366f1' },
  tabContentArea: { padding: '1rem 0' },
  composerForm: {
    backgroundColor: '#111827',
    padding: '1rem',
    borderRadius: '0.5rem',
    border: '1px solid #1f2937',
    marginBottom: '1.5rem',
  },
  composerInput: {
    width: '100%',
    backgroundColor: '#1f2937',
    border: '1px solid #374151',
    borderRadius: '0.375rem',
    color: '#fff',
    padding: '0.8rem',
  },
  composerFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '0.8rem',
  },
  checkboxLabel: { color: '#9ca3af', fontSize: '0.9rem' },
  postsList: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  postCard: {
    backgroundColor: '#111827',
    padding: '1.2rem',
    borderRadius: '0.5rem',
    border: '1px solid #1f2937',
  },
  announcementCard: { borderColor: '#f59e0b', backgroundColor: '#1e1b4b' },
  announcementPill: {
    backgroundColor: '#f59e0b',
    color: '#000',
    display: 'inline-block',
    padding: '0.2rem 0.5rem',
    borderRadius: '0.25rem',
    fontSize: '0.7rem',
    fontWeight: 800,
    marginBottom: '0.8rem',
  },
  postAuthorRow: { display: 'flex', gap: '0.8rem', alignItems: 'center' },
  avatarCircle: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#6366f1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
  },
  postTime: { color: '#6b7280', fontSize: '0.8rem' },
  postContent: { marginTop: '0.8rem', lineHeight: 1.5 },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  eventsGrid: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  eventCard: {
    backgroundColor: '#111827',
    padding: '1.2rem',
    borderRadius: '0.5rem',
    border: '1px solid #1f2937',
    position: 'relative',
  },
  eventDateBadge: {
    position: 'absolute',
    top: '1.2rem',
    right: '1.2rem',
    backgroundColor: '#6366f1',
    padding: '0.4rem 0.8rem',
    borderRadius: '0.25rem',
    fontWeight: 700,
    fontSize: '0.8rem',
  },
  eventMeta: { color: '#9ca3af', margin: '0.8rem 0', lineHeight: 1.6 },
  rsvpBtn: {
    backgroundColor: '#10b981',
    color: '#fff',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '0.375rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
  membersTable: { display: 'flex', flexDirection: 'column', gap: '0.8rem' },
  memberRow: {
    backgroundColor: '#111827',
    padding: '0.8rem 1.2rem',
    borderRadius: '0.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    border: '1px solid #1f2937',
  },
  memberInfo: { display: 'flex', gap: '0.8rem', alignItems: 'center' },
  subtext: { color: '#6b7280', fontSize: '0.8rem' },
  roleBadge: {
    backgroundColor: '#374151',
    padding: '0.2rem 0.6rem',
    borderRadius: '0.25rem',
    fontSize: '0.8rem',
    fontWeight: 600,
  },
  analyticsBox: {
    backgroundColor: '#111827',
    padding: '1.5rem',
    borderRadius: '0.5rem',
    border: '1px solid #1f2937',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1rem',
    marginTop: '1rem',
  },
  statCard: {
    backgroundColor: '#1f2937',
    padding: '1.5rem',
    borderRadius: '0.5rem',
    textAlign: 'center',
  },
  statNum: { fontSize: '2rem', fontWeight: 800, color: '#6366f1' },
  statLabel: { color: '#9ca3af', marginTop: '0.5rem' },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#111827',
    padding: '2rem',
    borderRadius: '0.75rem',
    width: '100%',
    maxWidth: '500px',
    border: '1px solid #374151',
  },
  fieldGroup: { marginBottom: '1.2rem' },
  modalInput: {
    width: '100%',
    padding: '0.7rem',
    backgroundColor: '#1f2937',
    border: '1px solid #374151',
    borderRadius: '0.375rem',
    color: '#fff',
    marginTop: '0.4rem',
  },
  modalFooter: { display: 'flex', justifyContent: 'flex-end', gap: '0.8rem', marginTop: '1.5rem' },
}
