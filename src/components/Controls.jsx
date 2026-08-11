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
      <div className="dashboard-controls-row">
        <input
          type="text"
          className="search-input"
          placeholder="Search by project or description"
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
      </div>
      <span className="project-count">{count} projects</span>
    </div>
  )
}

export default Controls
