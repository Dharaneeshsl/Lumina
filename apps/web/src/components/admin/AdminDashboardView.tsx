import React, { useState } from 'react'

export interface AdminMetricsData {
  totalUsers: number
  totalColleges: number
  totalClubs: number
  totalInternships: number
  pendingVerifications: number
  openReports: number
  timestamp: string
}

export interface AdminUserData {
  id: string
  name: string
  email: string
  username: string
  role:
    | 'STUDENT'
    | 'FACULTY'
    | 'ALUMNI'
    | 'CLUB_ADMIN'
    | 'COMMUNITY_MODERATOR'
    | 'COLLEGE_ADMIN'
    | 'SUPER_ADMIN'
  status: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'BANNED' | 'DELETED'
  collegeId: string | null
  createdAt: string
  verification?: { alumniVerified: boolean; status: string }
}

export interface AdminVerificationItem {
  id: string
  userId: string
  status: string
  createdAt: string
  user: { id: string; name: string; email: string; role: string; collegeId: string | null }
}

export interface AdminReportItem {
  id: string
  commentId: string
  reporterId: string
  reason: string
  status: string
  createdAt: string
  reporter: { id: string; name: string; email: string }
  comment: { id: string; body: string; userId: string; postId: string }
}

export interface AdminAuditLogItem {
  id: string
  adminId: string
  action: string
  targetId: string | null
  targetType: string | null
  details: any
  createdAt: string
  admin: { id: string; name: string; email: string; role: string }
}

export interface AnnouncementItem {
  id: string
  title: string
  content: string
  type: string
  targetRole: string
  isActive: boolean
  createdAt: string
  createdBy: { id: string; name: string; email: string }
}

const SAMPLE_METRICS: AdminMetricsData = {
  totalUsers: 1420,
  totalColleges: 18,
  totalClubs: 86,
  totalInternships: 142,
  pendingVerifications: 12,
  openReports: 4,
  timestamp: new Date().toISOString(),
}

const SAMPLE_USERS: AdminUserData[] = [
  {
    id: 'usr-1',
    name: 'Dr. Sarah Lin',
    email: 'sarah.lin@alumni.lumina.edu',
    username: 'sarah_lin',
    role: 'ALUMNI',
    status: 'ACTIVE',
    collegeId: 'col-1',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    verification: { alumniVerified: true, status: 'VERIFIED' },
  },
  {
    id: 'usr-2',
    name: 'Alex Student',
    email: 'alex@student.lumina.edu',
    username: 'alex_s',
    role: 'STUDENT',
    status: 'ACTIVE',
    collegeId: 'col-1',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
  },
  {
    id: 'usr-3',
    name: 'Dean Robert Vance',
    email: 'robert.vance@admin.lumina.edu',
    username: 'dean_vance',
    role: 'COLLEGE_ADMIN',
    status: 'ACTIVE',
    collegeId: 'col-1',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 120).toISOString(),
  },
  {
    id: 'usr-4',
    name: 'Suspended Account User',
    email: 'spammer@temp.test',
    username: 'bad_actor',
    role: 'STUDENT',
    status: 'SUSPENDED',
    collegeId: 'col-1',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
]

const SAMPLE_VERIFICATIONS: AdminVerificationItem[] = [
  {
    id: 'ver-1',
    userId: 'usr-5',
    status: 'PENDING',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    user: {
      id: 'usr-5',
      name: 'Elena Rostova',
      email: 'elena.r@alumni.lumina.edu',
      role: 'STUDENT',
      collegeId: 'col-1',
    },
  },
]

const SAMPLE_REPORTS: AdminReportItem[] = [
  {
    id: 'rep-1',
    commentId: 'comm-101',
    reporterId: 'usr-2',
    reason: 'Inappropriate language and spam link in discussion thread.',
    status: 'OPEN',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(),
    reporter: { id: 'usr-2', name: 'Alex Student', email: 'alex@student.lumina.edu' },
    comment: {
      id: 'comm-101',
      body: 'Buy cheap tokens at spam.example.com',
      userId: 'usr-4',
      postId: 'post-99',
    },
  },
]

const SAMPLE_AUDIT_LOGS: AdminAuditLogItem[] = [
  {
    id: 'audit-1',
    adminId: 'usr-3',
    action: 'UPDATE_USER_ROLE_STATUS',
    targetId: 'usr-4',
    targetType: 'USER',
    details: { role: 'STUDENT', status: 'SUSPENDED', reason: 'Spamming discussion channels' },
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    admin: {
      id: 'usr-3',
      name: 'Dean Robert Vance',
      email: 'robert.vance@admin.lumina.edu',
      role: 'COLLEGE_ADMIN',
    },
  },
]

