import { useState } from 'react'
import Title from './Title.jsx'
import Sidebar from './components/Sidebar.jsx'
import Dashboard from './components/Dashboard.jsx'
import ChartsAndAnalytics from './components/ChartsAndAnalytics.jsx'

const TABS = [
  { id: 'projects', label: 'Projects' },
  { id: 'charts', label: 'Charts and Analytics' },
]

function App() {
  const [activeTab, setActiveTab] = useState('projects')

  return (
    <>
      <Title />
      <div className="app-body">
        <Sidebar tabs={TABS} activeTab={activeTab} onSelectTab={setActiveTab} />
        <main className="tab-content">
          {activeTab === 'projects' && <Dashboard />}
          {activeTab === 'charts' && <ChartsAndAnalytics />}
        </main>
      </div>
    </>
  )
}

export default App
