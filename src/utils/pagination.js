export function paginate(items, page, pageSize) {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize))
  const clampedPage = Math.min(Math.max(page, 1), totalPages)
  const start = (clampedPage - 1) * pageSize
  const pageItems = items.slice(start, start + pageSize)
  return { pageItems, totalPages }
}
