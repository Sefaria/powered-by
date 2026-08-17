import { useEffect, useRef, useState } from 'react'

const SORT_OPTIONS = [
  { value: 'alphabetical', label: 'A-Z' },
  { value: 'newest', label: 'Year (Newest First)' },
  { value: 'oldest', label: 'Year (Oldest First)' },
]

function SortDropdown({ sortOption, onSortChange }) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return

    function handleOutsideClick(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [isOpen])

  const activeOption = SORT_OPTIONS.find((option) => option.value === sortOption)

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
