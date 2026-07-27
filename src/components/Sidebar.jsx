function Sidebar({ tabs, activeTab, onSelectTab }) {
  return (
    <nav className="sidebar">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={tab.id === activeTab ? 'sidebar-tab active' : 'sidebar-tab'}
          onClick={() => onSelectTab(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  )
}

export default Sidebar
