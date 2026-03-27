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

  const handleResult = useCallback((transcript) => {
    onCommand(transcript.toLowerCase())
  }, [onCommand])

  const { listening, supported, start, stop } = useVoice({ onResult: handleResult })

  const handlePress = () => {
    if (listening) stop()
    else start()
  }

  return (
    <div className={clsx('flex flex-col items-center gap-5', className)}>
      {/* Pulse rings */}
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
          className={clsx(
            'relative z-10 w-28 h-28 rounded-full flex items-center justify-center',
            'transition-all duration-300 active:scale-90',
            listening
              ? 'bg-teal-500 shadow-glow-teal-lg'
              : 'bg-navy-700 border-2 border-teal-500/50 hover:border-teal-400 hover:shadow-glow-teal',
          )}
        >
          {listening
            ? <MicOff className="w-11 h-11 text-navy-900" />
            : <Mic    className="w-11 h-11 text-teal-400"  />
          }
        </button>
      </div>

      <div className="text-center">
        <p className={clsx(
          'text-sm font-medium transition-colors',
          listening ? 'text-teal-300' : 'text-white/50',
        )}>
          {listening ? 'Listening...' : 'Tap to speak'}
        </p>
        {!listening && (
          <p className="text-xs text-white/30 mt-1">{hint}</p>
        )}
      </div>

      {!supported && (
        <p className="text-xs text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20">
          Voice not supported — use text input below
        </p>
      )}
    </div>
  )
}
