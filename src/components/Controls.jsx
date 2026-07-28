function Controls({
  searchText,
  selectedCategory,
  categories,
  count,
  onSearchChange,
  onCategoryChange,
}) {
  return (
    <div className="dashboard-controls">
      <input
        type="text"
        className="search-input"
        placeholder="Search projects..."
        value={searchText}
        onChange={(event) => onSearchChange(event.target.value)}
      />
      <select
        value={selectedCategory}
        onChange={(event) => onCategoryChange(event.target.value)}
      >
        <option value="All">All categories</option>
        {categories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>
      <span className="project-count">{count} projects</span>
    </div>
  )
}

export default Controls
