import { Button } from '~/components/button/Button'
import '~/common/styles/components/Sidebar.scss'
import { useState } from 'react'
import MenuTabs from '~/components/menu/MenuTabs'

const SideBar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev)
  const closeSidebar = () => setIsSidebarOpen(false)

  const onLogout = () => {
    console.log('Logout')
  }
  return (
    <div className="sidebar-wrapper">
      <button
        className={`mobile-menu-toggle ${isSidebarOpen ? 'is-active' : ''}`}
        onClick={toggleSidebar}
        aria-label="Toggle menu"
      >
        <span className="hamburger-line" />
        <span className="hamburger-line" />
        <span className="hamburger-line" />
      </button>

      <div
        className={`sidebar-overlay ${isSidebarOpen ? 'is-visible' : ''}`}
        onClick={closeSidebar}
      ></div>

      <div
        className={`sidebar-container w-62.5 fixed top-1/2 -translate-y-1/2 left-4 z-50 rounded-2xl ${isSidebarOpen ? 'is-open' : ''}`}
      >
        <div
          className={[
            'shadow-[0_4px_15px_rgba(99,102,241,0.2)] h-[calc(100vh-100px)] rounded-2xl p-4 flex flex-col backdrop-blur-md backdrop-saturate-180',
            isSidebarOpen ? 'bg-white' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <div>
            <MenuTabs />
          </div>

          <div className="mt-auto">
            <Button variant="primary" size="sm" onClick={onLogout} fullWidth>
              Đăng xuất
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SideBar
