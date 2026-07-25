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
        name,
        email,
        phone,
        vehicle,
        area,
        status: 'inactive',
        earnings: 0,
        deliveries: 0,
        createdAt: new Date().toISOString(),
      })
      setLoggedIn(true)
      setRiderData({ name, phone, vehicle, area, status: 'inactive', earnings: 0, deliveries: 0 })
    } catch (err: any) {
      setError(err.message)
    }
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
    } catch (err: any) {
      setError(err.message)
    }
    setLoading(false)
  }

  if (loggedIn && riderData) {
    return <Dashboard riderData={riderData} userId={auth.currentUser?.uid || ''} />
  }

  return (
    <div className="min-h-screen bg-[#0d1b2a] flex items-center justify-center px-4">
      <div className="bg-[#0a1628] border border-[#1e3a5f] rounded-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-white">
            <span className="text-orange-500">●</span> ba<span className="text-orange-500">Comesa</span>
          </h1>
          <p className="text-gray-400 mt-2">🚴 Rider App</p>
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-4 text-sm">{error}</div>}

        <div className="flex gap-2 mb-6">
          <button onClick={() => setMode('login')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${mode === 'login' ? 'bg-orange-500 text-white' : 'bg-[#0d1b2a] text-gray-400'}`}>
            Login
          </button>
          <button onClick={() => setMode('signup')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${mode === 'signup' ? 'bg-orange-500 text-white' : 'bg-[#0d1b2a] text-gray-400'}`}>
            Sign Up
          </button>
        </div>

        <form onSubmit={mode === 'login' ? handleLogin : handleSignup} className="space-y-4">
          {mode === 'signup' && (
            <>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full Name" required className="w-full bg-[#0d1b2a] border border-[#1e3a5f] rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500" />
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone Number" required className="w-full bg-[#0d1b2a] border border-[#1e3a5f] rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500" />
              <select value={vehicle} onChange={(e) => setVehicle(e.target.value)} className="w-full bg-[#0d1b2a] border border-[#1e3a5f] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500">
                <option value="bicycle">🚲 Bicycle</option>
                <option value="motorbike">🏍️ Motorbike</option>
                <option value="car">🚗 Car</option>
                <option value="walking">🚶 Walking</option>
              </select>
              <input type="text" value={area} onChange={(e) => setArea(e.target.value)} placeholder="Delivery Area (e.g., Lusaka CBD)" required className="w-full bg-[#0d1b2a] border border-[#1e3a5f] rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500" />
            </>
          )}
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required className="w-full bg-[#0d1b2a] border border-[#1e3a5f] rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500" />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required minLength={6} className="w-full bg-[#0d1b2a] border border-[#1e3a5f] rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500" />
          <button type="submit" disabled={loading} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition">
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  )
}

function Dashboard({ riderData, userId }: { riderData: any; userId: string }) {
  const [deliveries, setDeliveries] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'available' | 'my' | 'earnings'>('available')

  return (
    <div className="min-h-screen bg-[#0d1b2a] text-gray-200">
      <header className="bg-[#0a1628] border-b border-[#1e3a5f] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl font-black"><span className="text-orange-500">●</span> <span className="text-white">ba</span><span className="text-orange-500">Comesa</span></span>
          <span className="bg-orange-500 text-white text-xs px-3 py-1 rounded-full font-bold">RIDER</span>
        </div>
        <button onClick={() => auth.signOut()} className="text-gray-400 hover:text-white text-sm">Logout</button>
      </header>

      {/* Rider Info Bar */}
      <div className="bg-[#0a1628] border-b border-[#1e3a5f] px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white font-bold">{riderData.name}</p>
            <p className="text-sm text-gray-400">{riderData.phone} · {riderData.area}</p>
          </div>
          <div className="text-right">
            <p className="text-orange-400 font-bold">K{Number(riderData.earnings || 0).toLocaleString()}</p>
            <p className="text-xs text-gray-500">{riderData.deliveries || 0} deliveries</p>
          </div>
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          <button onClick={() => setActiveTab('available')} className={`flex-1 py-3 rounded-xl font-bold text-sm transition ${activeTab === 'available' ? 'bg-orange-500 text-white' : 'bg-[#0a1628] text-gray-400 border border-[#1e3a5f]'}`}>
            📦 Available ({deliveries.length})
          </button>
          <button onClick={() => setActiveTab('my')} className={`flex-1 py-3 rounded-xl font-bold text-sm transition ${activeTab === 'my' ? 'bg-orange-500 text-white' : 'bg-[#0a1628] text-gray-400 border border-[#1e3a5f]'}`}>
            🚴 My Deliveries
          </button>
          <button onClick={() => setActiveTab('earnings')} className={`flex-1 py-3 rounded-xl font-bold text-sm transition ${activeTab === 'earnings' ? 'bg-orange-500 text-white' : 'bg-[#0a1628] text-gray-400 border border-[#1e3a5f]'}`}>
            💰 Earnings
          </button>
        </div>

        {activeTab === 'available' && (
          <div className="bg-[#0a1628] border border-[#1e3a5f] rounded-2xl p-8 text-center">
            <p className="text-6xl mb-4">📦</p>
            <p className="text-white font-bold text-lg mb-2">No deliveries available yet</p>
            <p className="text-gray-400">New delivery requests will appear here. The admin will assign orders to you.</p>
          </div>
        )}

        {activeTab === 'my' && (
          <div className="bg-[#0a1628] border border-[#1e3a5f] rounded-2xl p-8 text-center">
            <p className="text-6xl mb-4">🚴</p>
            <p className="text-white font-bold text-lg mb-2">No active deliveries</p>
            <p className="text-gray-400">Your assigned deliveries will show here with status updates.</p>
          </div>
        )}

        {activeTab === 'earnings' && (
          <div className="bg-[#0a1628] border border-[#1e3a5f] rounded-2xl p-8">
            <p className="text-white font-bold text-lg mb-4">💰 Earnings Summary</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#0d1b2a] rounded-xl p-4">
                <p className="text-gray-400 text-sm">Total Earned</p>
                <p className="text-orange-400 text-2xl font-bold">K{Number(riderData.earnings || 0).toLocaleString()}</p>
              </div>
              <div className="bg-[#0d1b2a] rounded-xl p-4">
                <p className="text-gray-400 text-sm">Deliveries</p>
                <p className="text-white text-2xl font-bold">{riderData.deliveries || 0}</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}