import { useCallback, useEffect, useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'

function MovieImageCarousel({ images = [], title }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: images.length > 1 })
  const [selectedIndex, setSelectedIndex] = useState(0)

  const scrollPrev = useCallback(() => {
    emblaApi?.scrollPrev()
  }, [emblaApi])

  const scrollNext = useCallback(() => {
    emblaApi?.scrollNext()
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) {
      return
    }

    const updateSelectedIndex = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap())
    }

    updateSelectedIndex()
    emblaApi.on('select', updateSelectedIndex)
    emblaApi.on('reInit', updateSelectedIndex)

    return () => {
      emblaApi.off('select', updateSelectedIndex)
      emblaApi.off('reInit', updateSelectedIndex)
    }
  }, [emblaApi])

  if (images.length === 0) {
    return null
  }

  return (
    <div className="movie-carousel" aria-label={`${title} images`}>
      <div className="movie-carousel__viewport" ref={emblaRef}>
        <div className="movie-carousel__container">
          {images.map((image, index) => (
            <div className="movie-carousel__slide" key={image.url}>
              <img
                src={image.url}
                alt={`${title} ${image.type} ${index + 1}`}
                loading={index === 0 ? 'eager' : 'lazy'}
              />
            </div>
          ))}
        </div>
      </div>

      {images.length > 1 && (
        <div className="movie-carousel__controls">
          <button type="button" onClick={scrollPrev} aria-label="Previous image">
            ‹
          </button>
          <span>
            {selectedIndex + 1} / {images.length}
          </span>
          <button type="button" onClick={scrollNext} aria-label="Next image">
            ›
          </button>
        </div>
      )}
    </div>
  )
}

export default MovieImageCarousel
