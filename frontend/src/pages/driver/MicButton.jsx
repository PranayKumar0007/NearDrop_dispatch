import { useState, useCallback } from 'react'
import { Mic, MicOff } from 'lucide-react'
import clsx from 'clsx'
import { useVoice } from '../../hooks/useVoice'

const COMMAND_HINTS = [
  'Try: "mark as delivered"',
  'Try: "delivery failed"',
  'Try: "I have arrived"',
]

export default function MicButton({ onCommand, className }) {
  const [hint] = useState(COMMAND_HINTS[Math.floor(Math.random() * COMMAND_HINTS.length)])

  const handleResult = useCallback(transcript => {
    onCommand(transcript.toLowerCase())
  }, [onCommand])

  const { listening, supported, start, stop } = useVoice({ onResult: handleResult })
  const handlePress = () => listening ? stop() : start()

  return (
    <div className={clsx('flex flex-col items-center gap-4', className)}>
      <div className="relative flex items-center justify-center">
        {listening && (
          <>
            <div className="mic-ring" />
            <div className="mic-ring" />
            <div className="mic-ring" />
          </>
        )}

        <button
          id="mic-button"
          onPointerDown={handlePress}
          className="relative z-10 w-24 h-24 rounded-full flex items-center justify-center transition-all duration-200 active:scale-90"
          style={listening ? {
            background: '#0d7377',
            boxShadow: '0 8px 32px rgba(13,115,119,0.4)',
          } : {
            background: 'rgba(255,255,255,0.9)',
            border: '1.5px solid rgba(13,115,119,0.25)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          }}
        >
          {listening
            ? <MicOff className="w-9 h-9 text-white" />
            : <Mic    className="w-9 h-9" style={{ color: '#0d7377' }} />
          }
        </button>
      </div>

      <div className="text-center">
        <p
          className="text-sm font-semibold transition-colors"
          style={{ color: listening ? '#0d7377' : '#6b6b7b' }}
        >
          {listening ? 'Listening…' : 'Tap to speak'}
        </p>
        {!listening && (
          <p className="text-[11px] mt-0.5" style={{ color: '#9898a8' }}>{hint}</p>
        )}
      </div>

      {!supported && (
        <p
          className="text-xs px-3 py-1.5 rounded-lg"
          style={{ background: 'rgba(217,119,6,0.08)', color: '#d97706', border: '1px solid rgba(217,119,6,0.2)' }}
        >
          Voice not supported — use text input below
        </p>
      )}
    </div>
  )
}
