function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null

  return (
    <nav className="pagination" aria-label="Project pages">
      <button
        type="button"
        onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
        aria-disabled={currentPage === 1}
      >
        Previous
      </button>
      <span className="pagination-status" aria-live="polite">
        Page {currentPage} of {totalPages}
      </span>
      <button
        type="button"
        onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
        aria-disabled={currentPage === totalPages}
      >
        Next
      </button>
    </nav>
  )
}

export default Pagination
