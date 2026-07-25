'use client'

import { useState } from 'react'
import { auth, db } from '@/lib/firebase'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'

export default function RiderHome() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [vehicle, setVehicle] = useState('bicycle')
  const [area, setArea] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [loggedIn, setLoggedIn] = useState(false)
  const [riderData, setRiderData] = useState<any>(null)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password)
      await setDoc(doc(db, 'riders', result.user.uid), {
        name, email, phone, vehicle, area,
        status: 'inactive', earnings: 0, deliveries: 0,
        createdAt: new Date().toISOString(),
      })
      setLoggedIn(true)
      setRiderData({ name, phone, vehicle, area, status: 'inactive', earnings: 0, deliveries: 0 })
    } catch (err: any) { setError(err.message) }
    setLoading(false)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const result = await signInWithEmailAndPassword(auth, email, password)
      const snap = await getDoc(doc(db, 'riders', result.user.uid))
      if (snap.exists()) {
        setRiderData(snap.data())
        setLoggedIn(true)
      } else {
        setError('Rider profile not found. Sign up first.')
        await auth.signOut()
      }
    } catch (err: any) { setError(err.message) }
    setLoading(false)
  }

  if (loggedIn && riderData) {
    return <Dashboard riderData={riderData} userId={auth.currentUser?.uid || ''} />
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #1a73e8 0%, #1557b0 30%, #0d1b2a 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        backgroundColor: 'rgba(255,255,255,0.08)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: '24px',
        border: '1px solid rgba(255,255,255,0.15)',
        padding: '32px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '70px',
            height: '70px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #4da3ff, #1a73e8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            fontSize: '36px',
            boxShadow: '0 8px 25px rgba(26,115,232,0.4)',
          }}>🚴</div>
          <h1 style={{ color: 'white', fontSize: '22px', fontWeight: 700, marginBottom: '4px' }}>baComesa Rider</h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>Deliver with us</p>
        </div>

        {error && (
          <div style={{ backgroundColor: 'rgba(255,59,48,0.15)', border: '1px solid rgba(255,59,48,0.3)', color: '#ff6b6b', padding: '10px 14px', borderRadius: '12px', marginBottom: '16px', fontSize: '13px' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '12px', padding: '4px' }}>
          <button onClick={() => setMode('login')} style={{
            flex: 1, padding: '10px', borderRadius: '10px', border: 'none', cursor: 'pointer',
            fontWeight: 600, fontSize: '14px', transition: 'all 0.3s',
            backgroundColor: mode === 'login' ? 'rgba(255,255,255,0.2)' : 'transparent',
            color: mode === 'login' ? 'white' : 'rgba(255,255,255,0.5)',
          }}>Login</button>
          <button onClick={() => setMode('signup')} style={{
            flex: 1, padding: '10px', borderRadius: '10px', border: 'none', cursor: 'pointer',
            fontWeight: 600, fontSize: '14px', transition: 'all 0.3s',
            backgroundColor: mode === 'signup' ? 'rgba(255,255,255,0.2)' : 'transparent',
            color: mode === 'signup' ? 'white' : 'rgba(255,255,255,0.5)',
          }}>Sign Up</button>
        </div>

        <form onSubmit={mode === 'login' ? handleLogin : handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {mode === 'signup' && (
            <>
              <Input value={name} onChange={setName} placeholder="Full Name" icon="👤" />
              <Input value={phone} onChange={setPhone} placeholder="Phone Number" icon="📱" type="tel" />
              <Select value={vehicle} onChange={setVehicle} options={[
                { value: 'bicycle', label: '🚲 Bicycle' },
                { value: 'motorbike', label: '🏍️ Motorbike' },
                { value: 'car', label: '🚗 Car' },
                { value: 'walking', label: '🚶 Walking' },
              ]} />
              <Input value={area} onChange={setArea} placeholder="Delivery Area (e.g., Lusaka CBD)" icon="📍" />
            </>
          )}
          <Input value={email} onChange={setEmail} placeholder="Email" icon="📧" type="email" />
          <Input value={password} onChange={setPassword} placeholder="Password" icon="🔒" type="password" />
          <button type="submit" disabled={loading} style={{
            marginTop: '8px', padding: '14px', borderRadius: '14px', border: 'none', cursor: 'pointer',
            fontWeight: 700, fontSize: '15px', transition: 'all 0.3s',
            background: 'linear-gradient(135deg, #4da3ff, #1a73e8)',
            color: 'white', opacity: loading ? 0.6 : 1,
            boxShadow: '0 8px 25px rgba(26,115,232,0.3)',
          }}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  )
}

function Input({ value, onChange, placeholder, icon, type = 'text' }: any) {
  return (
    <div style={{ position: 'relative' }}>
      {icon && <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px' }}>{icon}</span>}
      <input type={type} value={value} onChange={(e: any) => onChange(e.target.value)} placeholder={placeholder} required
        style={{
          width: '100%', padding: icon ? '13px 14px 13px 42px' : '13px 14px', borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.12)', outline: 'none', fontSize: '14px',
          backgroundColor: 'rgba(255,255,255,0.05)', color: 'white',
          boxSizing: 'border-box', transition: 'all 0.3s',
        }}
        onFocus={(e: any) => { e.target.style.borderColor = 'rgba(255,255,255,0.4)'; e.target.style.backgroundColor = 'rgba(255,255,255,0.08)' }}
        onBlur={(e: any) => { e.target.style.borderColor = 'rgba(255,255,255,0.12)'; e.target.style.backgroundColor = 'rgba(255,255,255,0.05)' }}
      />
    </div>
  )
}

function Select({ value, onChange, options }: any) {
  return (
    <div style={{ position: 'relative' }}>
      <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px' }}>🚘</span>
      <select value={value} onChange={(e: any) => onChange(e.target.value)}
        style={{
          width: '100%', padding: '13px 14px 13px 42px', borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.12)', outline: 'none', fontSize: '14px',
          backgroundColor: 'rgba(255,255,255,0.05)', color: 'white',
          boxSizing: 'border-box', appearance: 'none', cursor: 'pointer',
        }}>
        {options.map((o: any) => <option key={o.value} value={o.value} style={{ backgroundColor: '#1a3a5c', color: 'white' }}>{o.label}</option>)}
      </select>
      <span style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)', pointerEvents: 'none' }}>▼</span>
    </div>
  )
}

