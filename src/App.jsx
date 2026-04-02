import { useState } from 'react'
import './App.css'

function App() {
  const [prompt, setPrompt] = useState('')
  const [imageUrl, setImageUrl] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    setLoading(true)
    setError(null)
    setImageUrl(null)

    try {
      const response = await fetch(
        '/api/hf/models/stabilityai/stable-diffusion-xl-base-1.0',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_HF_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ inputs: prompt }),
        }
      )

      if (!response.ok) {
        const errText = await response.text()
        throw new Error(`API error ${response.status}: ${errText}`)
      }

      const blob = await response.blob()
      if (!blob.type.startsWith('image/')) {
        const text = await blob.text()
        throw new Error(`Unexpected response: ${text}`)
      }

      const url = URL.createObjectURL(blob)
      setImageUrl(url)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !loading) handleGenerate()
  }

  return (
    <div className="container">
      <div className="header">
        <div className="badge">AI Image Generator</div>
        <h1 className="title">Turn words into images</h1>
        <p className="subtitle">
          Describe anything — Stable Diffusion XL brings it to life.
        </p>
      </div>

      <div className="input-row">
        <input
          className="prompt-input"
          type="text"
          placeholder="A cinematic shot of a neon city at night, 8K..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
          autoFocus
        />
        <button
          className="generate-btn"
          onClick={handleGenerate}
          disabled={loading || !prompt.trim()}
        >
          {loading ? (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 0.75s linear infinite' }}>
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              Generating
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
              Generate
            </>
          )}
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      <div className={`image-area ${imageUrl ? 'has-image' : ''}`}>
        {loading && (
          <div className="spinner-wrapper">
            <div className="spinner" />
            <p className="spinner-text">Generating your image…</p>
          </div>
        )}

        {imageUrl && !loading && (
          <img className="result-image" src={imageUrl} alt={prompt} />
        )}

        {!loading && !imageUrl && !error && (
          <div className="placeholder-text">
            <div className="placeholder-icon">🎨</div>
            Your image will appear here
            <span>Press Enter or click Generate</span>
          </div>
        )}
      </div>

      <p className="hint">Powered by Hugging Face · Stable Diffusion XL Base 1.0</p>
    </div>
  )
}

export default App
