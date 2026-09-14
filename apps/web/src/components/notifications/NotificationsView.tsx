import React, { useCallback, useEffect, useState } from 'react'

export interface NotificationItem {
  id: string
  userId: string
  title: string
  body: string
  link: string | null
  read: boolean
  archived: boolean
  data: any
  type:
    | 'COMMENT'
    | 'COMMENT_REPLY'
    | 'LIKE'
    | 'FOLLOW'
    | 'EVENT'
    | 'CLUB'
    | 'INTERNSHIP'
    | 'INTERNSHIP_APPLICATION'
    | 'INTERNSHIP_STATUS_CHANGE'
    | 'ALUMNI_VERIFICATION'
    | 'ALUMNI_CONNECTION'
    | 'MENTORSHIP_REQUEST'
    | 'MENTORSHIP_STATUS'
    | 'SYSTEM'
  createdAt: string
}

export interface NotificationPreferenceData {
  emailEnabled: boolean
  pushEnabled: boolean
  inAppEnabled: boolean
  comments: boolean
  likes: boolean
  mentions: boolean
  events: boolean
  clubs: boolean
  internships: boolean
  alumni: boolean
  system: boolean
}

const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || '/api/v1'

async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  })
  if (!response.ok) {
    throw new Error((await response.text()) || `Request failed: ${response.status}`)
  }
  return response.status === 204 ? (undefined as T) : response.json()
}