function Dashboard({ riderData, userId }: { riderData: any; userId: string }) {
  const [deliveries, setDeliveries] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'available' | 'my' | 'earnings'>('available')

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #1a73e8 0%, #1557b0 25%, #0d1b2a 50%, #0d1b2a 100%)',
      color: 'white',
    }}>
      {/* Header */}
      <header style={{
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '38px', height: '38px', borderRadius: '12px',
            background: 'linear-gradient(135deg, #4da3ff, #1a73e8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '20px',
          }}>🚴</div>
          <div>
            <p style={{ fontWeight: 700, fontSize: '15px', color: 'white' }}>baComesa Rider</p>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>{riderData.status === 'active' ? '✅ Active' : '⏳ Pending approval'}</p>
          </div>
        </div>
        <button onClick={async () => { await auth.signOut(); window.location.reload() }} style={{
          background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)',
          padding: '8px 16px', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: 600,
        }}>Logout</button>
      </header>

      {/* Rider Info Card */}
      <div style={{ margin: '16px 20px', padding: '20px', borderRadius: '20px', backgroundColor: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(15px)', WebkitBackdropFilter: 'blur(15px)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontWeight: 700, fontSize: '18px' }}>{riderData.name}</p>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>📱 {riderData.phone} · 📍 {riderData.area}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ color: '#4da3ff', fontWeight: 700, fontSize: '20px' }}>K{Number(riderData.earnings || 0).toLocaleString()}</p>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>{riderData.deliveries || 0} deliveries</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '6px', margin: '0 20px 16px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '14px', padding: '4px' }}>
        {[
          { key: 'available' as const, icon: '📦', label: 'Available' },
          { key: 'my' as const, icon: '🚴', label: 'My Deliveries' },
          { key: 'earnings' as const, icon: '💰', label: 'Earnings' },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
            flex: 1, padding: '12px 8px', borderRadius: '12px', border: 'none', cursor: 'pointer',
            fontWeight: 600, fontSize: '12px', transition: 'all 0.3s',
            backgroundColor: activeTab === tab.key ? 'rgba(255,255,255,0.2)' : 'transparent',
            color: activeTab === tab.key ? 'white' : 'rgba(255,255,255,0.5)',
          }}>{tab.icon} {tab.label}</button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: '0 20px' }}>
        {activeTab === 'available' && (
          <div style={{ textAlign: 'center', padding: '60px 20px', borderRadius: '20px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p style={{ fontSize: '64px', marginBottom: '16px' }}>📦</p>
            <p style={{ fontWeight: 700, fontSize: '17px', marginBottom: '8px', color: 'white' }}>No deliveries available</p>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>New delivery requests will appear here. Admin will assign orders to you.</p>
          </div>
        )}

        {activeTab === 'my' && (
          <div style={{ textAlign: 'center', padding: '60px 20px', borderRadius: '20px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p style={{ fontSize: '64px', marginBottom: '16px' }}>🚴</p>
            <p style={{ fontWeight: 700, fontSize: '17px', marginBottom: '8px', color: 'white' }}>No active deliveries</p>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>Your assigned deliveries will show here.</p>
          </div>
        )}

        {activeTab === 'earnings' && (
          <div style={{ borderRadius: '20px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', padding: '24px' }}>
            <p style={{ fontWeight: 700, fontSize: '17px', marginBottom: '16px', color: 'white' }}>💰 Earnings Summary</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ padding: '20px', borderRadius: '16px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', marginBottom: '4px' }}>Total Earned</p>
                <p style={{ color: '#4da3ff', fontWeight: 700, fontSize: '24px' }}>K{Number(riderData.earnings || 0).toLocaleString()}</p>
              </div>
              <div style={{ padding: '20px', borderRadius: '16px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', marginBottom: '4px' }}>Deliveries</p>
                <p style={{ color: 'white', fontWeight: 700, fontSize: '24px' }}>{riderData.deliveries || 0}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}