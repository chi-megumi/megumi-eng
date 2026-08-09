import FormItem from '~/components/form/formItem'
import InputControl from '~/components/form/input/InputControler'
import { useForm } from 'react-hook-form'
import { Button } from '~/components/button/Button'
import useAuthStore from '~/common/stores/authStore'

const LoginForm = () => {
  const showRegister = useAuthStore((s) => s.showRegister)

  const {
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  })

  return (
    <form className="flex flex-col gap-16">
      <div className="flex flex-col gap-4">
        <FormItem label="Email">
          <InputControl
            name="email"
            control={control}
            label="Email"
            error={errors.email?.message}
          />
        </FormItem>

        <FormItem label="Password">
          <InputControl
            name="password"
            control={control}
            label="Password"
            error={errors.password?.message}
          />
        </FormItem>
      </div>

      <Button type="submit" variant="primary" size="md" fullWidth>
        Đăng nhập
      </Button>

      <div className="text-center text-sm text-gray-600">
        Chưa có tài khoản?{' '}
        <button
          type="button"
          onClick={showRegister}
          className="text-primary hover:underline font-medium"
        >
          Đăng ký ngay
        </button>
      </div>
    </form>
  )
}

export default LoginForm
