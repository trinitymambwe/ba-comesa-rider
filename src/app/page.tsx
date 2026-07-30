'use client'

import { useState, useEffect } from 'react'
import { auth, db } from '@/lib/firebase'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc, getDoc, collection, getDocs, query, where, orderBy, updateDoc } from 'firebase/firestore'
import {
  Bike, Package, DollarSign, LogOut, RefreshCw, MapPin, Phone, User,
  ChevronRight, Truck, CheckCircle, Clock, AlertTriangle, Navigation,
  Shield, Star, TrendingUp, Menu, X, Send, MessageCircle, Settings
} from 'lucide-react'

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

  const accent = '#22c55e'
  const bg = '#0d1b2a'
  const card = '#0a1628'
  const text = '#e0e0e0'
  const muted = '#9ca3af'
  const border = '#1e3a5f'

  return (
    <div style={{ minHeight: '100vh', background: `linear-gradient(180deg, ${accent} 0%, #15803d 30%, ${bg} 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '400px', backgroundColor: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.12)', padding: '32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ width: '70px', height: '70px', borderRadius: '20px', background: `linear-gradient(135deg, #4ade80, ${accent})`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 8px 25px rgba(34,197,94,0.3)' }}>
            <Bike size={36} color="white" />
          </div>
          <h1 style={{ color: 'white', fontSize: '22px', fontWeight: 700, margin: '0 0 4px' }}>baComesa Rider</h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', margin: 0 }}>Deliver with us</p>
        </div>

        {error && (
          <div style={{ backgroundColor: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', padding: '10px 14px', borderRadius: '12px', marginBottom: '16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={16} /> {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '12px', padding: '4px' }}>
          <button onClick={() => setMode('login')} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '14px', backgroundColor: mode === 'login' ? 'rgba(255,255,255,0.2)' : 'transparent', color: mode === 'login' ? 'white' : 'rgba(255,255,255,0.5)' }}>
            Login
          </button>
          <button onClick={() => setMode('signup')} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '14px', backgroundColor: mode === 'signup' ? 'rgba(255,255,255,0.2)' : 'transparent', color: mode === 'signup' ? 'white' : 'rgba(255,255,255,0.5)' }}>
            Sign Up
          </button>
        </div>

        <form onSubmit={mode === 'login' ? handleLogin : handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {mode === 'signup' && (
            <>
              <Input icon={<User size={16} />} value={name} onChange={setName} placeholder="Full Name" />
              <Input icon={<Phone size={16} />} value={phone} onChange={setPhone} placeholder="Phone Number" type="tel" />
              <Select icon={<Truck size={16} />} value={vehicle} onChange={setVehicle} options={[
                { value: 'bicycle', label: 'Bicycle' },
                { value: 'motorbike', label: 'Motorbike' },
                { value: 'car', label: 'Car' },
                { value: 'walking', label: 'Walking' },
              ]} />
              <Input icon={<MapPin size={16} />} value={area} onChange={setArea} placeholder="Delivery Area (e.g., Lusaka CBD)" />
            </>
          )}
          <Input icon={<Send size={16} />} value={email} onChange={setEmail} placeholder="Email" type="email" />
          <Input icon={<Shield size={16} />} value={password} onChange={setPassword} placeholder="Password" type="password" />
          <button type="submit" disabled={loading} style={{
            marginTop: '8px', padding: '14px', borderRadius: '14px', border: 'none', cursor: 'pointer',
            fontWeight: 700, fontSize: '15px', background: `linear-gradient(135deg, #4ade80, ${accent})`,
            color: 'white', opacity: loading ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          }}>
            {loading ? 'Please wait...' : mode === 'login' ? <><LogOut size={16} /> Sign In</> : <><User size={16} /> Create Account</>}
          </button>
        </form>
      </div>
    </div>
  )
}

function Input({ value, onChange, placeholder, icon, type = 'text' }: any) {
  return (
    <div style={{ position: 'relative' }}>
      {icon && <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }}>{icon}</span>}
      <input type={type} value={value} onChange={(e: any) => onChange(e.target.value)} placeholder={placeholder} required
        style={{ width: '100%', padding: icon ? '13px 14px 13px 42px' : '13px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.12)', outline: 'none', fontSize: '14px', backgroundColor: 'rgba(255,255,255,0.05)', color: 'white', boxSizing: 'border-box' }} />
    </div>
  )
}

