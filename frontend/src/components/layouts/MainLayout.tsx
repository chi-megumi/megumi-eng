import AppHeader from '~/components/header/AppHeader'
import { Outlet } from 'react-router-dom'
import SideBar from '~/components/menu/Sidebar'
import '~/common/styles/components/MainLayout.scss'

const MainLayout = () => {
  return (
    <div className="main-layout flex justify-center gap-3">
      <SideBar />

      <div className="main-content-wrapper min-w-0 w-225">
        <AppHeader />
        <Outlet />

        <div className="">🌸 Lớp học cô Chuy 🌸</div>
      </div>
    </div>
  )
}

export default MainLayout
