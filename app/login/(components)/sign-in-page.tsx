import Image from 'next/image'
import googleLogo from '../../../public/retro-google.png'
import React from 'react'
import { LoginButton } from './login-button'
import { Provider } from '../(domain)/provider'

export default function SignInPage (): React.ReactElement {
  return (
    <div className={'flex items-center justify-center pb-20 pt-20'}>
      <div className="bg-gray-900 p-6 rounded-lg shadow-lg border-4 border-gray-800"
           style={{ width: '400px' }}>
        <h2 className="retro-font text-xl font-bold mb-4 text-gray-400">
          SOCIAL LOGIN
        </h2>
        <p className={'dos-font text-gray-400 p-10'}>로그인이 필요한 화면입니다</p>
        <LoginButton
          className={'retro-font bg-gray-800 hover:bg-gray-700 text-gray-400 font-bold py-2 px-4 rounded-lg border-2 border-gray-700 inline-flex items-center justify-center w-full'}
          provider={Provider.GOOGLE}
          logo={<Image src={googleLogo} alt={'google'} width={20} height={20} className="mr-2"/>}
          title={'Google Login'}
        />
      </div>
    </div>
  )
}
