import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Navigate } from 'react-router'
import { getApiErrorMessage } from '../../api/axiosInstance'
import { getSignedInUser } from '../../api/userSession'
import { ROUTES } from '../../constants/routes'
import { luckyDrawApi, type LuckyDrawParticipant } from '../../services/luckyDraw.api'

const wheelColors = ['#741f46', '#d94f35', '#3e205d', '#c88926']
const wheelSymbols = ['✦', '✧', '✦', '✧', '✦', '✧', '✦', '✧', '✦', '✧', '✦', '✧']
const wheelLights = Array.from({ length: 24 })
const spinDurationMs = 15000
const winningMusicStartTime = 19
const dummyProfilePicture = '/dummy-profile.svg'
const confettiColors = ['#ff5b38', '#ffd76a', '#7259d9', '#45c98b', '#ff8dcb']
const confettiPieces = Array.from({ length: 42 }, (_, index) => ({
  left: `${(index * 37) % 100}%`,
  delay: `${(index % 9) * -0.23}s`,
  duration: `${2.8 + (index % 5) * 0.35}s`,
  color: confettiColors[index % confettiColors.length],
  rotation: `${(index * 47) % 360}deg`,
}))

function createWheelBackground(segmentCount: number) {
  const angle = 360 / segmentCount
  const stops = Array.from({ length: segmentCount }, (_, index) => {
    const color = wheelColors[index % wheelColors.length]
    return `${color} ${index * angle}deg ${(index + 1) * angle}deg`
  })
  return `conic-gradient(from -${angle / 2}deg, ${stops.join(', ')})`
}

