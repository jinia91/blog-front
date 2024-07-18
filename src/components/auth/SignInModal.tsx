import React, { useContext } from 'react'
import { AuthSessionContext } from '@/components/auth/AuthSessionProvider'
import { getOAuthLoginUrl } from '@/api/auth'
import googleLogo from '../../../public/retro-google.png'
import Image from 'next/image'
import CommonModal from '@/components/ui-layout/CommonModal'

export default function SignInModal ({ onClose }: { onClose: () => void }): React.ReactElement | null {
  const { session } = useContext(AuthSessionContext)
  if (session !== null) {
    return null
  }
  const handleLogin = async (): Promise<void> => {
    try {
      const url = await getOAuthLoginUrl('GOOGLE')
      if (url == null) {
        throw new Error('No url')
      }
      window.location.href = url.url
    } catch (error) {
      console.error('Failed to login:', error)
    }
  }
  return (
    <CommonModal onClose={onClose}>
      <h2 className="retro-font text-xl font-bold mb-4 text-gray-300">SOCIAL LOGIN</h2>
      <button
        onClick={() => {
          handleLogin().catch((err) => {
            console.error('Error:', err)
          })
        }}
        className="retro-font bg-gray-800 hover:bg-gray-700 text-gray-400 font-bold py-2 px-4 rounded-lg border-2 border-gray-700 inline-flex items-center justify-center w-full"
      >
        <Image src={googleLogo} alt={'google'} className="w-5 h-5 mr-2"/>
        <span>Google Login</span>
      </button>
    </CommonModal>
  )
}
