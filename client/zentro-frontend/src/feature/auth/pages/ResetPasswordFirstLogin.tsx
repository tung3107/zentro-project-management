import ResetPasswordFirstLoginForm from '../components/ResetPasswordFirstLoginForm'

export default function ResetPasswordFirstLogin() {
  return (
    <div className='min-h-screen w-full flex items-center justify-center bg-gradient-to-tr from-gray-100 to-white px-4'>
      <div className='bg-white rounded-2xl shadow-[0_8px_36px_rgba(204,60,60,0.13)] max-w-md w-full py-12 px-7 sm:px-10 flex flex-col items-center animate-fade-in'>
        <div className='flex flex-col items-center w-full mb-8'>
          <span className='flex items-center justify-center w-12 h-12 rounded-full bg-[#cc3c3c] shadow-lg mb-3'>
            {/* Tick icon, hoặc thay bằng biểu tượng nào bạn thích  */}
            <svg width='28' height='28' fill='none' viewBox='0 0 24 24'>
              <circle cx='12' cy='12' r='12' fill='#cc3c3c' />
              <path d='M8 12l2.5 2.5L16 9' stroke='#fff' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
            </svg>
          </span>
          <h1 className='text-[1.8rem] font-bold text-[#cc3c3c] tracking-wide mb-2 mt-1 drop-shadow-sm'>
            Đổi mật khẩu mới
          </h1>
          <p className='text-gray-600 text-[1rem] opacity-90 text-center'>
            Vui lòng đặt mật khẩu mạnh để bảo vệ tài khoản của bạn
          </p>
        </div>
        <ResetPasswordFirstLoginForm />
      </div>
    </div>
  )
}
