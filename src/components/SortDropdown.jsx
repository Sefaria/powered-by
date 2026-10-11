import { useEffect, useRef, useState } from 'react'
import { SORT_ALPHABETICAL, SORT_NEWEST, SORT_OLDEST } from '../utils/sortProjects.js'

const SORT_OPTIONS = [
  { value: SORT_ALPHABETICAL, label: 'A-Z' },
  { value: SORT_NEWEST, label: 'Year (Newest First)' },
  { value: SORT_OLDEST, label: 'Year (Oldest First)' },
]

function SortDropdown({ sortOption, onSortChange }) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)

  // Only listen for outside clicks / Escape while the panel is actually open,
  // so these listeners aren't attached to the document for the component's whole lifetime.
  useEffect(() => {
    if (!isOpen) return

    function handleOutsideClick(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  // Fall back to the first option if sortOption is unset or doesn't match a known value.
  const activeOption = SORT_OPTIONS.find((option) => option.value === sortOption) ?? SORT_OPTIONS[0]

  function handleOptionClick(value) {
    onSortChange(value)
    setIsOpen(false)
  }

  return (
    <div className="sort-dropdown" ref={containerRef}>
      <button
        type="button"
        className="sort-dropdown-button"
        onClick={() => setIsOpen((current) => !current)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span aria-hidden="true">↕</span>
        {activeOption.label}
        <span aria-hidden="true">{isOpen ? '︿' : '⌄'}</span>
      </button>
      {isOpen && (
        <div className="sort-dropdown-panel">
          {SORT_OPTIONS.map((option) => (
            <button
              type="button"
              key={option.value}
              className="sort-dropdown-option"
              onClick={() => handleOptionClick(option.value)}
            >
              <span className="sort-dropdown-check" aria-hidden="true">
                {option.value === sortOption ? '✓' : ''}
              </span>
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default SortDropdown
