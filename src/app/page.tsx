'use client'

import { useState, useEffect } from 'react'
import { auth, db } from '@/lib/firebase'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc, getDoc, collection, getDocs, query, where, orderBy, updateDoc } from 'firebase/firestore'

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
      setRiderData({ name, phone, vehicle, area, status: 'inactive', earnings: 0, deliveries: 0, id: result.user.uid })
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
        setRiderData({ ...snap.data(), id: result.user.uid })
        setLoggedIn(true)
      } else {
        setError('Rider profile not found. Sign up first.')
        await auth.signOut()
      }
    } catch (err: any) { setError(err.message) }
    setLoading(false)
  }

  if (loggedIn && riderData) {
    return <Dashboard riderData={riderData} />
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #1a73e8 0%, #1557b0 30%, #0d1b2a 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '400px', backgroundColor: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.15)', padding: '32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ width: '70px', height: '70px', borderRadius: '20px', background: 'linear-gradient(135deg, #4da3ff, #1a73e8)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '36px' }}>🚴</div>
          <h1 style={{ color: 'white', fontSize: '22px', fontWeight: 700 }}>baComesa Rider</h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>Deliver with us</p>
        </div>
        {error && <div style={{ backgroundColor: 'rgba(255,59,48,0.15)', border: '1px solid rgba(255,59,48,0.3)', color: '#ff6b6b', padding: '10px 14px', borderRadius: '12px', marginBottom: '16px', fontSize: '13px' }}>{error}</div>}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '12px', padding: '4px' }}>
          <button onClick={() => setMode('login')} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '14px', backgroundColor: mode === 'login' ? 'rgba(255,255,255,0.2)' : 'transparent', color: mode === 'login' ? 'white' : 'rgba(255,255,255,0.5)' }}>Login</button>
          <button onClick={() => setMode('signup')} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '14px', backgroundColor: mode === 'signup' ? 'rgba(255,255,255,0.2)' : 'transparent', color: mode === 'signup' ? 'white' : 'rgba(255,255,255,0.5)' }}>Sign Up</button>
        </div>
        <form onSubmit={mode === 'login' ? handleLogin : handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {mode === 'signup' && (
            <>
              <Input value={name} onChange={setName} placeholder="Full Name" icon="👤" />
              <Input value={phone} onChange={setPhone} placeholder="Phone Number" icon="📱" />
              <Select value={vehicle} onChange={setVehicle} options={[{ value: 'bicycle', label: '🚲 Bicycle' }, { value: 'motorbike', label: '🏍️ Motorbike' }, { value: 'car', label: '🚗 Car' }, { value: 'walking', label: '🚶 Walking' }]} />
              <Input value={area} onChange={setArea} placeholder="Delivery Area" icon="📍" />
            </>
          )}
          <Input value={email} onChange={setEmail} placeholder="Email" icon="📧" />
          <Input value={password} onChange={setPassword} placeholder="Password" icon="🔒" type="password" />
          <button type="submit" disabled={loading} style={{ marginTop: '8px', padding: '14px', borderRadius: '14px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '15px', background: 'linear-gradient(135deg, #4da3ff, #1a73e8)', color: 'white', opacity: loading ? 0.6 : 1 }}>{loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}</button>
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
        style={{ width: '100%', padding: icon ? '13px 14px 13px 42px' : '13px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.12)', outline: 'none', fontSize: '14px', backgroundColor: 'rgba(255,255,255,0.05)', color: 'white', boxSizing: 'border-box' }} />
    </div>
  )
}

function Select({ value, onChange, options }: any) {
  return (
    <div style={{ position: 'relative' }}>
      <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px' }}>🚘</span>
      <select value={value} onChange={(e: any) => onChange(e.target.value)}
        style={{ width: '100%', padding: '13px 14px 13px 42px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.12)', outline: 'none', fontSize: '14px', backgroundColor: 'rgba(255,255,255,0.05)', color: 'white', boxSizing: 'border-box', appearance: 'none' }}>
        {options.map((o: any) => <option key={o.value} value={o.value} style={{ backgroundColor: '#1a3a5c', color: 'white' }}>{o.label}</option>)}
      </select>
    </div>
  )
}

function Dashboard({ riderData }: { riderData: any }) {
  const [deliveries, setDeliveries] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'available' | 'my'>('my')

  const fetchDeliveries = async () => {
    const q = query(collection(db, 'orders'), where('riderId', '==', riderData.id), orderBy('createdAt', 'desc'))
    const snap = await getDocs(q)
    setDeliveries(snap.docs.map((d: any) => ({ id: d.id, ...d.data() })))
  }

  useEffect(() => {
    fetchDeliveries()
    const interval = setInterval(fetchDeliveries, 10000)
    return () => clearInterval(interval)
  }, [])

  const updateStatus = async (orderId: string, status: string) => {
    await updateDoc(doc(db, 'orders', orderId), { deliveryStatus: status })
    if (status === 'delivered') {
      const snap = await getDoc(doc(db, 'riders', riderData.id))
      if (snap.exists()) {
        const d = snap.data()
        await updateDoc(doc(db, 'riders', riderData.id), {
          deliveries: (d.deliveries || 0) + 1,
          earnings: (d.earnings || 0) + 30,
        })
      }
    }
    fetchDeliveries()
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #1a73e8 0%, #1557b0 25%, #0d1b2a 50%, #0d1b2a 100%)', color: 'white' }}>
      <header style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'linear-gradient(135deg, #4da3ff, #1a73e8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>🚴</div>
          <div>
            <p style={{ fontWeight: 700, fontSize: '15px' }}>baComesa Rider</p>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>{riderData.status === 'active' ? '✅ Active' : '⏳ Pending'}</p>
          </div>
        </div>
        <button onClick={async () => { await auth.signOut(); window.location.reload() }} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', padding: '8px 16px', borderRadius: '10px', cursor: 'pointer', fontSize: '13px' }}>Logout</button>
      </header>

      <div style={{ margin: '16px 20px', padding: '20px', borderRadius: '20px', backgroundColor: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(15px)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
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

      <div style={{ display: 'flex', gap: '6px', margin: '0 20px 16px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '14px', padding: '4px' }}>
        <button onClick={() => setActiveTab('my')} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '12px', backgroundColor: activeTab === 'my' ? 'rgba(255,255,255,0.2)' : 'transparent', color: activeTab === 'my' ? 'white' : 'rgba(255,255,255,0.5)' }}>📦 My Deliveries ({deliveries.length})</button>
        <button onClick={() => setActiveTab('available')} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '12px', backgroundColor: activeTab === 'available' ? 'rgba(255,255,255,0.2)' : 'transparent', color: activeTab === 'available' ? 'white' : 'rgba(255,255,255,0.5)' }}>💰 Earnings</button>
        <button onClick={fetchDeliveries} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '8px 12px', borderRadius: '10px', cursor: 'pointer', fontSize: '14px' }}>🔄</button>
      </div>

      <div style={{ padding: '0 20px' }}>
        {activeTab === 'my' && (
          deliveries.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', borderRadius: '20px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p style={{ fontSize: '64px', marginBottom: '16px' }}>📦</p>
              <p style={{ fontWeight: 700, fontSize: '17px' }}>No deliveries assigned</p>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>Admin will assign orders to you. Auto-refreshes every 10s.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {deliveries.map((d: any) => (
                <div key={d.id} style={{ padding: '20px', borderRadius: '16px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <p style={{ fontWeight: 700 }}>{d.productName}</p>
                    <span style={{ fontSize: '12px', padding: '4px 10px', borderRadius: '20px', backgroundColor: d.deliveryStatus === 'delivered' ? 'rgba(34,197,94,0.2)' : d.deliveryStatus === 'picked_up' ? 'rgba(234,179,8,0.2)' : 'rgba(59,130,246,0.2)', color: d.deliveryStatus === 'delivered' ? '#4ade80' : d.deliveryStatus === 'picked_up' ? '#facc15' : '#60a5fa' }}>{d.deliveryStatus?.replace('_', ' ') || 'assigned'}</span>
                  </div>
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>📍 {d.deliveryAddress || 'Address not set'} · {d.deliveryLocation}</p>
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>📱 Buyer: {d.buyerName} · {d.buyerPhone}</p>
                  {d.price && <p style={{ color: '#4da3ff', fontWeight: 700, marginTop: '4px' }}>K{Number(d.price).toLocaleString()}</p>}
                  {d.deliveryStatus === 'assigned' && (
                    <button onClick={() => updateStatus(d.id, 'picked_up')} style={{ marginTop: '12px', width: '100%', padding: '12px', borderRadius: '12px', border: 'none', backgroundColor: '#facc15', color: '#000', fontWeight: 700, cursor: 'pointer' }}>📦 Mark as Picked Up</button>
                  )}
                  {d.deliveryStatus === 'picked_up' && (
                    <button onClick={() => updateStatus(d.id, 'delivered')} style={{ marginTop: '12px', width: '100%', padding: '12px', borderRadius: '12px', border: 'none', backgroundColor: '#22c55e', color: 'white', fontWeight: 700, cursor: 'pointer' }}>✅ Mark as Delivered</button>
                  )}
                  {d.deliveryStatus === 'delivered' && (
                    <p style={{ marginTop: '12px', textAlign: 'center', color: '#4ade80', fontWeight: 700 }}>✅ Delivered · +K30 earned</p>
                  )}
                </div>
              ))}
            </div>
          )
        )}

        {activeTab === 'available' && (
          <div style={{ borderRadius: '20px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', padding: '24px' }}>
            <p style={{ fontWeight: 700, fontSize: '17px', marginBottom: '16px' }}>💰 Earnings Summary</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ padding: '20px', borderRadius: '16px', backgroundColor: 'rgba(255,255,255,0.05)' }}>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>Total Earned</p>
                <p style={{ color: '#4da3ff', fontWeight: 700, fontSize: '24px' }}>K{Number(riderData.earnings || 0).toLocaleString()}</p>
              </div>
              <div style={{ padding: '20px', borderRadius: '16px', backgroundColor: 'rgba(255,255,255,0.05)' }}>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>Deliveries</p>
                <p style={{ fontWeight: 700, fontSize: '24px' }}>{riderData.deliveries || 0}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}