export const NotificationsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'all' | 'unread' | 'internships' | 'alumni' | 'clubs' | 'preferences'
  >('all')
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [preferences, setPreferences] = useState<NotificationPreferenceData>({
    emailEnabled: true,
    pushEnabled: true,
    inAppEnabled: true,
    comments: true,
    likes: true,
    mentions: true,
    events: true,
    clubs: true,
    internships: true,
    alumni: true,
    system: true,
  })

  const [deviceTokens, setDeviceTokens] = useState<
    Array<{ id: string; token: string; platform: string }>
  >([])
  const [newToken, setNewToken] = useState('')
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null)
  const [showArchived, setShowArchived] = useState(false)

  const unreadCount = notifications.filter((n) => !n.read && !n.archived).length

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [items, prefs, devices] = await Promise.all([
        api<NotificationItem[]>('/notifications'),
        api<NotificationPreferenceData>('/notifications/preferences'),
        api<Array<{ id: string; token: string; platform: string }>>('/notifications/devices'),
      ])
      setNotifications(items)
      setPreferences(prefs)
      setDeviceTokens(devices)
      setLastSyncedAt(new Date().toISOString())
    } catch (e: any) {
      setError(e?.message || 'Unable to load notifications')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
    const interval = window.setInterval(() => void load(), 30000)
    const onFocus = () => void load()
    window.addEventListener('focus', onFocus)
    return () => { window.clearInterval(interval); window.removeEventListener('focus', onFocus) }
  }, [load])

  const refresh = () => {
    void load()
  }

  const handleMarkAsRead = async (id: string) => {
    try {
      await api('/notifications/read', {
        method: 'POST',
        body: JSON.stringify({ notificationIds: [id] }),
      })
      setNotifications((current) =>
        current.map((notification) =>
          notification.id === id ? { ...notification, read: true } : notification,
        ),
      )
    } catch (e: any) {
      setError(e.message)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await api('/notifications/read-all', { method: 'POST' })
      setNotifications((current) =>
        current.map((notification) => ({ ...notification, read: true })),
      )
    } catch (e: any) {
      setError(e.message)
    }
  }

  const handleArchive = async (id: string) => {
    try {
      await api(`/notifications/${encodeURIComponent(id)}/archive`, { method: 'PATCH' })
      setNotifications((current) =>
        current.map((notification) =>
          notification.id === id ? { ...notification, archived: true } : notification,
        ),
      )
    } catch (e: any) {
      setError(e.message)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await api(`/notifications/${encodeURIComponent(id)}`, { method: 'DELETE' })
      setNotifications((current) => current.filter((notification) => notification.id !== id))
    } catch (e: any) {
      setError(e.message)
    }
  }

  const updatePreferences = async (next: NotificationPreferenceData) => {
    setPreferences(next)
    try {
      const saved = await api<NotificationPreferenceData>('/notifications/preferences', {
        method: 'PATCH',
        body: JSON.stringify(next),
      })
      setPreferences(saved)
    } catch (e: any) {
      setError(e.message)
      void load()
    }
  }

  const handleRegisterToken = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newToken.trim()) return
    try {
      const created = await api<{ id: string; token: string; platform: string }>(
        '/notifications/devices',
        {
          method: 'POST',
          body: JSON.stringify({ token: newToken.trim(), platform: 'WEB' }),
        },
      )
      setDeviceTokens((current) => [
        created,
        ...current.filter((device) => device.id !== created.id),
      ])
      setNewToken('')
    } catch (e: any) {
      setError(e.message)
    }
  }

  const revokeToken = async (token: string) => {
    try {
      await api(`/notifications/devices/${encodeURIComponent(token)}`, { method: 'DELETE' })
      setDeviceTokens((current) => current.filter((device) => device.token !== token))
    } catch (e: any) {
      setError(e.message)
    }
  }

  const filteredNotifications = notifications.filter((n) => {
    if (showArchived) return n.archived
    if (n.archived) return false
    if (activeTab === 'unread') return !n.read
    if (activeTab === 'internships') return n.type.includes('INTERNSHIP')
    if (activeTab === 'alumni') return n.type.includes('ALUMNI') || n.type.includes('MENTORSHIP')
    if (activeTab === 'clubs') return n.type.includes('CLUB') || n.type.includes('EVENT')
    return true
  })

  const groupedNotifications = filteredNotifications.reduce<Record<string, NotificationItem[]>>((groups, notification) => {
    const key = new Date(notification.createdAt).toDateString()
    ;(groups[key] ||= []).push(notification)
    return groups
  }, {})

  const getTypeBadgeColor = (type: string) => {
    if (type.includes('INTERNSHIP')) return { bg: 'rgba(59, 130, 246, 0.2)', text: '#60a5fa' }
    if (type.includes('ALUMNI') || type.includes('MENTORSHIP'))
      return { bg: 'rgba(168, 85, 247, 0.2)', text: '#c084fc' }
    if (type.includes('CLUB') || type.includes('EVENT'))
      return { bg: 'rgba(236, 72, 153, 0.2)', text: '#f472b6' }
    return { bg: 'rgba(156, 163, 175, 0.2)', text: '#9ca3af' }
  }

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
            'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.15) 50%, ' +
            'rgba(236, 72, 153, 0.15) 100%)',
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
              🔔 Notification Center & Realtime Inbox
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
              Notifications & Activity Stream
            </h1>
            <p
              style={{ margin: '8px 0 0 0', color: '#9ca3af', fontSize: '15px', maxWidth: '650px' }}
            >
              Stay updated with real-time status updates on internship applications, alumni
              mentorship requests, club announcements, and system alerts.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div
              style={{
                background: 'rgba(17, 24, 39, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '12px',
                padding: '10px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <span style={{ fontSize: '20px' }}>📬</span>
              <div>
                <div
                  style={{
                    fontSize: '18px',
                    fontWeight: 800,
                    color: unreadCount > 0 ? '#6366f1' : '#9ca3af',
                  }}
                >
                  {unreadCount}
                </div>
                <div
                  style={{
                    fontSize: '11px',
                    color: '#9ca3af',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  Unread
                </div>
              </div>
            </div>

            <button onClick={() => setShowArchived((value) => !value)} style={{ background: 'transparent', color: '#c4b5fd', border: '1px solid rgba(196,181,253,.35)', borderRadius: '10px', padding: '10px 14px', cursor: 'pointer' }}>{showArchived ? 'Inbox' : 'History'}</button>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                style={{
                  background: 'rgba(99, 102, 241, 0.2)',
                  color: '#818cf8',
                  border: '1px solid rgba(99, 102, 241, 0.4)',
                  borderRadius: '10px',
                  padding: '12px 18px',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                ✓ Mark All as Read
              </button>
            )}
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
            { id: 'all', label: `📥 All (${notifications.filter((n) => !n.archived).length})` },
            { id: 'unread', label: `🔵 Unread (${unreadCount})` },
            { id: 'internships', label: '💼 Internships' },
            { id: 'alumni', label: '🎓 Alumni & Mentorship' },
            { id: 'clubs', label: '🛡️ Clubs & Events' },
            { id: 'preferences', label: '⚙️ Settings & Push Devices' },
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

      {loading && (
        <div style={{ textAlign: 'center', color: '#9ca3af', padding: '16px' }}>
          Loading notifications...
        </div>
      )}
      {error && (
        <div
          style={{
            maxWidth: '850px',
            margin: '0 auto 16px',
            padding: '12px',
            borderRadius: '8px',
            background: 'rgba(239, 68, 68, 0.12)',
            color: '#fca5a5',
          }}
        >
          {error}
          <button onClick={refresh} style={{ marginLeft: '8px', cursor: 'pointer' }}>
            Retry
          </button>
        </div>
      )}

      {lastSyncedAt && <div style={{ maxWidth: '850px', margin: '0 auto 12px', color: '#64748b', fontSize: '12px' }}>Realtime sync active · last updated {new Date(lastSyncedAt).toLocaleTimeString()}</div>}
      {/* Notifications Inbox Stream */}
      {activeTab !== 'preferences' && (
        <div style={{ maxWidth: '850px', margin: '0 auto' }}>
          {filteredNotifications.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '48px',
                background: 'rgba(17, 24, 39, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '14px',
              }}
            >
              <div style={{ fontSize: '36px', marginBottom: '12px' }}>🎉</div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#ffffff' }}>
                You are all caught up!
              </h3>
              <p style={{ margin: 0, color: '#9ca3af', fontSize: '14px' }}>
                No pending notifications matching this filter.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {Object.entries(groupedNotifications).map(([date, group]) => (<div key={date}><div style={{ color: '#94a3b8', fontSize: '12px', fontWeight: 700, margin: '8px 0' }}>{date}</div>{group.map((notif) => {
                const badgeStyle = getTypeBadgeColor(notif.type)
                return (
                  <div
                    key={notif.id}
                    style={{
                      background: notif.read ? 'rgba(17, 24, 39, 0.5)' : 'rgba(31, 41, 55, 0.8)',
                      border: notif.read
                        ? '1px solid rgba(255, 255, 255, 0.08)'
                        : '1px solid rgba(99, 102, 241, 0.4)',
                      borderRadius: '14px',
                      padding: '20px',
                      display: 'flex',
                      gap: '16px',
                      alignItems: 'flex-start',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {!notif.read && (
                      <div
                        style={{
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          background: '#6366f1',
                          marginTop: '6px',
                          flexShrink: 0,
                        }}
                      />
                    )}

                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          marginBottom: '6px',
                          flexWrap: 'wrap',
                        }}
                      >
                        <span
                          style={{
                            background: badgeStyle.bg,
                            color: badgeStyle.text,
                            padding: '2px 8px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: 700,
                          }}
                        >
                          {notif.type}
                        </span>
                        <h4
                          style={{ margin: 0, fontSize: '15px', color: '#ffffff', fontWeight: 700 }}
                        >
                          {notif.title}
                        </h4>
                        <span style={{ color: '#6b7280', fontSize: '12px', marginLeft: 'auto' }}>
                          {new Date(notif.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      {notif.link && <button onClick={() => { if (!notif.read) void handleMarkAsRead(notif.id); window.location.assign(notif.link!) }} style={{ background: 'transparent', border: 'none', padding: 0, color: '#818cf8', cursor: 'pointer', fontWeight: 600, marginBottom: '8px' }}>Open related activity →</button>}
                      <p
                        style={{
                          margin: '0 0 12px 0',
                          fontSize: '14px',
                          color: '#d1d5db',
                          lineHeight: '1.5',
                        }}
                      >
                        {notif.body}
                      </p>

                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        {!notif.read && (
                          <button
                            onClick={() => handleMarkAsRead(notif.id)}
                            style={{
                              background: 'transparent',
                              color: '#818cf8',
                              border: 'none',
                              padding: 0,
                              fontSize: '12px',
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                          >
                            Mark as read
                          </button>
                        )}
                        <button
                          onClick={() => handleArchive(notif.id)}
                          style={{
                            background: 'transparent',
                            color: '#9ca3af',
                            border: 'none',
                            padding: 0,
                            fontSize: '12px',
                            cursor: 'pointer',
                          }}
                        >
                          Archive
                        </button>
                        <button
                          onClick={() => handleDelete(notif.id)}
                          style={{
                            background: 'transparent',
                            color: '#ef4444',
                            border: 'none',
                            padding: 0,
                            fontSize: '12px',
                            cursor: 'pointer',
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}</div>))}
            </div>
          )}
        </div>
      )}

      {/* Preferences & Push Devices Tab */}
      {activeTab === 'preferences' && (
        <div
          style={{
            maxWidth: '750px',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
          }}
        >
          {/* Notification Channel Toggles */}
          <div
            style={{
              background: 'rgba(17, 24, 39, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              padding: '28px',
            }}
          >
            <h2 style={{ fontSize: '20px', fontWeight: 700, marginTop: 0, color: '#ffffff' }}>
              Notification Channel Preferences
            </h2>
            <p style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '20px' }}>
              Control which delivery channels you want to receive notifications on.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                {
                  key: 'inAppEnabled',
                  label: 'In-App Notifications',
                  desc: 'Receive real-time alerts inside the Lumina web application',
                },
                {
                  key: 'emailEnabled',
                  label: 'Email Notifications',
                  desc: 'Receive instant email digests for important status changes',
                },
                {
                  key: 'pushEnabled',
                  label: 'Push Notifications',
                  desc: 'Send web and mobile push notifications to registered devices',
                },
              ].map((chan) => (
                <div
                  key={chan.key}
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
                      {chan.label}
                    </div>
                    <div style={{ fontSize: '12px', color: '#9ca3af' }}>{chan.desc}</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={(preferences as any)[chan.key]}
                    onChange={(e) =>
                      void updatePreferences(
                        { ...preferences, [chan.key]: e.target.checked } as NotificationPreferenceData,
                      )
                    }
                    style={{
                      width: '18px',
                      height: '18px',
                      accentColor: '#6366f1',
                      cursor: 'pointer',
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Registered Push Devices */}
          <div
            style={{
              background: 'rgba(17, 24, 39, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              padding: '28px',
            }}
          >
            <h2 style={{ fontSize: '20px', fontWeight: 700, marginTop: 0, color: '#ffffff' }}>
              Registered Push Notification Devices
            </h2>
            <p style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '20px' }}>
              Manage browser web-push tokens and registered mobile devices.
            </p>

            <form
              onSubmit={handleRegisterToken}
              style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}
            >
              <input
                type="text"
                placeholder="Enter web push or FCM device token..."
                value={newToken}
                onChange={(e) => setNewToken(e.target.value)}
                style={{
                  flex: 1,
                  background: 'rgba(31, 41, 55, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  color: '#ffffff',
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
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
                }}
              >
                + Register Token
              </button>
            </form>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {deviceTokens.map((dev) => (
                <div
                  key={dev.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'rgba(31, 41, 55, 0.6)',
                    padding: '12px 16px',
                    borderRadius: '10px',
                  }}
                >
                  <div>
                    <span
                      style={{
                        background: 'rgba(99, 102, 241, 0.2)',
                        color: '#818cf8',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 700,
                        marginRight: '8px',
                      }}
                    >
                      {dev.platform}
                    </span>
                    <span style={{ fontSize: '13px', color: '#cbd5e1', fontFamily: 'monospace' }}>
                      {dev.token}
                    </span>
                  </div>
                  <button
                    onClick={() => void revokeToken(dev.token)}
                    style={{
                      background: 'transparent',
                      color: '#ef4444',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '12px',
                    }}
                  >
                    Revoke
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}