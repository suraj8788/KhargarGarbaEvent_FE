import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'

const musicStartTime = 19

export type GarbaMusicControlHandle = {
  play: () => Promise<void>
}

const GarbaMusicControl = forwardRef<GarbaMusicControlHandle>(function GarbaMusicControl(_, ref) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.volume = .28

    const startFromMusicCue = () => {
      audio.currentTime = musicStartTime
    }
    const replayFromMusicCue = () => {
      startFromMusicCue()
      void audio.play()
    }

    audio.addEventListener('loadedmetadata', startFromMusicCue)
    audio.addEventListener('ended', replayFromMusicCue)

    return () => {
      audio.removeEventListener('loadedmetadata', startFromMusicCue)
      audio.removeEventListener('ended', replayFromMusicCue)
      audio.pause()
    }
  }, [])

  async function playMusic() {
    const audio = audioRef.current
    if (!audio || !audio.paused) return

    try {
      if (audio.currentTime < musicStartTime) audio.currentTime = musicStartTime
      await audio.play()
      setIsPlaying(true)
    } catch {
      setIsPlaying(false)
    }
  }

  useImperativeHandle(ref, () => ({ play: playMusic }))

  async function toggleMusic() {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
      return
    }

    await playMusic()
  }

  return (
    <>
      <audio ref={audioRef} src="/kamariya-mitron.mp3" preload="metadata" />
      <button
        className={`garba-music-control${isPlaying ? ' is-playing' : ''}`}
        type="button"
        aria-label={isPlaying ? 'Turn background music off' : 'Turn background music on'}
        aria-pressed={isPlaying}
        onClick={() => void toggleMusic()}
      >
        <span className="garba-music-icon" aria-hidden="true">{isPlaying ? '♫' : '♪'}</span>
        <span>Music {isPlaying ? 'on' : 'off'}</span>
      </button>
    </>
  )
})

export default GarbaMusicControl
