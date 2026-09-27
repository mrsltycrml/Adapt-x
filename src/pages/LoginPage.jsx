import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { demoCredentials } from '../data/demoData'
import { demoResetCode, readDemoValue, writeDemoValue } from '../data/demoStore'

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [keepSignedIn, setKeepSignedIn] = useState(true)
  const [loginError, setLoginError] = useState('')
  const [resetError, setResetError] = useState('')
  const [resetNotice, setResetNotice] = useState('')
  const [contactNotice, setContactNotice] = useState(false)

  // Forgot password flow states
  const [view, setView] = useState('login') // 'login' | 'forgot-1' | 'forgot-2' | 'forgot-3' | 'forgot-4'
  const [resetEmail, setResetEmail] = useState(demoCredentials.email)
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [newPlate, setNewPlate] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    const storedEmail = readDemoValue('demoEmail', demoCredentials.email)
    const storedPassword = readDemoValue('operatorPassword', 'AdaptDemo2026!')
    const validLogin = email.trim().toLowerCase() === storedEmail.toLowerCase()
      && password === storedPassword

    if (!validLogin) {
      setLoginError('Email or password does not match the demo operator account.')
      return
    }
    setLoginError('')
    onLogin(keepSignedIn)
  }

  const handleResetRequest = (event) => {
    event.preventDefault()
    const storedEmail = readDemoValue('demoEmail', demoCredentials.email)
    if (resetEmail.trim().toLowerCase() !== storedEmail.toLowerCase()) {
      setResetError('No demo account is registered for this email address.')
      return
    }
    setResetError('')
    setResetNotice('Demo reset code: 246810')
    setView('forgot-2')
  }

  const handleResetSubmit = (event) => {
    event.preventDefault()
    if (code.join('') !== demoResetCode) {
      setResetError('That verification code is not valid. Use the demo code shown above.')
      return
    }
    if (newPlate.length < 8) {
      setResetError('New password must be at least 8 characters.')
      return
    }
    writeDemoValue('operatorPassword', newPlate)
    setResetError('')
    setView('forgot-4')
  }

  return (
    <div className="relative flex min-h-[100dvh] w-screen flex-col overflow-x-hidden overflow-y-auto bg-black font-sans lg:h-screen lg:min-h-0 lg:flex-row lg:overflow-hidden">
      {/* ==========================================================
          LEFT PANEL (56% width on desktop) - Deep Black
          Displays "ADAPT -" on the left with neat spacing and no clipping
         ========================================================== */}
      <div
        className="hidden lg:flex w-[56%] h-full bg-[#0a0a0c] relative items-center select-none overflow-hidden z-0"
        style={{ paddingLeft: '80px' }}
      >
        {/* "ADAPT -" Branding - crisp white typography with generous left spacing */}
        <div className="relative z-10" style={{ maxWidth: '320px' }}>
          <h1
            style={{
              fontSize: '48px',
              fontWeight: 800,
              color: '#ffffff',
              letterSpacing: '-0.025em',
              lineHeight: 1.1,
              fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
              textShadow: '0 4px 16px rgba(0,0,0,0.8)',
            }}
          >
            ADAPT -
          </h1>
        </div>

        {/* Copyright badge at bottom-left */}
        <div
          className="absolute text-zinc-500 text-xs font-semibold tracking-wider z-10"
          style={{ bottom: '32px', left: '80px' }}
        >
          ® ADAPT-X
        </div>
      </div>

      <div className="relative h-[37dvh] min-h-[215px] max-h-[320px] w-full shrink-0 overflow-hidden bg-[#0a0a0c] lg:hidden">
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 500 300" preserveAspectRatio="none" aria-hidden="true">
          <path d="M -40 242 C 98 242 163 232 225 202 C 300 165 359 84 540 64" fill="none" stroke="#151618" strokeWidth="58" />
          <path d="M -40 242 C 98 242 163 232 225 202 C 300 165 359 84 540 64" fill="none" stroke="#343639" strokeWidth="48" />
          <path d="M -40 242 C 98 242 163 232 225 202 C 300 165 359 84 540 64" fill="none" stroke="#dedfdd" strokeWidth="2" strokeDasharray="16 19" opacity="0.9" />
          <path d="M 20 -45 C 128 -20 190 44 250 130 C 308 213 365 278 496 348" fill="none" stroke="#05200e" strokeWidth="65" />
          <path d="M 20 -45 C 128 -20 190 44 250 130 C 308 213 365 278 496 348" fill="none" stroke="#15803d" strokeWidth="54" />
          <motion.path d="M 20 -45 C 128 -20 190 44 250 130 C 308 213 365 278 496 348" fill="none" stroke="#f4fff7" strokeWidth="2.5" strokeDasharray="13 16" initial={{ strokeDashoffset: 0 }} animate={{ strokeDashoffset: -116 }} transition={{ duration: 4, repeat: Infinity, ease: 'linear' }} />
        </svg>
        <div className="absolute left-6 top-[47%] z-10 -translate-y-1/2 text-[31px] font-black leading-none text-white drop-shadow-lg sm:left-10 sm:text-[38px]">ADAPT<span className="ml-1 text-zinc-400">-</span></div>
        <span className="absolute bottom-3 left-5 z-10 text-[9px] font-semibold tracking-wide text-white/70">® ADAPT-X</span>
      </div>

      {/* ==========================================================
          RIGHT PANEL (44% width on desktop, 100% on mobile) - Crisp White
         ========================================================== */}
      <div
        className="relative z-20 flex min-h-[63dvh] w-full flex-1 items-start justify-center overflow-y-auto bg-[#f3f8fb] px-6 pb-8 pt-8 sm:px-12 md:px-14 lg:h-full lg:min-h-0 lg:w-[44%] lg:items-center lg:py-10"
        style={{ position: 'relative', zIndex: 20 }}
      >
        <div className="z-20 w-full max-w-[370px]">
          <AnimatePresence mode="wait">
            {/* VIEW 1: OPERATOR SIGN IN */}
            {view === 'login' && (
              <motion.div
                key="login-form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {/* Mobile branding */}
                <h1 className="text-[26px] sm:text-[28px] font-bold text-zinc-900 tracking-[-0.025em] leading-tight">
                  Operator sign in
                </h1>
                <p className="text-zinc-500 text-[14px] mt-2 mb-7 leading-normal font-normal">
                  Sign in to view your violation history and manage disputes.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Email input */}
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-700 mb-1.5">
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setLoginError('') }}
                      placeholder="operator@gmail.com"
                      required
                      autoComplete="username"
                      className="w-full px-4 py-2.5 bg-white text-zinc-900 text-[14px] rounded-md border border-zinc-200 focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10 transition-all outline-none"
                    />
                  </div>

                  {/* Password input */}
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-700 mb-1.5">
                      Password
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setLoginError('') }}
                      placeholder="Enter your password"
                      required
                      autoComplete="off"
                      className="w-full px-4 py-2.5 bg-white text-zinc-900 text-[14px] rounded-md border border-zinc-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10 transition-all outline-none"
                    />
                  </div>

                  {loginError && <p role="alert" className="text-xs font-medium text-red-600">{loginError}</p>}

                  {/* Keep me signed in & Forgot Password */}
                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={keepSignedIn}
                        onChange={(e) => setKeepSignedIn(e.target.checked)}
                        className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-zinc-300 cursor-pointer accent-emerald-600"
                      />
                      <span className="text-[13px] text-zinc-600 font-medium">Keep me signed in</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setView('forgot-1')}
                      className="text-[13px] text-emerald-600 hover:text-emerald-700 font-semibold transition-colors cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full mt-3 py-3 px-4 bg-[#111113] hover:bg-zinc-800 text-white font-semibold text-[14px] rounded-md flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.99] cursor-pointer"
                  >
                    <span>Sign in</span>
                  </button>
                </form>

                {/* Footer administrator link */}
                <p className="mt-8 text-center text-[13px] text-zinc-500">
                  Need access?{' '}
                  <a
                    href="#admin"
                    onClick={(e) => {
                      e.preventDefault()
                      setContactNotice(true)
                    }}
                    className="text-emerald-600 hover:text-emerald-700 font-semibold transition-colors"
                  >
                    Contact your administrator
                  </a>
                </p>
                {contactNotice && <p role="status" className="mt-2 text-center text-xs text-emerald-700">Contact your ADAPT-X administrator at support@adapt-x.demo.</p>}
              </motion.div>
            )}

            {/* VIEW 2: FORGOT PASSWORD - STEP 1 (Enter Email) */}
            {view === 'forgot-1' && (
              <motion.div
                key="forgot-1"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.2 }}
              >
                {/* 4-step progress indicator */}
                <div className="flex gap-2 mb-6">
                  <div className="h-[3px] flex-1 bg-emerald-600 rounded-full" />
                  <div className="h-[3px] flex-1 bg-zinc-200 rounded-full" />
                  <div className="h-[3px] flex-1 bg-zinc-200 rounded-full" />
                  <div className="h-[3px] flex-1 bg-zinc-200 rounded-full" />
                </div>

                <button
                  type="button"
                  onClick={() => setView('login')}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 mb-5 transition-colors cursor-pointer"
                >
                  <ArrowLeft size={14} /> Back
                </button>

                <h1 className="text-[24px] font-bold text-zinc-900 tracking-tight">Reset password</h1>
                <p className="text-zinc-500 text-[13px] mt-1.5 mb-6 leading-normal font-normal">
                  Enter your operator email and we will send you a reset link.
                </p>

                <form
                  onSubmit={handleResetRequest}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-700 uppercase tracking-[0.06em] mb-1.5">
                      EMAIL
                    </label>
                    <input
                      type="email"
                      required
                      value={resetEmail}
                      onChange={(e) => { setResetEmail(e.target.value); setResetError('') }}
                      placeholder="operator@gmail.com"
                      className="w-full px-4 py-2.5 bg-[#f8fafc] text-zinc-900 text-[14px] rounded-xl border border-zinc-200 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none"
                    />
                  </div>

                  {resetError && <p role="alert" className="text-xs font-medium text-red-600">{resetError}</p>}

                  <button
                    type="submit"
                    className="w-full py-3 px-4 bg-[#0f172a] hover:bg-zinc-800 text-white font-semibold text-[14px] rounded-full flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.99] cursor-pointer"
                  >
                    <span>Send reset code</span>
                    <ArrowRight size={16} />
                  </button>
                </form>
              </motion.div>
            )}

            {/* VIEW 3: FORGOT PASSWORD - STEP 2: CHECK YOUR EMAIL */}
            {view === 'forgot-2' && (
              <motion.div
                key="forgot-2"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.2 }}
              >
                {/* 4-step progress indicator */}
                <div className="flex gap-2 mb-6">
                  <div className="h-[3px] flex-1 bg-emerald-600 rounded-full" />
                  <div className="h-[3px] flex-1 bg-emerald-600 rounded-full" />
                  <div className="h-[3px] flex-1 bg-zinc-200 rounded-full" />
                  <div className="h-[3px] flex-1 bg-zinc-200 rounded-full" />
                </div>

                <button
                  type="button"
                  onClick={() => setView('forgot-1')}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 mb-5 transition-colors cursor-pointer"
                >
                  <ArrowLeft size={14} /> Back
                </button>

                <h1 className="text-[24px] font-bold text-zinc-900 tracking-tight font-sans">
                  Check your email
                </h1>
                <p className="text-zinc-500 text-[13px] mt-2 mb-7 leading-normal font-sans">
                  We sent a reset link to <strong className="text-zinc-800 font-semibold">{resetEmail}</strong>. It
                  expires in 15 minutes.
                </p>
                <p className="mb-5 rounded-md bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800">{resetNotice}</p>

                <button
                  type="button"
                  onClick={() => setView('forgot-3')}
                  className="w-full py-3 px-4 bg-[#0f172a] hover:bg-zinc-800 text-white font-semibold text-[14px] rounded-full flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.99] cursor-pointer"
                >
                  <span>I have my reset code</span>
                  <ArrowRight size={16} />
                </button>

                <p className="mt-6 text-center text-[13px] text-zinc-500">
                  Didn't get it?{' '}
                  <button
                    type="button"
                    onClick={() => setResetNotice('A fresh demo reset code is: 246810')}
                    className="text-emerald-600 hover:text-emerald-700 font-semibold transition-colors cursor-pointer"
                  >
                    Resend email
                  </button>
                </p>
              </motion.div>
            )}

            {/* VIEW 4: ENTER RESET CODE */}
            {view === 'forgot-3' && (
              <motion.div
                key="forgot-3"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.2 }}
              >
                {/* 4-step progress indicator */}
                <div className="flex gap-2 mb-6">
                  <div className="h-[3px] flex-1 bg-emerald-600 rounded-full" />
                  <div className="h-[3px] flex-1 bg-emerald-600 rounded-full" />
                  <div className="h-[3px] flex-1 bg-emerald-600 rounded-full" />
                  <div className="h-[3px] flex-1 bg-zinc-200 rounded-full" />
                </div>

                <button
                  type="button"
                  onClick={() => setView('forgot-2')}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 mb-5 transition-colors cursor-pointer"
                >
                  <ArrowLeft size={14} /> Back
                </button>

                <h1 className="text-[24px] font-bold text-zinc-900 tracking-tight font-sans">
                  Enter reset code
                </h1>
                <p className="text-zinc-500 text-[13px] mt-1.5 mb-6 leading-normal font-sans">
                  Type the security code sent to your email to verify authorization.
                </p>

                <form
                  onSubmit={handleResetSubmit}
                  className="space-y-4"
                >
                  <div className="flex justify-between gap-2">
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                      <input
                        key={i}
                        id={`code-${i}`}
                        type="text"
                        inputMode="numeric"
                        aria-label={`Verification digit ${i + 1}`}
                        maxLength="1"
                        value={code[i]}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '')
                          const nextCode = [...code]
                          nextCode[i] = val
                          setCode(nextCode)
                          if (val && i < 5) {
                            document.getElementById(`code-${i + 1}`)?.focus()
                          }
                        }}
                        className="w-11 h-11 text-center text-lg font-bold text-zinc-900 bg-[#f8fafc] border border-zinc-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none"
                      />
                    ))}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-zinc-700 uppercase tracking-[0.06em] mb-1.5">
                      NEW PASSWORD
                    </label>
                    <input
                      type="text"
                      required
                      value={newPlate}
                      onChange={(e) => { setNewPlate(e.target.value); setResetError('') }}
                      placeholder="At least 8 characters"
                      className="w-full px-4 py-2.5 bg-[#f8fafc] text-zinc-900 text-[14px] rounded-xl border border-zinc-200 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none"
                    />
                  </div>

                  {resetError && <p role="alert" className="text-xs font-medium text-red-600">{resetError}</p>}

                  <button
                    type="submit"
                    className="w-full py-3 px-4 bg-[#0f172a] hover:bg-zinc-800 text-white font-semibold text-[14px] rounded-full flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.99] cursor-pointer"
                  >
                    <span>Update password</span>
                    <ArrowRight size={16} />
                  </button>
                </form>
              </motion.div>
            )}

            {/* VIEW 5: RESET SUCCESS */}
            {view === 'forgot-4' && (
              <motion.div
                key="forgot-4"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="text-center py-4"
              >
                <div className="flex gap-2 mb-8">
                  <div className="h-[3px] flex-1 bg-emerald-600 rounded-full" />
                  <div className="h-[3px] flex-1 bg-emerald-600 rounded-full" />
                  <div className="h-[3px] flex-1 bg-emerald-600 rounded-full" />
                  <div className="h-[3px] flex-1 bg-emerald-600 rounded-full" />
                </div>

                <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center mb-5">
                  <CheckCircle2 size={36} />
                </div>

                <h1 className="text-[24px] font-bold text-zinc-900 tracking-tight font-sans">
                  Password updated
                </h1>
                <p className="text-zinc-500 text-[13px] mt-2 mb-7 max-w-xs mx-auto">
                  Your demo operator password has been updated for {resetEmail}.
                </p>

                <button
                  type="button"
                  onClick={() => setView('login')}
                  className="w-full py-3 px-4 bg-[#0f172a] hover:bg-zinc-800 text-white font-semibold text-[14px] rounded-full flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.99] cursor-pointer"
                >
                  <span>Back to sign in</span>
                  <ArrowRight size={16} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ==========================================================
          FULLSCREEN OVERLAY SVG: ROADS FORMING THE "X"
          - Crossing point at x=310, y=350 sits neatly right after "ADAPT -"
          - Green road sweeps from top-left, crosses gray road, into bottom of white panel
          - Gray road sweeps from bottom-left, under green road, into white panel
         ========================================================== */}
      <svg
        className="hidden lg:block absolute inset-0 w-full h-full"
        style={{ pointerEvents: 'none', zIndex: 1 }}
        viewBox="0 0 1000 700"
        preserveAspectRatio="none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="roadGreenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#15803d" />
            <stop offset="50%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#16a34a" />
          </linearGradient>
        </defs>

        {/* ========================================================
            ROAD 1: GRAY ROAD
           ======================================================== */}
        {/* Dark border */}
        <path
          d="M -30 530 C 90 540, 200 450, 310 350 C 410 250, 500 190, 620 160"
          stroke="#18181b"
          strokeWidth="60"
          strokeLinecap="round"
        />
        {/* Road surface */}
        <path
          d="M -30 530 C 90 540, 200 450, 310 350 C 410 250, 500 190, 620 160"
          stroke="#2f2f35"
          strokeWidth="50"
          strokeLinecap="round"
        />
        {/* White/gray dashed center line */}
        <path
          d="M -30 530 C 90 540, 200 450, 310 350 C 410 250, 500 190, 620 160"
          stroke="#71717a"
          strokeWidth="2.5"
          strokeDasharray="12 14"
        />

        {/* ========================================================
            ROAD 2: GREEN ROAD
           ======================================================== */}
        {/* Dark border */}
        <path
          d="M -10 25 C 100 35, 210 160, 310 350 C 400 510, 460 630, 570 730"
          stroke="#05200e"
          strokeWidth="62"
          strokeLinecap="round"
        />
        {/* Road surface */}
        <path
          d="M -10 25 C 100 35, 210 160, 310 350 C 400 510, 460 630, 570 730"
          stroke="url(#roadGreenGrad)"
          strokeWidth="52"
          strokeLinecap="round"
        />
        {/* White dashed center line with animated panning */}
        <motion.path
          d="M -10 25 C 100 35, 210 160, 310 350 C 400 510, 460 630, 570 730"
          stroke="#ffffff"
          strokeWidth="3.5"
          strokeDasharray="14 16"
          initial={{ strokeDashoffset: 0 }}
          animate={{ strokeDashoffset: -120 }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        />
      </svg>
    </div>
  )
}
