import { getOAuthLoginUrl } from '@/api/auth'
import Image from 'next/image'
import googleLogo from '../../../public/retro-google.png'
import React from 'react'

export default function SignInAndOutContainer (): React.ReactElement {
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
    <div className={'flex items-center justify-center pb-20 pt-20'}>
      <div className="bg-gray-900 p-6 rounded-lg shadow-lg border-4 border-gray-800"
           style={{ width: '400px' }}>
        <h2 className="retro-font text-xl font-bold mb-4 text-gray-400">
          SOCIAL LOGIN
        </h2>
        <p className={'dos-font text-gray-400 p-10'}>로그인이 필요한 화면입니다</p>
        <button
          onClick={() => {
            handleLogin().catch((err) => {
              console.error('Error:', err)
            })
          }}
          className="retro-font bg-gray-800 hover:bg-gray-700 text-gray-400 font-bold py-2 px-4 rounded-lg border-2 border-gray-700 inline-flex items-center justify-center w-full"
        >
          <Image src={googleLogo} alt={'google'} width={20} height={20} className="mr-2"/>
          <span>Google Login</span>
        </button>
      </div>
    </div>
  )
}
