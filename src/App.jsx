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
        'https://router.huggingface.co/hf-inference/models/stabilityai/stable-diffusion-xl-base-1.0',
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
        <div className="badge">🕹️ 8-BIT STUDIO</div>
        <h1 className="title">PIXEL DREAMS</h1>
        <p className="subtitle">
          ENTER PROMPT TO INITIALIZE GENERATION
        </p>
      </div>

      <div className="input-row">
        <input
          className="prompt-input"
          type="text"
          placeholder="e.g., A neon cyberpunk street, 16-bit pixel art..."
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
              [.] RENDERING
            </>
          ) : (
            <>
              [{'>'}] START
            </>
          )}
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      <div className={`image-area ${imageUrl ? 'has-image' : ''}`}>
        {loading && (
          <div className="spinner-wrapper">
            <div className="spinner" />
            <p className="spinner-text">PROCESSING...</p>
          </div>
        )}

        {imageUrl && !loading && (
          <img className="result-image" src={imageUrl} alt={prompt} />
        )}

        {!loading && !imageUrl && !error && (
          <div className="placeholder-text">
            <div className="placeholder-icon">👾</div>
            NO DATA LOADED
            <span>INSERT PROMPT TO START</span>
          </div>
        )}
      </div>

      <p className="hint">Powered by Hugging Face · Stable Diffusion XL Base 1.0</p>
    </div>
  )
}

export default App