export default function SpinWheel() {
  const admin = getSignedInUser()
  const queryClient = useQueryClient()
  const revealTimerRef = useRef<number | null>(null)
  const celebrationAudioRef = useRef<HTMLAudioElement>(null)
  const [rotation, setRotation] = useState(0)
  const [winner, setWinner] = useState<LuckyDrawParticipant | null>(null)
  const [isSpinning, setIsSpinning] = useState(false)
  const [isMusicPlaying, setIsMusicPlaying] = useState(false)
  const [drawError, setDrawError] = useState('')

  const eligibleQuery = useQuery({
    queryKey: ['lucky-draw-eligible', admin?.id],
    queryFn: () => luckyDrawApi.getEligible(admin!.id),
    enabled: admin?.role === 'ADMIN',
  })

  const eligibleCount = eligibleQuery.data?.eligibleCount ?? 0
  const segmentAngle = 360 / wheelSymbols.length

  const spinMutation = useMutation({
    mutationFn: () => luckyDrawApi.spin(admin!.id),
    onSuccess: (result) => {
      const winnerStopIndex = Array.from(result.winner.id).reduce(
        (total, character) => total + character.charCodeAt(0),
        0,
      ) % wheelSymbols.length
      const desiredRotation = (360 - winnerStopIndex * segmentAngle) % 360

      setRotation((currentRotation) => (
        currentRotation
        + 1800
        + ((desiredRotation - (currentRotation % 360) + 360) % 360)
      ))

      revealTimerRef.current = window.setTimeout(() => {
        setWinner(result.winner)
        setIsSpinning(false)
        void queryClient.invalidateQueries({ queryKey: ['lucky-draw-eligible', admin?.id] })
      }, spinDurationMs)
    },
    onError: (error) => {
      setDrawError(getApiErrorMessage(error, 'Lucky draw'))
      setIsSpinning(false)
      stopCelebrationMusic()
    },
  })

  useEffect(() => () => {
    if (revealTimerRef.current !== null) window.clearTimeout(revealTimerRef.current)
    celebrationAudioRef.current?.pause()
  }, [])

  useEffect(() => {
    if (!winner) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeWinner()
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [winner])

  async function playCelebrationMusic() {
    const audio = celebrationAudioRef.current
    if (!audio) return
    audio.volume = .32
    if (audio.readyState >= 1) audio.currentTime = winningMusicStartTime

    try {
      await audio.play()
      setIsMusicPlaying(true)
    } catch {
      setIsMusicPlaying(false)
    }
  }

  function stopCelebrationMusic() {
    const audio = celebrationAudioRef.current
    if (!audio) return
    audio.pause()
    if (audio.readyState >= 1) audio.currentTime = winningMusicStartTime
    setIsMusicPlaying(false)
  }

  function closeWinner() {
    setWinner(null)
    stopCelebrationMusic()
  }

  function toggleCelebrationMusic() {
    if (isMusicPlaying) {
      celebrationAudioRef.current?.pause()
      setIsMusicPlaying(false)
      return
    }
    void playCelebrationMusic()
  }

  function spin() {
    if (isSpinning || !eligibleCount) return
    setWinner(null)
    setDrawError('')
    setIsSpinning(true)
    void playCelebrationMusic()
    spinMutation.mutate()
  }

  if (admin?.role !== 'ADMIN') {
    return <Navigate to={ROUTES.signIn} replace />
  }

  const queryError = eligibleQuery.error
    ? getApiErrorMessage(eligibleQuery.error, 'Loading lucky draw users')
    : ''
  const isCelebrating = isSpinning || Boolean(winner)

  return (
    <main className={`page spin-page${isCelebrating ? ' is-celebrating' : ''}`}>
      {isCelebrating && (
        <video className="spin-celebration-video" autoPlay muted loop playsInline aria-hidden="true">
          <source src="/garba-background.mp4" type="video/mp4" />
        </video>
      )}
      <audio ref={celebrationAudioRef} src="/kamariya-mitron.mp3" preload="metadata" />
      {isCelebrating && (
        <button
          className={`garba-music-control${isMusicPlaying ? ' is-playing' : ''}`}
          type="button"
          aria-label={isMusicPlaying ? 'Pause celebration music' : 'Play celebration music'}
          aria-pressed={isMusicPlaying}
          onClick={toggleCelebrationMusic}
        >
          <span className="garba-music-icon" aria-hidden="true">{isMusicPlaying ? '♫' : '♪'}</span>
          <span>Celebration {isMusicPlaying ? 'on' : 'off'}</span>
        </button>
      )}
      <section className="spin-copy">
        <span className="eyebrow">EVENT LUCKY DRAW</span>
        <h1>Winner of the Day</h1>
        <p>Spin the wheel and reveal the next lucky winner.</p>
        {(queryError || drawError) && <p className="lucky-draw-error" role="alert">{queryError || drawError}</p>}
        <button
          className="primary-button spin-action"
          type="button"
          onClick={spin}
          disabled={eligibleQuery.isLoading || isSpinning || !eligibleCount}
        >
          {isSpinning ? 'Selecting winner…' : winner || eligibleQuery.data?.latestWinner ? 'Spin again' : 'Spin for lucky user'}
        </button>
      </section>

      <section className="wheel-stage" aria-label="Lucky user wheel">
        <div className="wheel-pointer" aria-hidden="true" />
        <div
          className="wheel"
          style={{
            '--segment-angle': `${segmentAngle}deg`,
            background: createWheelBackground(wheelSymbols.length),
            transform: `rotate(${rotation}deg)`,
            transitionDuration: `${spinDurationMs}ms`,
          } as CSSProperties}
        >
          {wheelSymbols.map((symbol, index) => (
            <span
              key={`${symbol}-${index}`}
              style={{ '--prize-angle': `${index * segmentAngle}deg` } as CSSProperties}
              aria-hidden="true"
            >
              {symbol}
            </span>
          ))}
          {wheelLights.map((_, index) => (
            <i
              className="wheel-light"
              key={index}
              style={{ '--light-angle': `${index * (360 / wheelLights.length)}deg` } as CSSProperties}
              aria-hidden="true"
            />
          ))}
          <div className="wheel-hub"><b>✦</b><span>LUCKY</span><small>DRAW</small></div>
        </div>
      </section>

      {winner && (
        <div className="winner-popup-layer" role="dialog" aria-modal="true" aria-labelledby="winner-popup-title">
          <div className="winner-celebration" aria-hidden="true">
            <i className="winner-firework firework-one" />
            <i className="winner-firework firework-two" />
            <i className="winner-firework firework-three" />
            {confettiPieces.map((piece, index) => (
              <i
                className="winner-confetti"
                key={index}
                style={{
                  '--confetti-left': piece.left,
                  '--confetti-delay': piece.delay,
                  '--confetti-duration': piece.duration,
                  '--confetti-color': piece.color,
                  '--confetti-rotation': piece.rotation,
                } as CSSProperties}
              />
            ))}
          </div>
          <section className="winner-popup-card">
            <div className="winner-crown" aria-hidden="true">♛</div>
            <img
              className="winner-profile-picture"
              src={winner.profilePicture || dummyProfilePicture}
              alt={`${winner.fullName}'s profile`}
              onError={(event) => {
                event.currentTarget.onerror = null
                event.currentTarget.src = dummyProfilePicture
              }}
            />
            <span className="winner-popup-kicker">Congratulations!</span>
            <h2 id="winner-popup-title">Lucky Winner</h2>
            <strong>{winner.fullName}</strong>
            <a href={`tel:${winner.mobileNumber}`}>{winner.mobileNumber}</a>
            <p>You are one of today’s lucky draw winners!</p>
            <button className="primary-button" type="button" onClick={closeWinner}>
              Continue
            </button>
          </section>
        </div>
      )}
    </main>
  )
}
