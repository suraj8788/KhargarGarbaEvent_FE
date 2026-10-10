import { useEffect, useRef } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Link, Navigate, useSearchParams } from 'react-router'
import { getSignedInUser } from '../../api/userSession'
import { ROUTES } from '../../constants/routes'
import { entryApi } from '../../services/entry.api'

export default function EntryConfirmation() {
  const [searchParams] = useSearchParams()
  const qrValue = searchParams.get('qrValue')?.trim() ?? ''
  const scanner = getSignedInUser()
  const scannerUserId = scanner?.role === 'SCANNER' ? scanner.id : ''
  const hasSubmitted = useRef(false)
  const { mutate, data, isPending, isError } = useMutation({
    mutationFn: (value: string) => entryApi.scan(value, scannerUserId),
  })

  useEffect(() => {
    if (!qrValue || !scannerUserId || hasSubmitted.current) return
    hasSubmitted.current = true
    mutate(qrValue)
  }, [mutate, qrValue, scannerUserId])

  if (!scannerUserId) {
    return <Navigate to={ROUTES.signIn} replace />
  }

  if (!qrValue) {
    return (
      <main className="page centered-page">
        <section className="entry-result-card entry-result-error" role="dialog" aria-modal="true" aria-live="assertive">
          <span className="entry-result-icon" aria-hidden="true">!</span>
          <h1>Entry failed. Please try again.</h1>
          <p>This QR code does not contain a valid entry value.</p>
          <Link className="primary-button link-button" to={ROUTES.scanner}>Back to Scanner</Link>
        </section>
      </main>
    )
  }

  if (isError) {
    return (
      <main className="page centered-page">
        <section className="entry-result-card entry-result-error" role="dialog" aria-modal="true" aria-live="assertive">
          <span className="entry-result-icon" aria-hidden="true">!</span>
          <h1>Entry failed. Please try again.</h1>
          <Link className="primary-button link-button" to={ROUTES.scanner}>Back to Scanner</Link>
        </section>
      </main>
    )
  }

  if (isPending || !data) {
    return (
      <main className="page centered-page">
        <section className="entry-result-card" role="dialog" aria-modal="true" aria-live="polite">
          <span className="entry-result-icon entry-result-loading" aria-hidden="true">⌛</span>
          <h1>Processing entry…</h1>
          <p>Please wait while the participant's pass is verified.</p>
        </section>
      </main>
    )
  }

  const isDuplicate = data.status === 'already_entered'

  return (
    <main className="page centered-page">
      <section
        className={`entry-result-card${isDuplicate ? ' entry-result-error' : ' entry-result-success'}`}
        role="dialog"
        aria-modal="true"
        aria-live="assertive"
      >
        <span className="entry-result-icon" aria-hidden="true">{isDuplicate ? '!' : '✓'}</span>
        <span className="entry-pass-kicker">{isDuplicate ? 'DUPLICATE ENTRY' : 'ENTRY VERIFIED'}</span>
        <h1>
          {isDuplicate
            ? 'Duplicate entry! This participant has already checked in today.'
            : 'Entry recorded successfully.'}
        </h1>
        <p>{data.user.fullName}</p>
        <Link className="primary-button link-button" to={ROUTES.scanner}>Back to Scanner</Link>
      </section>
    </main>
  )
}
