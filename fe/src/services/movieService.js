export async function recommendMovie(formData) {
  const response = await fetch('/api/recommend-movie', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(formData),
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    const message =
      data.error || 'Could not get a movie recommendation. Please try again.'
    const error = new Error(message)
    error.missingFields = data.missingFields || []
    throw error
  }

  return data.movie
}
