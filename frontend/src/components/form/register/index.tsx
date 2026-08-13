import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { registerSchema, type RegisterFormValues } from '~/common/schemas'
import useAuthStore from '~/common/stores/authStore'
import { Button } from '~/components/button/Button'
import FormItem from '~/components/form/formItem'
import InputControl from '~/components/form/input/InputControler'

const RegisterForm = () => {
  const showLogin = useAuthStore((s) => s.showLogin)

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  const onSubmit = async (data: RegisterFormValues) => {
    console.log(data)
  }

  return (
    <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-col gap-4">
        {/* Email */}
        <FormItem label="Email" isRequired>
          <InputControl
            name="email"
            control={control}
            placeholder="Nhập email"
            error={errors.email?.message}
          />
        </FormItem>

        {/* Password */}
        <FormItem label="Mật khẩu" isRequired>
          <InputControl
            name="password"
            control={control}
            placeholder="Nhập mật khẩu"
            type="password"
            error={errors.password?.message}
          />
        </FormItem>

        {/* Confirm Password */}
        <FormItem label="Xác nhận mật khẩu" isRequired>
          <InputControl
            name="confirmPassword"
            control={control}
            placeholder="Xác nhận mật khẩu"
            type="password"
            error={errors.confirmPassword?.message}
          />
        </FormItem>
      </div>

      <Button type="submit" variant="primary" size="md" fullWidth disabled={isSubmitting}>
        {isSubmitting ? 'Đang xử lý...' : 'Đăng ký'}
      </Button>

      <div className="text-center text-sm text-gray-600">
        Đã có tài khoản?{' '}
        <Button type="button" variant="link" size="md" onClick={showLogin}>
          Đăng nhập ngay
        </Button>
      </div>
    </form>
  )
}
export default RegisterForm
