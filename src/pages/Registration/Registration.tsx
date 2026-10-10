import { useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router'
import { getApiErrorMessage } from '../../api/axiosInstance'
import watermarkLogo from '../../assets/images/logo.jpeg'
import GarbaMusicControl, { type GarbaMusicControlHandle } from '../../components/common/GarbaMusicControl'
import { queryKeys } from '../../constants/queryKeys'
import { ROUTES } from '../../constants/routes'
import { userApi } from '../../services/user.api'

type FormValues = { name: string; gender: string; phone: string }
type FormErrors = Partial<FormValues> & { profile?: string }

export default function Registration() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const musicControlRef = useRef<GarbaMusicControlHandle>(null)
  const [values, setValues] = useState<FormValues>({ name: '', gender: '', phone: '' })
  const [errors, setErrors] = useState<FormErrors>({})
  const [profileName, setProfileName] = useState('')
  const [profilePreview, setProfilePreview] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [apiError, setApiError] = useState('')

  function startMusic() {
    void musicControlRef.current?.play()
  }

  function updateField(event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = event.target
    const nextValue = name === 'phone' ? value.replace(/\D/g, '').slice(0, 10) : value
    setValues((current) => ({ ...current, [name]: nextValue }))
    setErrors((current) => ({ ...current, [name]: undefined }))
    setApiError('')
  }

  function handleProfileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setErrors((current) => ({ ...current, profile: 'Please choose an image file.' }))
      return
    }
    if (file.size > 3 * 1024 * 1024) {
      setErrors((current) => ({ ...current, profile: 'Image must be 3 MB or smaller.' }))
      return
    }
    setProfileName(file.name)
    setErrors((current) => ({ ...current, profile: undefined }))
    setApiError('')
    const reader = new FileReader()
    reader.onload = () => setProfilePreview(String(reader.result))
    reader.readAsDataURL(file)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors: FormErrors = {}
    if (!values.name.trim()) nextErrors.name = 'Please enter your full name.'
    if (!values.gender) nextErrors.gender = 'Please select your gender.'
    if (!/^\d{10}$/.test(values.phone)) nextErrors.phone = 'Please enter a valid 10-digit mobile number.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    setIsSubmitting(true)
    setApiError('')
    try {
      const user = await userApi.createUser({
        fullName: values.name.trim(),
        gender: values.gender,
        mobileNumber: values.phone.trim(),
        profilePicture: profilePreview || null,
      })
      queryClient.setQueryData(queryKeys.registeredUser, user)
      queryClient.setQueryData(queryKeys.user(user.id), user)
      navigate(ROUTES.qrForUser(user.id))
    } catch (error) {
      setApiError(getApiErrorMessage(error, 'Registration'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="garba-registration">
      <video className="garba-video" autoPlay muted loop playsInline aria-hidden="true">
        <source src="/garba-background.mp4" type="video/mp4" />
      </video>
      <div className="garba-overlay" aria-hidden="true" />
      <div className="garba-pattern" aria-hidden="true" />
      <img className="garba-watermark" src={watermarkLogo} alt="" aria-hidden="true" />
      <GarbaMusicControl ref={musicControlRef} />

      <div className="garba-content">
        <section className="garba-intro" aria-labelledby="garba-heading">
          <div className="festival-badge"><span>✦</span> NAVRATRI 2026 <span>✦</span></div>
          <p className="gujarati-title">રાસ રંગ</p>
          <h1 id="garba-heading">Dance to the rhythm.<br /><em>Celebrate together.</em></h1>
          <p className="garba-description">Join us for an unforgettable evening of Garba, music, vibrant colours and festive joy.</p>
          <div className="event-details">
            <div><span className="detail-icon" aria-hidden="true">◷</span><span><small>EVENT DATES</small><strong>11th–19th · 7 PM onwards</strong></span></div>
            <div><span className="detail-icon" aria-hidden="true">✦</span><span><small>ORGANISED BY</small><strong>Adv. Naresh Thakur &amp; Adv. Amar Upadhyay</strong></span></div>
            <div><span className="detail-icon" aria-hidden="true">⌖</span><span><small>VENUE</small><strong>Deen Dayal Upadhyay Playground, Behind Hiranandani, near Achija Restaurant, Plot 20, Sector 7, Kharghar</strong></span></div>
          </div>
        </section>

        <section className="garba-form-card" aria-labelledby="registration-title">
          <div className="form-heading">
            <span className="form-step">FREE ENTRY</span>
            <h2 id="registration-title">Register for Garba Night</h2>
            <p>Fill in your details and get your digital entry pass.</p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="garba-field">
              <label htmlFor="name">Full Name</label>
              <div className="input-wrap"><span aria-hidden="true">♙</span><input id="name" name="name" value={values.name} onChange={updateField} onFocus={startMusic} onClick={startMusic} placeholder="Enter your full name" autoComplete="name" aria-invalid={Boolean(errors.name)} /></div>
              {errors.name && <small role="alert">{errors.name}</small>}
            </div>

            <div className="garba-field">
              <label htmlFor="gender">Gender</label>
              <div className="input-wrap select-wrap"><span aria-hidden="true">◇</span><select id="gender" name="gender" value={values.gender} onChange={updateField} onFocus={startMusic} onClick={startMusic} aria-invalid={Boolean(errors.gender)}><option value="" disabled>Select your gender</option><option value="Male">Male</option><option value="Female">Female</option><option value="Others">Others</option></select></div>
              {errors.gender && <small role="alert">{errors.gender}</small>}
            </div>

            <div className="garba-field">
              <label htmlFor="phone">Mobile Number</label>
              <div className="input-wrap"><span aria-hidden="true">☎</span><input id="phone" name="phone" type="tel" value={values.phone} onChange={updateField} onFocus={startMusic} onClick={startMusic} placeholder="9876543210" autoComplete="tel-national" inputMode="numeric" maxLength={10} pattern="[0-9]{10}" aria-invalid={Boolean(errors.phone)} /></div>
              {errors.phone && <small role="alert">{errors.phone}</small>}
            </div>

            <div className="garba-field">
              <label>Profile Picture <span className="optional-label">(Optional)</span></label>
              <button className={`photo-upload${profilePreview ? ' has-preview' : ''}`} type="button" onClick={() => fileInputRef.current?.click()}>
                {profilePreview ? <img src={profilePreview} alt="Selected profile preview" /> : <span className="upload-icon" aria-hidden="true">＋</span>}
                <span className="upload-copy"><strong>{profileName || 'Choose your photo'}</strong><small>Optional · JPG, PNG or WEBP · Max 3 MB</small></span>
                <span className="browse-label">Browse</span>
              </button>
              <input ref={fileInputRef} className="sr-only" type="file" accept="image/png,image/jpeg,image/webp" onChange={handleProfileChange} tabIndex={-1} />
              {errors.profile && <small role="alert">{errors.profile}</small>}
            </div>

            {apiError && <p className="api-form-error" role="alert">{apiError}</p>}
            <button className="garba-submit" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Registering…' : 'Register & get entry pass'} {!isSubmitting && <span aria-hidden="true">→</span>}</button>
            <p className="privacy-note"><span aria-hidden="true">♢</span> Your information is safe and only used for event registration.</p>
            <p className="auth-switch">Already registered? <Link to={ROUTES.signIn}>Sign in with your mobile number</Link></p>
          </form>
        </section>
      </div>
      <p className="video-credit">Video by Rajani33 / Pexels</p>
    </main>
  )
}
