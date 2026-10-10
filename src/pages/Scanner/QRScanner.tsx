import { useEffect, useRef, useState } from 'react'
import type { IScannerControls } from '@zxing/browser'
import { Navigate, useNavigate } from 'react-router'
import { getSignedInUser } from '../../api/userSession'
import watermarkLogo from '../../assets/images/logo.jpeg'
import GarbaMusicControl from '../../components/common/GarbaMusicControl'
import { ROUTES } from '../../constants/routes'

export default function QRScanner() {
  const navigate = useNavigate()
  const videoRef = useRef<HTMLVideoElement>(null)
  const scannerControlsRef = useRef<IScannerControls | null>(null)
  const cameraSessionRef = useRef(0)
  const hasHandledScanRef = useRef(false)
  const signedInUser = getSignedInUser()
  const [isScanning, setIsScanning] = useState(false)
  const [isStarting, setIsStarting] = useState(false)
  const [error, setError] = useState('')

  function stopCamera() {
    cameraSessionRef.current += 1
    scannerControlsRef.current?.stop()
    scannerControlsRef.current = null
    const stream = videoRef.current?.srcObject
    if (stream instanceof MediaStream) stream.getTracks().forEach((track) => track.stop())
    if (videoRef.current) videoRef.current.srcObject = null
    setIsStarting(false)
    setIsScanning(false)
  }

  function openVerification(scannedValue: string) {
    if (hasHandledScanRef.current) return

    const trimmedValue = scannedValue.trim()
    if (!trimmedValue) return

    hasHandledScanRef.current = true

    let qrValue = trimmedValue
    try {
      const scannedUrl = new URL(trimmedValue)
      qrValue = scannedUrl.searchParams.get('qrValue')?.trim() || trimmedValue
    } catch {
      // A raw value such as "user:123" can be verified directly.
    }

    stopCamera()
    navigate(`${ROUTES.entry}?qrValue=${encodeURIComponent(qrValue)}`)
  }

  async function startCamera() {
    setError('')
    hasHandledScanRef.current = false
    if (!navigator.mediaDevices?.getUserMedia) {
      setError('Camera access requires a supported browser and a secure HTTPS connection.')
      return
    }
    if (!videoRef.current) return

    const cameraSession = cameraSessionRef.current + 1
    cameraSessionRef.current = cameraSession
    setIsStarting(true)
    try {
      const { BrowserQRCodeReader } = await import('@zxing/browser')
      const codeReader = new BrowserQRCodeReader(undefined, {
        delayBetweenScanAttempts: 120,
        delayBetweenScanSuccess: 500,
      })
      const controls = await codeReader.decodeFromConstraints(
        { video: { facingMode: { ideal: 'environment' } }, audio: false },
        videoRef.current,
        (result, _scanError, activeControls) => {
          if (!result || hasHandledScanRef.current) return
          scannerControlsRef.current = activeControls
          openVerification(result.getText())
        },
      )

      if (cameraSessionRef.current !== cameraSession) {
        controls.stop()
        return
      }

      scannerControlsRef.current = controls
      setIsStarting(false)
      setIsScanning(true)
    } catch (cameraError) {
      if (cameraSessionRef.current !== cameraSession) return
      stopCamera()
      if (cameraError instanceof DOMException && cameraError.name === 'NotAllowedError') {
        setError('Camera permission was denied. Allow camera access in your browser settings and try again.')
      } else if (cameraError instanceof DOMException && cameraError.name === 'NotFoundError') {
        setError('No camera was found on this device.')
      } else {
        setError('We could not start the camera. Close other camera apps and try again.')
      }
    }
  }

  useEffect(() => () => {
    cameraSessionRef.current += 1
    scannerControlsRef.current?.stop()
    const stream = videoRef.current?.srcObject
    if (stream instanceof MediaStream) stream.getTracks().forEach((track) => track.stop())
  }, [])

  if (signedInUser?.role !== 'SCANNER') {
    return <Navigate to={ROUTES.signIn} replace />
  }

  return (
    <main className="garba-registration scanner-page">
      <video className="garba-video" autoPlay muted loop playsInline aria-hidden="true">
        <source src="/garba-background.mp4" type="video/mp4" />
      </video>
      <div className="garba-overlay" aria-hidden="true" />
      <div className="garba-pattern" aria-hidden="true" />
      <img className="garba-watermark" src={watermarkLogo} alt="" aria-hidden="true" />
      <GarbaMusicControl />

      <div className="garba-content scanner-content">
        <section className="garba-intro" aria-labelledby="scanner-heading">
          <div className="festival-badge"><span>✦</span> ENTRY VERIFICATION <span>✦</span></div>
          <p className="gujarati-title">સ્કેન કરો</p>
          <h1 id="scanner-heading">Scan the pass.<br /><em>Join the celebration.</em></h1>
          <p className="garba-description">Place the event QR code inside the camera frame to verify entry instantly.</p>
        </section>

        <section className="garba-form-card scanner-card" aria-labelledby="scanner-card-title">
          <div className="form-heading scanner-heading">
            <span className="form-step">QR SCANNER</span>
            <h2 id="scanner-card-title">Verify event entry</h2>
            <p>Camera access is used only while scanning.</p>
          </div>

          <div className={`scanner-view${isScanning ? ' is-active' : ''}`}>
            <video ref={videoRef} muted playsInline aria-label="QR scanner camera preview" />
            {!isScanning && <div className="scanner-placeholder"><span aria-hidden="true">⌗</span><p>Camera is off</p></div>}
            <div className="scanner-corners" aria-hidden="true" />
          </div>

          <button
            className="garba-submit scanner-action"
            type="button"
            disabled={isStarting}
            onClick={isScanning ? stopCamera : () => void startCamera()}
          >
            {isStarting ? 'Opening camera…' : isScanning ? 'Stop camera' : 'Open camera'}
            {!isStarting && <span aria-hidden="true">{isScanning ? '■' : '⌁'}</span>}
          </button>

          {error && <p className="api-form-error scanner-error" role="alert">{error}</p>}
        </section>
      </div>
    </main>
  )
}
