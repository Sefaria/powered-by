function Pagination({ currentPage, totalPages, onPageChange }) {
  // Nothing to paginate: hide the control instead of rendering disabled arrows.
  if (totalPages <= 1) return null

  return (
    <nav className="pagination" aria-label="Project pages">
      <button
        type="button"
        // Guard prevents calling onPageChange with an out-of-range page when already on page 1.
        onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
        aria-disabled={currentPage === 1}
      >
        Previous
      </button>
      {/* aria-live announces page changes to screen readers without needing focus to move */}
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