function Select({ value, onChange, options, icon }: any) {
  return (
    <div style={{ position: 'relative' }}>
      {icon && <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }}>{icon}</span>}
      <select value={value} onChange={(e: any) => onChange(e.target.value)}
        style={{ width: '100%', padding: '13px 14px 13px 42px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.12)', outline: 'none', fontSize: '14px', backgroundColor: 'rgba(255,255,255,0.05)', color: 'white', boxSizing: 'border-box', appearance: 'none' }}>
        {options.map((o: any) => <option key={o.value} value={o.value} style={{ backgroundColor: '#1a3a5c', color: 'white' }}>{o.label}</option>)}
      </select>
      <ChevronRight size={14} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%) rotate(90deg)', color: 'rgba(255,255,255,0.3)', pointerEvents: 'none' }} />
    </div>
  )
}

function Dashboard({ riderData }: { riderData: any }) {
  const [deliveries, setDeliveries] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'deliveries' | 'earnings'>('deliveries')
  const [gpsTracking, setGpsTracking] = useState(false)
  const [currentLat, setCurrentLat] = useState<number | null>(null)
  const [currentLng, setCurrentLng] = useState<number | null>(null)
  const [gpsError, setGpsError] = useState('')

  useEffect(() => {
    if (!navigator.geolocation) { setGpsError('GPS not available'); return }
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setCurrentLat(pos.coords.latitude); setCurrentLng(pos.coords.longitude)
        setGpsTracking(true); setGpsError('')
        updateDoc(doc(db, 'riders', riderData.id), {
          lat: pos.coords.latitude, lng: pos.coords.longitude,
          lastLocationUpdate: new Date().toISOString(),
        }).catch(() => {})
      },
      (err) => {
        setGpsTracking(false)
        setGpsError(err.code === 1 ? 'Permission denied' : err.code === 2 ? 'Unavailable' : 'Timeout')
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

  useEffect(() => { fetchDeliveries(); const i = setInterval(fetchDeliveries, 10000); return () => clearInterval(i) }, [])

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

  const accent = '#22c55e', bg = '#0d1b2a', card = '#0a1628', text = '#e0e0e0', muted = '#9ca3af', border = '#1e3a5f'

  return (
    <div style={{ minHeight: '100vh', backgroundColor: bg, color: text }}>
      <header style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: card, borderBottom: `1px solid ${border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: `linear-gradient(135deg, #4ade80, ${accent})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bike size={20} color="white" />
          </div>
          <div>
            <p style={{ fontWeight: 700, fontSize: '15px', margin: 0 }}>baComesa Rider</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: gpsTracking ? accent : '#ef4444' }} />
              <span style={{ fontSize: '11px', color: muted }}>{gpsTracking ? 'GPS Active' : gpsError || 'No GPS'}</span>
            </div>
          </div>
        </div>
        <button onClick={async () => { await auth.signOut(); window.location.reload() }} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', color: muted, padding: '8px 14px', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <LogOut size={14} /> Logout
        </button>
      </header>

      <div style={{ margin: '16px 20px', padding: '20px', borderRadius: '20px', backgroundColor: card, border: `1px solid ${border}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontWeight: 700, fontSize: '18px', margin: 0 }}>{riderData.name}</p>
            <div style={{ display: 'flex', gap: '16px', marginTop: '4px' }}>
              <span style={{ fontSize: '13px', color: muted, display: 'flex', alignItems: 'center', gap: '4px' }}><Phone size={12} /> {riderData.phone}</span>
              <span style={{ fontSize: '13px', color: muted, display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={12} /> {riderData.area}</span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ color: accent, fontWeight: 700, fontSize: '20px', margin: 0 }}>K{Number(riderData.earnings || 0).toLocaleString()}</p>
            <p style={{ fontSize: '12px', color: muted, margin: 0 }}>{riderData.deliveries || 0} deliveries</p>
          </div>
        </div>
        {currentLat && currentLng && (
          <div style={{ marginTop: '12px', padding: '10px', borderRadius: '10px', backgroundColor: bg, border: `1px solid ${border}`, fontSize: '11px', color: muted, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Navigation size={12} color={accent} /> {currentLat.toFixed(5)}, {currentLng.toFixed(5)} — sharing with admin
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '6px', margin: '0 20px 16px', backgroundColor: card, borderRadius: '14px', padding: '4px' }}>
        <button onClick={() => setActiveTab('deliveries')} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', backgroundColor: activeTab === 'deliveries' ? accent : 'transparent', color: activeTab === 'deliveries' ? 'white' : muted }}>
          <Package size={16} /> My Deliveries ({deliveries.length})
        </button>
        <button onClick={() => setActiveTab('earnings')} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', backgroundColor: activeTab === 'earnings' ? accent : 'transparent', color: activeTab === 'earnings' ? 'white' : muted }}>
          <DollarSign size={16} /> Earnings
        </button>
        <button onClick={fetchDeliveries} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: muted, padding: '8px 12px', borderRadius: '10px', cursor: 'pointer' }}>
          <RefreshCw size={14} />
        </button>
      </div>

      <div style={{ padding: '0 20px' }}>
        {activeTab === 'deliveries' && (
          deliveries.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', borderRadius: '20px', backgroundColor: card, border: `1px solid ${border}` }}>
              <Package size={48} style={{ color: muted, marginBottom: '12px' }} />
              <p style={{ fontWeight: 700, fontSize: '16px', marginBottom: '4px' }}>No deliveries assigned</p>
              <p style={{ color: muted, fontSize: '13px' }}>Admin will assign orders to you. Auto-refreshes every 10s.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {deliveries.map((d: any) => (
                <div key={d.id} style={{ padding: '20px', borderRadius: '16px', backgroundColor: card, border: `1px solid ${border}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <p style={{ fontWeight: 700, margin: 0 }}>{d.productName}</p>
                    <span style={{ fontSize: '12px', padding: '4px 10px', borderRadius: '20px', backgroundColor: d.deliveryStatus === 'delivered' ? 'rgba(34,197,94,0.2)' : d.deliveryStatus === 'picked_up' ? 'rgba(234,179,8,0.2)' : 'rgba(34,197,94,0.2)', color: d.deliveryStatus === 'delivered' ? '#4ade80' : d.deliveryStatus === 'picked_up' ? '#facc15' : '#4ade80' }}>
                      {d.deliveryStatus?.replace('_', ' ') || 'assigned'}
                    </span>
                  </div>
                  <p style={{ fontSize: '13px', color: muted, margin: '0 0 2px' }}><MapPin size={12} style={{ marginRight: '4px' }} />{d.deliveryAddress || 'Address not set'} · {d.deliveryLocation}</p>
                  <p style={{ fontSize: '13px', color: muted, margin: '0 0 4px' }}><Phone size={12} style={{ marginRight: '4px' }} />Buyer: {d.buyerName} · {d.buyerPhone}</p>
                  {d.price && <p style={{ color: accent, fontWeight: 700, margin: '4px 0' }}>K{Number(d.price).toLocaleString()}</p>}
                  {d.deliveryStatus === 'assigned' && (
                    <button onClick={() => updateStatus(d.id, 'picked_up')} style={{ marginTop: '12px', width: '100%', padding: '12px', borderRadius: '12px', border: 'none', backgroundColor: '#facc15', color: '#000', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                      <Package size={16} /> Mark as Picked Up
                    </button>
                  )}
                  {d.deliveryStatus === 'picked_up' && (
                    <button onClick={() => updateStatus(d.id, 'delivered')} style={{ marginTop: '12px', width: '100%', padding: '12px', borderRadius: '12px', border: 'none', backgroundColor: accent, color: 'white', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                      <CheckCircle size={16} /> Mark as Delivered
                    </button>
                  )}
                  {d.deliveryStatus === 'delivered' && (
                    <p style={{ marginTop: '12px', textAlign: 'center', color: '#4ade80', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                      <CheckCircle size={16} /> Delivered · +K30 earned
                    </p>
                  )}
                </div>
              ))}
            </div>
          )
        )}

        {activeTab === 'earnings' && (
          <div style={{ borderRadius: '20px', backgroundColor: card, border: `1px solid ${border}`, padding: '24px' }}>
            <p style={{ fontWeight: 700, fontSize: '17px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <DollarSign size={20} color={accent} /> Earnings Summary
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ padding: '20px', borderRadius: '16px', backgroundColor: bg, border: `1px solid ${border}` }}>
                <p style={{ color: muted, fontSize: '12px', margin: '0 0 4px' }}>Total Earned</p>
                <p style={{ color: accent, fontWeight: 700, fontSize: '24px', margin: 0 }}>K{Number(riderData.earnings || 0).toLocaleString()}</p>
              </div>
              <div style={{ padding: '20px', borderRadius: '16px', backgroundColor: bg, border: `1px solid ${border}` }}>
                <p style={{ color: muted, fontSize: '12px', margin: '0 0 4px' }}>Deliveries</p>
                <p style={{ color: text, fontWeight: 700, fontSize: '24px', margin: 0 }}>{riderData.deliveries || 0}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}