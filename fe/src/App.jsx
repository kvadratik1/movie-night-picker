import { useState } from 'react'
import { recommendMovie } from './services/movieService'
import './App.css'

const initialForm = {
  mood: '',
  time: '',
  genre: '',
  people: '',
}

const fieldLabels = {
  mood: 'Mood',
  time: 'Available time',
  genre: 'Genre',
  people: 'Who is watching',
}

function App() {
  const [form, setForm] = useState(initialForm)
  const [movie, setMovie] = useState(null)
  const [errors, setErrors] = useState({})
  const [statusMessage, setStatusMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  function handleChange(event) {
    const { name, value } = event.target

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }))

    setErrors((currentErrors) => ({
      ...currentErrors,
      [name]: '',
    }))
  }

  function validateForm() {
    const nextErrors = {}

    for (const field in form) {
      if (!form[field].trim()) {
        nextErrors[field] = `${fieldLabels[field]} is required.`
      }
    }

    setErrors(nextErrors)

    const missingFields = Object.keys(nextErrors)

    if (missingFields.length > 0) {
      const missingFieldLabels = missingFields
        .map((field) => fieldLabels[field].toLowerCase())
        .join(', ')

      setStatusMessage(`Please add: ${missingFieldLabels}.`)
      return false
    }

    setStatusMessage('')
    return true
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setMovie(null)
    setStatusMessage('')

    try {
      const recommendation = await recommendMovie(form)
      setMovie(recommendation)
    } catch (error) {
      if (error.missingFields?.length > 0) {
        const nextErrors = Object.fromEntries(
          error.missingFields.map((field) => [
            field,
            `${fieldLabels[field] || field} is required.`,
          ]),
        )
        setErrors(nextErrors)
        setStatusMessage(
          `Please add: ${error.missingFields
            .map((field) => fieldLabels[field]?.toLowerCase() || field)
            .join(', ')}.`,
        )
      } else {
        setStatusMessage(error.message)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="app-shell">
      <section className="intro">
        <p className="eyebrow">Movie night picker</p>
        <h1>Find one movie that fits tonight.</h1>
        <p>
          Add the mood, runtime window, genre, and audience. The app will return
          one recommendation for the whole group.
        </p>
      </section>

      <section className="picker-panel" aria-labelledby="form-title">
        <form className="movie-form" onSubmit={handleSubmit} noValidate>
          <div className="form-heading">
            <h2 id="form-title">Tonight's setup</h2>
            <p>All fields are required.</p>
          </div>

          <label>
            <span>Mood</span>
            <input
              name="mood"
              value={form.mood}
              onChange={handleChange}
              placeholder="Cozy, tense, funny"
              aria-invalid={Boolean(errors.mood)}
            />
            {errors.mood && <small>{errors.mood}</small>}
          </label>

          <label>
            <span>Available time</span>
            <input
              name="time"
              value={form.time}
              onChange={handleChange}
              placeholder="90 minutes, 2 hours"
              aria-invalid={Boolean(errors.time)}
            />
            {errors.time && <small>{errors.time}</small>}
          </label>

          <label>
            <span>Genre</span>
            <input
              name="genre"
              value={form.genre}
              onChange={handleChange}
              placeholder="Comedy, thriller, sci-fi"
              aria-invalid={Boolean(errors.genre)}
            />
            {errors.genre && <small>{errors.genre}</small>}
          </label>

          <label>
            <span>Who is watching</span>
            <input
              name="people"
              value={form.people}
              onChange={handleChange}
              placeholder="Family, friends, date night"
              aria-invalid={Boolean(errors.people)}
            />
            {errors.people && <small>{errors.people}</small>}
          </label>

          {statusMessage && (
            <p className="status-message" role="alert">
              {statusMessage}
            </p>
          )}

          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Finding a movie...' : 'Get movie'}
          </button>
        </form>

        <aside className="recommendation" aria-live="polite">
          {movie ? (
            <>
              <p className="eyebrow">Recommendation</p>
              <h2>
                {movie.title}
                {movie.year ? <span> ({movie.year})</span> : null}
              </h2>
              {movie.genre && <p className="movie-genre">{movie.genre}</p>}
              {movie.reason && <p>{movie.reason}</p>}
            </>
          ) : (
            <>
              <p className="eyebrow">Ready when you are</p>
              <h2>Your movie will appear here.</h2>
              <p>
                Fill in the four details and submit the form to get a focused
                recommendation.
              </p>
            </>
          )}
        </aside>
      </section>
    </main>
  )
}

export default App
