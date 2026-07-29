'use client'

import { useState, useEffect } from 'react'
import { auth, db } from '@/lib/firebase'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc, getDoc, collection, getDocs, query, where, orderBy, updateDoc } from 'firebase/firestore'
import { Bike, Package, DollarSign, LogOut, MapPin, Navigation } from 'lucide-react'

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
        lat: null, lng: null,
        createdAt: new Date().toISOString(),
      })
      setRiderData({ name, phone, vehicle, area, status: 'inactive', earnings: 0, deliveries: 0, id: result.user.uid })
      setLoggedIn(true)
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
        setError('Rider profile not found.')
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
          <div style={{ width: '70px', height: '70px', borderRadius: '20px', background: 'linear-gradient(135deg, #4da3ff, #1a73e8)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '36px' }}>
            <Bike size={36} color="white" />
          </div>
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
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full Name" required style={{ padding: '13px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.12)', outline: 'none', fontSize: '14px', backgroundColor: 'rgba(255,255,255,0.05)', color: 'white', width: '100%', boxSizing: 'border-box' }} />
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone Number" required style={{ padding: '13px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.12)', outline: 'none', fontSize: '14px', backgroundColor: 'rgba(255,255,255,0.05)', color: 'white', width: '100%', boxSizing: 'border-box' }} />
              <select value={vehicle} onChange={(e) => setVehicle(e.target.value)} style={{ padding: '13px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.12)', outline: 'none', fontSize: '14px', backgroundColor: 'rgba(255,255,255,0.05)', color: 'white', width: '100%' }}>
                <option value="bicycle">🚲 Bicycle</option>
                <option value="motorbike">🏍️ Motorbike</option>
                <option value="car">🚗 Car</option>
              </select>
              <input type="text" value={area} onChange={(e) => setArea(e.target.value)} placeholder="Delivery Area (e.g., Lusaka CBD)" required style={{ padding: '13px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.12)', outline: 'none', fontSize: '14px', backgroundColor: 'rgba(255,255,255,0.05)', color: 'white', width: '100%', boxSizing: 'border-box' }} />
            </>
          )}
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required style={{ padding: '13px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.12)', outline: 'none', fontSize: '14px', backgroundColor: 'rgba(255,255,255,0.05)', color: 'white', width: '100%', boxSizing: 'border-box' }} />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required minLength={6} style={{ padding: '13px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.12)', outline: 'none', fontSize: '14px', backgroundColor: 'rgba(255,255,255,0.05)', color: 'white', width: '100%', boxSizing: 'border-box' }} />
          <button type="submit" disabled={loading} style={{ marginTop: '8px', padding: '14px', borderRadius: '14px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '15px', background: 'linear-gradient(135deg, #4da3ff, #1a73e8)', color: 'white', opacity: loading ? 0.6 : 1 }}>{loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}</button>
        </form>
      </div>
    </div>
  )
}

function Dashboard({ riderData }: { riderData: any }) {
  const [deliveries, setDeliveries] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'available' | 'my'>('my')
  const [gpsStatus, setGpsStatus] = useState('Requesting GPS...')

  // GPS TRACKING - THIS IS THE KEY PART
  useEffect(() => {
    if (!navigator.geolocation) {
      setGpsStatus('GPS not available')
      return
    }

    setGpsStatus('Getting location...')

    const watchId = navigator.geolocation.watchPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords
        setGpsStatus(`📍 ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`)
        try {
          await updateDoc(doc(db, 'riders', riderData.id), {
            lat: latitude,
            lng: longitude,
          })
        } catch (e) {
          console.log('GPS update failed')
        }
      },
      (err) => {
        setGpsStatus('GPS denied - please allow location')
        console.log('GPS error:', err.message)
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    )

    return () => navigator.geolocation.clearWatch(watchId)
  }, [riderData.id])

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
        await updateDoc(doc(db, 'riders', riderData.id), { deliveries: (d.deliveries || 0) + 1, earnings: (d.earnings || 0) + 30 })
      }
    }
    fetchDeliveries()
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #1a73e8 0%, #1557b0 25%, #0d1b2a 50%, #0d1b2a 100%)', color: 'white' }}>
      <header style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div>
          <p style={{ fontWeight: 700, fontSize: '15px' }}>baComesa Rider</p>
          <p style={{ fontSize: '11px', color: '#4ade80', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <MapPin size={12} /> {gpsStatus}
          </p>
        </div>
        <button onClick={async () => { await auth.signOut(); window.location.reload() }} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: 'rgba(255,255,255,0.7)', padding: '8px 16px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <LogOut size={14} /> Logout
        </button>
      </header>

      <div style={{ margin: '16px 20px', padding: '20px', borderRadius: '20px', backgroundColor: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(15px)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontWeight: 700, fontSize: '18px' }}>{riderData.name}</p>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: '4px' }}><Navigation size={12} /> {riderData.phone} · {riderData.area}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ color: '#4da3ff', fontWeight: 700, fontSize: '20px', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}><DollarSign size={16} /> K{Number(riderData.earnings || 0).toLocaleString()}</p>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>{riderData.deliveries || 0} deliveries</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '6px', margin: '0 20px 16px' }}>
        <button onClick={() => setActiveTab('my')} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '12px', backgroundColor: activeTab === 'my' ? 'rgba(255,255,255,0.2)' : 'transparent', color: activeTab === 'my' ? 'white' : 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
          <Package size={14} /> My Deliveries ({deliveries.length})
        </button>
        <button onClick={() => setActiveTab('available')} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '12px', backgroundColor: activeTab === 'available' ? 'rgba(255,255,255,0.2)' : 'transparent', color: activeTab === 'available' ? 'white' : 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
          <DollarSign size={14} /> Earnings
        </button>
      </div>

      <div style={{ padding: '0 20px' }}>
        {activeTab === 'my' && (
          deliveries.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', borderRadius: '20px', backgroundColor: 'rgba(255,255,255,0.03)' }}>
              <Package size={48} style={{ color: 'rgba(255,255,255,0.3)', marginBottom: '16px' }} />
              <p style={{ fontWeight: 700, fontSize: '17px' }}>No deliveries assigned</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {deliveries.map((d: any) => (
                <div key={d.id} style={{ padding: '20px', borderRadius: '16px', backgroundColor: 'rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <p style={{ fontWeight: 700 }}>{d.productName}</p>
                    <span style={{ fontSize: '12px', padding: '4px 10px', borderRadius: '20px', backgroundColor: d.deliveryStatus === 'delivered' ? 'rgba(34,197,94,0.2)' : 'rgba(59,130,246,0.2)', color: d.deliveryStatus === 'delivered' ? '#4ade80' : '#60a5fa' }}>{d.deliveryStatus}</span>
                  </div>
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>📍 {d.deliveryAddress}</p>
                  {d.deliveryStatus === 'assigned' && <button onClick={() => updateStatus(d.id, 'picked_up')} style={{ marginTop: '12px', width: '100%', padding: '12px', borderRadius: '12px', border: 'none', backgroundColor: '#facc15', color: '#000', fontWeight: 700, cursor: 'pointer' }}>📦 Mark as Picked Up</button>}
                  {d.deliveryStatus === 'picked_up' && <button onClick={() => updateStatus(d.id, 'delivered')} style={{ marginTop: '12px', width: '100%', padding: '12px', borderRadius: '12px', border: 'none', backgroundColor: '#22c55e', color: 'white', fontWeight: 700, cursor: 'pointer' }}>✅ Mark as Delivered</button>}
                  {d.deliveryStatus === 'delivered' && <p style={{ marginTop: '12px', textAlign: 'center', color: '#4ade80', fontWeight: 700 }}>✅ Delivered · +K30 earned</p>}
                </div>
              ))}
            </div>
          )
        )}
        {activeTab === 'available' && (
          <div style={{ borderRadius: '20px', backgroundColor: 'rgba(255,255,255,0.03)', padding: '24px' }}>
            <p style={{ fontWeight: 700, fontSize: '17px', marginBottom: '16px' }}>Earnings Summary</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ padding: '20px', borderRadius: '16px', backgroundColor: 'rgba(255,255,255,0.05)' }}><p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>Total Earned</p><p style={{ color: '#4da3ff', fontWeight: 700, fontSize: '24px' }}>K{Number(riderData.earnings || 0).toLocaleString()}</p></div>
              <div style={{ padding: '20px', borderRadius: '16px', backgroundColor: 'rgba(255,255,255,0.05)' }}><p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>Deliveries</p><p style={{ fontWeight: 700, fontSize: '24px' }}>{riderData.deliveries || 0}</p></div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}