const SAMPLE_ANNOUNCEMENTS: AnnouncementItem[] = [
  {
    id: 'ann-1',
    title: 'Platform Maintenance Notice - Fall 2026',
    content:
      'Lumina services will undergo scheduled database optimizations on Sunday at 02:00 UTC.',
    type: 'MAINTENANCE',
    targetRole: 'ALL',
    isActive: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    createdBy: { id: 'usr-3', name: 'Dean Robert Vance', email: 'robert.vance@admin.lumina.edu' },
  },
]

export const AdminDashboardView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'users' | 'verification' | 'reports' | 'audit' | 'settings'
  >('overview')
  const [metrics] = useState<AdminMetricsData>(SAMPLE_METRICS)
  const [users, setUsers] = useState<AdminUserData[]>(SAMPLE_USERS)
  const [verifications, setVerifications] = useState<AdminVerificationItem[]>(SAMPLE_VERIFICATIONS)
  const [reports, setReports] = useState<AdminReportItem[]>(SAMPLE_REPORTS)
  const [auditLogs, setAuditLogs] = useState<AdminAuditLogItem[]>(SAMPLE_AUDIT_LOGS)
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>(SAMPLE_ANNOUNCEMENTS)

  // Filters & search
  const [userSearchQuery, setUserSearchQuery] = useState('')
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('ALL')
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL')

  // Announcement form
  const [annTitle, setAnnTitle] = useState('')
  const [annContent, setAnnContent] = useState('')
  const [annType, setAnnType] = useState('INFO')

  // System settings state
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [registrationAllowed, setRegistrationAllowed] = useState(true)

  const handleUpdateUserStatus = (userId: string, newStatus: 'ACTIVE' | 'SUSPENDED' | 'BANNED') => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, status: newStatus } : u)))

    const newLog: AdminAuditLogItem = {
      id: `audit-${Date.now()}`,
      adminId: 'usr-3',
      action: 'UPDATE_USER_ROLE_STATUS',
      targetId: userId,
      targetType: 'USER',
      details: { status: newStatus },
      createdAt: new Date().toISOString(),
      admin: {
        id: 'usr-3',
        name: 'Dean Robert Vance',
        email: 'robert.vance@admin.lumina.edu',
        role: 'COLLEGE_ADMIN',
      },
    }
    setAuditLogs([newLog, ...auditLogs])
  }

  const handleApproveVerification = (verId: string, approve: boolean) => {
    const ver = verifications.find((v) => v.id === verId)
    setVerifications((prev) => prev.filter((v) => v.id !== verId))

    if (ver && approve) {
      setUsers((prev) => prev.map((u) => (u.id === ver.userId ? { ...u, role: 'ALUMNI' } : u)))
    }

    const newLog: AdminAuditLogItem = {
      id: `audit-${Date.now()}`,
      adminId: 'usr-3',
      action: approve ? 'APPROVE_VERIFICATION' : 'REJECT_VERIFICATION',
      targetId: verId,
      targetType: 'VERIFICATION',
      details: { approve },
      createdAt: new Date().toISOString(),
      admin: {
        id: 'usr-3',
        name: 'Dean Robert Vance',
        email: 'robert.vance@admin.lumina.edu',
        role: 'COLLEGE_ADMIN',
      },
    }
    setAuditLogs([newLog, ...auditLogs])
  }

  const handleResolveReport = (reportId: string, action: string) => {
    setReports((prev) => prev.filter((r) => r.id !== reportId))

    const newLog: AdminAuditLogItem = {
      id: `audit-${Date.now()}`,
      adminId: 'usr-3',
      action: `MODERATION_${action}`,
      targetId: reportId,
      targetType: 'REPORT',
      details: { action },
      createdAt: new Date().toISOString(),
      admin: {
        id: 'usr-3',
        name: 'Dean Robert Vance',
        email: 'robert.vance@admin.lumina.edu',
        role: 'COLLEGE_ADMIN',
      },
    }
    setAuditLogs([newLog, ...auditLogs])
  }

  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault()
    if (!annTitle || !annContent) return

    const newAnn: AnnouncementItem = {
      id: `ann-${Date.now()}`,
      title: annTitle,
      content: annContent,
      type: annType,
      targetRole: 'ALL',
      isActive: true,
      createdAt: new Date().toISOString(),
      createdBy: { id: 'usr-3', name: 'Dean Robert Vance', email: 'robert.vance@admin.lumina.edu' },
    }

    setAnnouncements([newAnn, ...announcements])
    setAnnTitle('')
    setAnnContent('')
  }

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      u.username.toLowerCase().includes(userSearchQuery.toLowerCase())
    const matchesRole = selectedRoleFilter === 'ALL' || u.role === selectedRoleFilter
    const matchesStatus = selectedStatusFilter === 'ALL' || u.status === selectedStatusFilter
    return matchesSearch && matchesRole && matchesStatus
  })

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
      {/* Header Banner */}
      <div
        style={{
          background:
            'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(168, 85, 247, 0.2) 50%, rgba(236, 72, 153, 0.2) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
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
                background: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                fontSize: '12px',
                fontWeight: 700,
                color: '#fca5a5',
                marginBottom: '12px',
              }}
            >
              🛡️ Lumina Institutional Administration Console
            </div>
            <h1
              style={{
                fontSize: '32px',
                fontWeight: 800,
                margin: 0,
                background: 'linear-gradient(to right, #ffffff, #c7d2fe, #f472b6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Admin Dashboard & Control Center
            </h1>
            <p
              style={{ margin: '8px 0 0 0', color: '#9ca3af', fontSize: '15px', maxWidth: '680px' }}
            >
              Manage system users, process verification requests, moderate content reports, audit
              administrator actions, and broadcast platform announcements.
            </p>
          </div>
          <div
            style={{
              background: 'rgba(17, 24, 39, 0.8)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '12px',
              padding: '12px 20px',
              textAlign: 'right',
            }}
          >
            <div style={{ fontSize: '13px', color: '#818cf8', fontWeight: 700 }}>
              Dean Robert Vance
            </div>
            <div style={{ fontSize: '11px', color: '#9ca3af' }}>COLLEGE_ADMIN • Lumina Tech</div>
          </div>
        </div>

        {/* Tab Navigation */}
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
            { id: 'overview', label: '📊 Overview & Analytics' },
            { id: 'users', label: `👥 User Management (${users.length})` },
            { id: 'verification', label: `🎓 Verification Queue (${verifications.length})` },
            { id: 'reports', label: `🚩 Moderation Queue (${reports.length})` },
            { id: 'audit', label: `📋 Audit Logs (${auditLogs.length})` },
            { id: 'settings', label: '⚙️ Settings & Broadcasts' },
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

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div>
          {/* Summary Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '16px',
              marginBottom: '24px',
            }}
          >
            {[
              {
                label: 'Total Platform Users',
                value: metrics.totalUsers,
                color: '#6366f1',
                icon: '👥',
              },
              {
                label: 'Colleges Onboarded',
                value: metrics.totalColleges,
                color: '#38bdf8',
                icon: '🏛️',
              },
              { label: 'Active Clubs', value: metrics.totalClubs, color: '#ec4899', icon: '🛡️' },
              {
                label: 'Internships Posted',
                value: metrics.totalInternships,
                color: '#a855f7',
                icon: '💼',
              },
              {
                label: 'Pending Verifications',
                value: verifications.length,
                color: '#eab308',
                icon: '🎓',
              },
              {
                label: 'Open Content Reports',
                value: reports.length,
                color: '#ef4444',
                icon: '🚩',
              },
            ].map((card) => (
              <div
                key={card.label}
                style={{
                  background: 'rgba(17, 24, 39, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  padding: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                }}
              >
                <div style={{ fontSize: '28px' }}>{card.icon}</div>
                <div>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: card.color }}>
                    {card.value}
                  </div>
                  <div style={{ fontSize: '12px', color: '#9ca3af', fontWeight: 500 }}>
                    {card.label}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Activity Overview */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
              gap: '20px',
            }}
          >
            <div
              style={{
                background: 'rgba(17, 24, 39, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '14px',
                padding: '20px',
              }}
            >
              <h3 style={{ margin: '0 0 14px 0', fontSize: '16px', color: '#ffffff' }}>
                Recent Administrative Activity
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {auditLogs.slice(0, 5).map((log) => (
                  <div
                    key={log.id}
                    style={{
                      background: 'rgba(31, 41, 55, 0.6)',
                      padding: '12px',
                      borderRadius: '8px',
                      borderLeft: '3px solid #6366f1',
                    }}
                  >
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff' }}>
                      {log.action}
                    </div>
                    <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                      By: {log.admin.name} ({log.admin.role})
                    </div>
                    <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>
                      {new Date(log.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div
              style={{
                background: 'rgba(17, 24, 39, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '14px',
                padding: '20px',
              }}
            >
              <h3 style={{ margin: '0 0 14px 0', fontSize: '16px', color: '#ffffff' }}>
                Active System Broadcasts
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {announcements.map((ann) => (
                  <div
                    key={ann.id}
                    style={{
                      background: 'rgba(31, 41, 55, 0.6)',
                      padding: '12px',
                      borderRadius: '8px',
                      borderLeft: '3px solid #eab308',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <span style={{ fontWeight: 700, fontSize: '13px', color: '#ffffff' }}>
                        {ann.title}
                      </span>
                      <span
                        style={{
                          background: 'rgba(234,179,8,0.2)',
                          color: '#fde047',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '10px',
                        }}
                      >
                        {ann.type}
                      </span>
                    </div>
                    <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#9ca3af' }}>
                      {ann.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div>
          {/* User Controls */}
          <div
            style={{
              display: 'flex',
              gap: '16px',
              flexWrap: 'wrap',
              marginBottom: '20px',
              background: 'rgba(17, 24, 39, 0.7)',
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <input
              type="text"
              placeholder="Search users by name, email, or username..."
              value={userSearchQuery}
              onChange={(e) => setUserSearchQuery(e.target.value)}
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
              value={selectedRoleFilter}
              onChange={(e) => setSelectedRoleFilter(e.target.value)}
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
              <option value="ALL">All Roles</option>
              <option value="STUDENT">STUDENT</option>
              <option value="FACULTY">FACULTY</option>
              <option value="ALUMNI">ALUMNI</option>
              <option value="COLLEGE_ADMIN">COLLEGE_ADMIN</option>
              <option value="SUPER_ADMIN">SUPER_ADMIN</option>
            </select>
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
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
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="SUSPENDED">SUSPENDED</option>
              <option value="BANNED">BANNED</option>
            </select>
          </div>

          {/* User Table */}
          <div
            style={{
              overflowX: 'auto',
              background: 'rgba(17, 24, 39, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '14px',
            }}
          >
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                textAlign: 'left',
                fontSize: '14px',
              }}
            >
              <thead>
                <tr
                  style={{
                    background: 'rgba(31, 41, 55, 0.8)',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#818cf8',
                  }}
                >
                  <th style={{ padding: '14px 18px' }}>User</th>
                  <th style={{ padding: '14px 18px' }}>Role</th>
                  <th style={{ padding: '14px 18px' }}>Status</th>
                  <th style={{ padding: '14px 18px' }}>Joined Date</th>
                  <th style={{ padding: '14px 18px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}
                  >
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: 700, color: '#ffffff' }}>{user.name}</div>
                      <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                        {user.email} (@{user.username})
                      </div>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <span
                        style={{
                          background: 'rgba(99, 102, 241, 0.2)',
                          color: '#818cf8',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 600,
                        }}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <span
                        style={{
                          background:
                            user.status === 'ACTIVE'
                              ? 'rgba(34, 197, 94, 0.2)'
                              : 'rgba(239, 68, 68, 0.2)',
                          color: user.status === 'ACTIVE' ? '#4ade80' : '#fca5a5',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 600,
                        }}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px', color: '#9ca3af', fontSize: '13px' }}>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      {user.status === 'ACTIVE' ? (
                        <button
                          onClick={() => handleUpdateUserStatus(user.id, 'SUSPENDED')}
                          style={{
                            background: 'rgba(239, 68, 68, 0.2)',
                            color: '#fca5a5',
                            border: '1px solid rgba(239, 68, 68, 0.4)',
                            borderRadius: '6px',
                            padding: '6px 12px',
                            fontSize: '12px',
                            cursor: 'pointer',
                          }}
                        >
                          Suspend User
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUpdateUserStatus(user.id, 'ACTIVE')}
                          style={{
                            background: 'rgba(34, 197, 94, 0.2)',
                            color: '#4ade80',
                            border: '1px solid rgba(34, 197, 94, 0.4)',
                            borderRadius: '6px',
                            padding: '6px 12px',
                            fontSize: '12px',
                            cursor: 'pointer',
                          }}
                        >
                          Reactivate User
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Verification Queue Tab */}
      {activeTab === 'verification' && (
        <div
          style={{
            background: 'rgba(17, 24, 39, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '14px',
            padding: '24px',
          }}
        >
          <h2 style={{ fontSize: '20px', fontWeight: 700, marginTop: 0, color: '#ffffff' }}>
            Pending Verification Queue
          </h2>
          <p style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '20px' }}>
            Review and approve pending student ID and alumni status verification requests.
          </p>

          {verifications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px', color: '#9ca3af' }}>
              🎉 Verification queue is empty! All pending requests processed.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {verifications.map((ver) => (
                <div
                  key={ver.id}
                  style={{
                    background: 'rgba(31, 41, 55, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '10px',
                    padding: '16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', color: '#ffffff' }}>
                      {ver.user.name} ({ver.user.email})
                    </h4>
                    <p style={{ margin: 0, fontSize: '13px', color: '#9ca3af' }}>
                      Requested: Alumni & Degree Verification • Submitted:{' '}
                      {new Date(ver.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => handleApproveVerification(ver.id, false)}
                      style={{
                        background: 'rgba(239, 68, 68, 0.2)',
                        color: '#fca5a5',
                        border: '1px solid rgba(239, 68, 68, 0.4)',
                        borderRadius: '8px',
                        padding: '8px 16px',
                        fontSize: '13px',
                        cursor: 'pointer',
                      }}
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleApproveVerification(ver.id, true)}
                      style={{
                        background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '8px 16px',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      ✓ Approve Verification
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Reports Queue Tab */}
      {activeTab === 'reports' && (
        <div
          style={{
            background: 'rgba(17, 24, 39, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '14px',
            padding: '24px',
          }}
        >
          <h2 style={{ fontSize: '20px', fontWeight: 700, marginTop: 0, color: '#ffffff' }}>
            Moderation & Content Reports
          </h2>
          <p style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '20px' }}>
            Review user reports regarding inappropriate content, harassment, or spam links.
          </p>

          {reports.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px', color: '#9ca3af' }}>
              🎉 Moderation queue clean! No open reports pending.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {reports.map((rep) => (
                <div
                  key={rep.id}
                  style={{
                    background: 'rgba(31, 41, 55, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '10px',
                    padding: '16px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '10px',
                    }}
                  >
                    <div>
                      <span
                        style={{
                          background: 'rgba(239, 68, 68, 0.2)',
                          color: '#fca5a5',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 700,
                        }}
                      >
                        REPORTED COMMENT
                      </span>
                      <p
                        style={{
                          margin: '6px 0 0 0',
                          fontSize: '14px',
                          color: '#ffffff',
                          fontWeight: 600,
                        }}
                      >
                        Reason: {rep.reason}
                      </p>
                      <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#9ca3af' }}>
                        Reported by: {rep.reporter.name}
                      </p>
                    </div>
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>
                      {new Date(rep.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <div
                    style={{
                      background: 'rgba(17, 24, 39, 0.8)',
                      padding: '12px',
                      borderRadius: '8px',
                      borderLeft: '3px solid #ef4444',
                      marginBottom: '14px',
                      fontSize: '13px',
                      color: '#e5e7eb',
                    }}
                  >
                    "{rep.comment.body}"
                  </div>

                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => handleResolveReport(rep.id, 'RESOLVE')}
                      style={{
                        background: 'transparent',
                        color: '#9ca3af',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '6px',
                        padding: '6px 14px',
                        fontSize: '12px',
                        cursor: 'pointer',
                      }}
                    >
                      Dismiss Report
                    </button>
                    <button
                      onClick={() => handleResolveReport(rep.id, 'HIDE')}
                      style={{
                        background: 'rgba(234, 179, 8, 0.2)',
                        color: '#fde047',
                        border: '1px solid rgba(234, 179, 8, 0.4)',
                        borderRadius: '6px',
                        padding: '6px 14px',
                        fontSize: '12px',
                        cursor: 'pointer',
                      }}
                    >
                      Hide Content
                    </button>
                    <button
                      onClick={() => handleResolveReport(rep.id, 'BAN')}
                      style={{
                        background: 'rgba(239, 68, 68, 0.2)',
                        color: '#fca5a5',
                        border: '1px solid rgba(239, 68, 68, 0.4)',
                        borderRadius: '6px',
                        padding: '6px 14px',
                        fontSize: '12px',
                        cursor: 'pointer',
                      }}
                    >
                      Ban User
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Audit Logs Tab */}
      {activeTab === 'audit' && (
        <div
          style={{
            background: 'rgba(17, 24, 39, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '14px',
            padding: '24px',
          }}
        >
          <h2 style={{ fontSize: '20px', fontWeight: 700, marginTop: 0, color: '#ffffff' }}>
            Administrator Audit Trail
          </h2>
          <p style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '20px' }}>
            Immutable audit log records for all privileged administrative actions and system
            modifications.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {auditLogs.map((log) => (
              <div
                key={log.id}
                style={{
                  background: 'rgba(31, 41, 55, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  padding: '14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      marginBottom: '4px',
                    }}
                  >
                    <span
                      style={{
                        background: 'rgba(99, 102, 241, 0.2)',
                        color: '#818cf8',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 700,
                      }}
                    >
                      {log.action}
                    </span>
                    <span style={{ fontSize: '14px', color: '#ffffff', fontWeight: 600 }}>
                      By: {log.admin.name}
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                    Details: {JSON.stringify(log.details)}
                  </div>
                </div>
                <span style={{ fontSize: '12px', color: '#6b7280' }}>
                  {new Date(log.createdAt).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Settings & Announcements Tab */}
      {activeTab === 'settings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Create Announcement */}
          <div
            style={{
              background: 'rgba(17, 24, 39, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '14px',
              padding: '24px',
            }}
          >
            <h2 style={{ fontSize: '20px', fontWeight: 700, marginTop: 0, color: '#ffffff' }}>
              Broadcast System Announcement
            </h2>
            <form
              onSubmit={handleCreateAnnouncement}
              style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '16px' }}
            >
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    color: '#d1d5db',
                    marginBottom: '6px',
                  }}
                >
                  Announcement Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Scheduled Campus System Upgrade"
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(31, 41, 55, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '8px',
                    padding: '10px',
                    color: '#ffffff',
                    outline: 'none',
                  }}
                  required
                />
              </div>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    color: '#d1d5db',
                    marginBottom: '6px',
                  }}
                >
                  Notice Type
                </label>
                <select
                  value={annType}
                  onChange={(e) => setAnnType(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(31, 41, 55, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '8px',
                    padding: '10px',
                    color: '#ffffff',
                    outline: 'none',
                  }}
                >
                  <option value="INFO">Information (INFO)</option>
                  <option value="WARNING">Warning (WARNING)</option>
                  <option value="CRITICAL">Critical (CRITICAL)</option>
                  <option value="MAINTENANCE">Maintenance (MAINTENANCE)</option>
                </select>
              </div>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    color: '#d1d5db',
                    marginBottom: '6px',
                  }}
                >
                  Content Body
                </label>
                <textarea
                  placeholder="Enter detailed broadcast notification content..."
                  value={annContent}
                  onChange={(e) => setAnnContent(e.target.value)}
                  rows={3}
                  style={{
                    width: '100%',
                    background: 'rgba(31, 41, 55, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '8px',
                    padding: '10px',
                    color: '#ffffff',
                    outline: 'none',
                    resize: 'none',
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
                  borderRadius: '8px',
                  padding: '10px 20px',
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: 'pointer',
                  alignSelf: 'flex-start',
                }}
              >
                📣 Broadcast Announcement
              </button>
            </form>
          </div>

          {/* System Feature Toggles */}
          <div
            style={{
              background: 'rgba(17, 24, 39, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '14px',
              padding: '24px',
            }}
          >
            <h2 style={{ fontSize: '20px', fontWeight: 700, marginTop: 0, color: '#ffffff' }}>
              System Configuration & Feature Flags
            </h2>

            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '16px' }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'rgba(31, 41, 55, 0.6)',
                  padding: '14px 18px',
                  borderRadius: '10px',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '15px', color: '#ffffff' }}>
                    Maintenance Mode
                  </div>
                  <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                    Restrict non-admin access during system upgrades
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={maintenanceMode}
                  onChange={(e) => setMaintenanceMode(e.target.checked)}
                  style={{
                    width: '18px',
                    height: '18px',
                    accentColor: '#6366f1',
                    cursor: 'pointer',
                  }}
                />
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'rgba(31, 41, 55, 0.6)',
                  padding: '14px 18px',
                  borderRadius: '10px',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '15px', color: '#ffffff' }}>
                    User Registrations Allowed
                  </div>
                  <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                    Allow new student signups across onboarded domains
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={registrationAllowed}
                  onChange={(e) => setRegistrationAllowed(e.target.checked)}
                  style={{
                    width: '18px',
                    height: '18px',
                    accentColor: '#6366f1',
                    cursor: 'pointer',
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboardView
