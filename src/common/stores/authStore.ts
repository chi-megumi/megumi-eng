import { create } from 'zustand'

interface AuthStore {
  authModalStatus: {
    isOpen: boolean
    type: 'login' | 'register'
  }

  setAuthModalStatus: (status: { isOpen: boolean; type: 'login' | 'register' }) => void

  showLogin: () => void
  showRegister: () => void
  closeModal: () => void
}

const useAuthStore = create<AuthStore>((set) => ({
  authModalStatus: {
    isOpen: false,
    type: 'login',
  },

  setAuthModalStatus: (status) => set({ authModalStatus: status }),

  showLogin: () => set({ authModalStatus: { isOpen: true, type: 'login' } }),
  showRegister: () => set({ authModalStatus: { isOpen: true, type: 'register' } }),
  closeModal: () => set({ authModalStatus: { isOpen: false, type: 'login' } }),
}))

export default useAuthStore
