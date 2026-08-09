// import SideBar from '~/components/menu/Sidebar'
import AppHeader from '~/components/header/AppHeader'
import { Outlet } from 'react-router-dom'

const MainLayout = () => {
  return (
    <div className="flex justify-center gap-3">
      {/* <div className="w-62.5 fixed top-1/2 -translate-y-1/2 left-4">
        <SideBar />
      </div> */}

      <div className="w-225 overflow-x-hidden">
        <AppHeader />
        <Outlet />
      </div>
    </div>
  )
}

export default MainLayout
