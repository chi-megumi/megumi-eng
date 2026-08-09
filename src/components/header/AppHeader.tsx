// import { Button } from '../../components/button/Button'
import './AppHeader.scss'

const AppHeader = () => {
  const onLogin = () => {}

  const onRegister = () => {}
  return (
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
            {/* <Button variant="primary" size="sm" onClick={onLogin}>
              Đăng nhập
            </Button>

            <Button variant="secondary" size="sm" onClick={onRegister}>
              Đăng ký
            </Button> */}
          </div>
        </div>
      </div>
    </header>
  )
}

export default AppHeader
