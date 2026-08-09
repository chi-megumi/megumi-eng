import AuthModal from '~/components/modal/auth/AuthModal'
import { Button } from '../../components/button/Button'
import '~/common/styles/components/AppHeader.scss'
import useAuthStore from '~/common/stores/authStore'

const AppHeader = () => {
  const authModalStatus = useAuthStore((s) => s.authModalStatus)
  const showLogin = useAuthStore((s) => s.showLogin)
  const showRegister = useAuthStore((s) => s.showRegister)
  const closeModal = useAuthStore((s) => s.closeModal)
  return (
    <>
      <header className="app-header">
        <div className="app-header__inner">
          {/* Logo / Brand */}
          <div className="app-header__brand">
            <span className="app-header__logo">✨</span>
            <span className="app-header__name">Megumi</span>
            <span className="app-header__dot" />
            <span className="app-header__tagline">Eng</span>
          </div>

          <p className="app-header__invite">Đăng nhập để học cùng mình 🌸</p>

          {/* CTA */}
          <div className="app-header__cta">
            <div className="app-header__actions">
              <Button variant="primary" size="sm" onClick={showLogin}>
                Đăng nhập
              </Button>

              <Button variant="secondary" size="sm" onClick={showRegister}>
                Đăng ký
              </Button>
            </div>
          </div>
        </div>
      </header>

      <AuthModal
        open={authModalStatus.isOpen}
        formType={authModalStatus.type}
        onClose={closeModal}
      />
    </>
  )
}

export default AppHeader
