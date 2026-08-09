import { Modal } from '~/components/modal/Modal'
import LoginForm from '~/components/form/login'

export interface AuthModalProps {
  open: boolean
  onClose: () => void
  formType: 'login' | 'register'
}

const AuthModal = ({ open, onClose, formType }: AuthModalProps) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      size="md"
      title={formType === 'login' ? 'Đăng nhập' : 'Đăng ký'}
      hideHeader={false}
    >
      <LoginForm />
    </Modal>
  )
}

export default AuthModal
{
  /* <div className="auth-modal__content">
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            Signup fields
            {!isLogin && (
              <InputBase
                label="Họ tên"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Nhập họ tên"
                required
              />
            )}

            <InputBase
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Nhập email"
              type="email"
              required
            />

            <InputBase
              label="Mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu"
              type="password"
              required
            />

            {!isLogin && (
              <InputBase
                label="Xác nhận mật khẩu"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Xác nhận lại mật khẩu"
                type="password"
                required
              />
            )}

            Error message
            {error && <div className="text-red-500 text-sm text-center">{error}</div>}

            Submit button
            <Button type="submit" variant="primary" size="md" fullWidth>
              {isLogin ? 'Đăng nhập' : 'Đăng ký'}
            </Button>

            Switch mode
            <div className="text-center text-sm text-gray-600">
              {isLogin ? (
                <>
                  Chưa có tài khoản?{' '}
                  <button
                    type="button"
                    onClick={switchMode}
                    className="text-primary hover:underline font-medium"
                  >
                    Đăng ký ngay
                  </button>
                </>
              ) : (
                <>
                  Đã có tài khoản?{' '}
                  <button
                    type="button"
                    onClick={switchMode}
                    className="text-primary hover:underline font-medium"
                  >
                    Đăng nhập
                  </button>
                </>
              )}
            </div>
          </div>
        </form>
      </div> */
}
