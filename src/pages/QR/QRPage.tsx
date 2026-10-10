import { useEffect, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import QRCode from 'qrcode'
import { Link, useParams } from 'react-router'
import watermarkLogo from '../../assets/images/logo.jpeg'
import { queryKeys } from '../../constants/queryKeys'
import { ROUTES } from '../../constants/routes'
import { userApi } from '../../services/user.api'

export default function QRPage() {
  const { userId = '' } = useParams<{ userId: string }>()
  const [qrImage, setQrImage] = useState('')
  const {
    mutate: downloadPass,
    isPending: isDownloadingPass,
    isError: isDownloadError,
  } = useMutation({
    mutationFn: (userId: string) => userApi.downloadEventPass(userId),
    onSuccess: (pdf, userId) => {
      const downloadUrl = URL.createObjectURL(pdf)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = `event-pass-${userId}.pdf`
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1_000)
    },
  })
  const {
    data: user,
    isPending: isUserLoading,
    isError: isUserError,
    refetch,
  } = useQuery({
    queryKey: queryKeys.user(userId),
    queryFn: () => userApi.getUser(userId),
    enabled: Boolean(userId),
    refetchOnMount: 'always',
    staleTime: 0,
  })

  useEffect(() => {
    if (!user) return
    const publicAppUrl = (import.meta.env.VITE_PUBLIC_APP_URL || window.location.origin).replace(/\/$/, '')
    const qrValue = `user:${user.id}`
    const entryUrl = `${publicAppUrl}${ROUTES.entry}?qrValue=${encodeURIComponent(qrValue)}`
    void QRCode.toDataURL(entryUrl, { width: 360, margin: 2, color: { dark: '#201a3d', light: '#ffffff' } })
      .then(setQrImage)
  }, [user])

  if (!userId) {
    return (
      <main className="page centered-page">
        <section className="empty-card">
          <span className="empty-icon">?</span>
          <h1>No entry pass yet</h1>
          <p>Complete your registration first to generate your event entry pass.</p>
          <Link className="primary-button link-button" to={ROUTES.registration}>Register now</Link>
        </section>
      </main>
    )
  }

  if (isUserLoading) {
    return (
      <main className="page centered-page">
        <section className="empty-card" aria-live="polite">
          <span className="empty-icon">⌛</span>
          <h1>Preparing your pass</h1>
          <p>We’re fetching your registration details.</p>
        </section>
      </main>
    )
  }

  if (isUserError || !user) {
    return (
      <main className="page centered-page">
        <section className="empty-card">
          <span className="empty-icon">!</span>
          <h1>Couldn’t load your pass</h1>
          <p>We could not fetch your registration details. Please check your connection and try again.</p>
          <button className="primary-button" type="button" onClick={() => void refetch()}>Try again</button>
        </section>
      </main>
    )
  }

  return (
    <main className="page entry-pass-page">
      <img className="entry-pass-watermark" src={watermarkLogo} alt="" aria-hidden="true" />
      <section className="entry-pass-intro" aria-labelledby="entry-pass-title">
        <span className="entry-pass-kicker">REGISTRATION COMPLETE</span>
        <h1 id="entry-pass-title">Your event entry pass</h1>
        <p>Keep this QR code ready and present it at the entrance for verification.</p>
      </section>

      <section className="ticket entry-pass-card" aria-label={`Event entry pass for ${user.fullName}`}>
        <div className="ticket-top"><span>KHARGHAR NAVRATRI MAHOTSAV</span><span>ENTRY PASS</span></div>
        <div className="qr-frame">
          {qrImage ? <img src={qrImage} alt={`Entry verification QR code for ${user.fullName}`} /> : <div className="qr-loading">Generating your entry pass…</div>}
        </div>
        <h2>{user.fullName}</h2>
        <div className="ticket-cut" aria-hidden="true" />
        <small>Present this QR code at the event entrance</small>
        <button
          className="primary-button download-pass-button"
          type="button"
          disabled={isDownloadingPass}
          onClick={() => downloadPass(user.id)}
        >
          <span aria-hidden="true">↓</span>
          {isDownloadingPass ? 'Downloading…' : 'Download event pass'}
        </button>
        {isDownloadError && <p className="download-pass-error" role="alert">Could not download the pass. Please try again.</p>}
      </section>

      <section className="event-highlights" aria-labelledby="event-highlights-title">
        <span className="eyebrow">WHAT AWAITS YOU</span>
        <h2 id="event-highlights-title">Event highlights</h2>
        <ul>
          <li><span aria-hidden="true">♫</span>Live Orchestra</li>
          <li><span aria-hidden="true">♬</span>Live Bollywood Singer</li>
          <li><span aria-hidden="true">♨</span>Food Stalls</li>
          <li><span aria-hidden="true">◇</span>Shopping Stalls</li>
          <li><span aria-hidden="true">★</span>Kids Play Area</li>
          <li><span aria-hidden="true">◆</span>Bouncers &amp; Security</li>
          <li><span aria-hidden="true">◉</span>CCTV Surveillance</li>
        </ul>
      </section>
    </main>
  )
}
