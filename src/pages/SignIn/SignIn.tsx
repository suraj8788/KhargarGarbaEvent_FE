import { useState, type ChangeEvent, type FormEvent } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router'
import { getApiErrorMessage } from '../../api/axiosInstance'
import { saveSignedInUser } from '../../api/userSession'
import watermarkLogo from '../../assets/images/logo.jpeg'
import GarbaMusicControl from '../../components/common/GarbaMusicControl'
import { queryKeys } from '../../constants/queryKeys'
import { ROUTES } from '../../constants/routes'
import { userApi } from '../../services/user.api'

export default function SignIn() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [mobileNumber, setMobileNumber] = useState('')
  const [error, setError] = useState('')
  const [apiError, setApiError] = useState('')
  const { mutate: signIn, isPending } = useMutation({
    mutationFn: userApi.signIn,
    onSuccess: (user) => {
      saveSignedInUser(user)
      queryClient.setQueryData(queryKeys.registeredUser, user)
      queryClient.setQueryData(queryKeys.user(user.id), user)
      console.log('Signed in user:', user)
      const destination = user.role === 'ADMIN'
        ? ROUTES.spin
        : user.role === 'SCANNER'
          ? ROUTES.scanner
          : ROUTES.qrForUser(user.id)
      navigate(destination)
    },
    onError: (requestError) => {
      setApiError(getApiErrorMessage(requestError, 'Sign in'))
    },
  })

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    setMobileNumber(event.target.value)
    setError('')
    setApiError('')
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!/^[+\d][\d\s-]{7,14}$/.test(mobileNumber.trim())) {
      setError('Please enter a valid mobile number.')
      return
    }

    setApiError('')
    signIn(mobileNumber.trim())
  }

  return (
    <main className="garba-registration">
      <video className="garba-video" autoPlay muted loop playsInline aria-hidden="true">
        <source src="/garba-background.mp4" type="video/mp4" />
      </video>
      <div className="garba-overlay" aria-hidden="true" />
      <div className="garba-pattern" aria-hidden="true" />
      <img className="garba-watermark" src={watermarkLogo} alt="" aria-hidden="true" />
      <GarbaMusicControl />

      <div className="garba-content">
        <section className="garba-intro" aria-labelledby="sign-in-hero-title">
          <div className="festival-badge"><span>✦</span> NAVRATRI 2026 <span>✦</span></div>
          <p className="gujarati-title">રાસ રંગ</p>
          <h1 id="sign-in-hero-title">Your celebration.<br /><em>Your entry pass.</em></h1>
          <p className="garba-description">Sign in with your registered mobile number to access your event entry pass.</p>
          <div className="event-details">
            <div><span className="detail-icon" aria-hidden="true">◷</span><span><small>EVENT DATES</small><strong>11th–19th · 7 PM onwards</strong></span></div>
            <div><span className="detail-icon" aria-hidden="true">⌖</span><span><small>VENUE</small><strong>Deen Dayal Upadhyay Playground, Sector 7, Kharghar</strong></span></div>
          </div>
        </section>

        <section className="garba-form-card sign-in-card" aria-labelledby="sign-in-title">
          <div className="form-heading">
            <span className="form-step">WELCOME BACK</span>
            <h2 id="sign-in-title">Find your entry pass</h2>
            <p>Enter the mobile number used during registration.</p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="garba-field">
              <label htmlFor="sign-in-phone">Mobile Number</label>
              <div className="input-wrap">
                <span aria-hidden="true">☎</span>
                <input
                  id="sign-in-phone"
                  name="mobileNumber"
                  type="tel"
                  value={mobileNumber}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  autoComplete="tel"
                  inputMode="tel"
                  aria-invalid={Boolean(error)}
                />
              </div>
              {error && <small role="alert">{error}</small>}
            </div>

            {apiError && <p className="api-form-error" role="alert">{apiError}</p>}
            <button className="garba-submit" type="submit" disabled={isPending}>
              {isPending ? 'Signing in…' : 'Continue to entry pass'}
              {!isPending && <span aria-hidden="true">→</span>}
            </button>
            <p className="auth-switch">Not registered yet? <Link to={ROUTES.registration}>Register now</Link></p>
          </form>
        </section>
      </div>
      <p className="video-credit">Video by Rajani33 / Pexels</p>
    </main>
  )
}
