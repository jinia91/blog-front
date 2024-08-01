import React, { useState } from 'react'
import SignInModal from '../../../login/(components)/sign-in-modal'
import Image from 'next/image'
import signIn from '../../../../public/signin.png'
import logout from '../../../../public/logout.png'
import { useSession } from '../../../login/(usecase)/session-usecases'

const useToggleLoginModal = (): {
  isShowLoginModal: boolean
  toggleLoginModal: () => void
} => {
  const [showLoginModal, setShowLoginModal] = useState(false)
  const toggleLoginModal = (): void => {
    setShowLoginModal(!showLoginModal)
  }
  return { isShowLoginModal: showLoginModal, toggleLoginModal }
}

export default function SignInAndOutButton (): React.ReactElement {
  const { session, handleLogout } = useSession()
  const { isShowLoginModal, toggleLoginModal } = useToggleLoginModal()

  return (
    session != null
      ? (
        <div className="retro-container rounded-lg inline-flex items-center pr-4">
          <Image
            src={session.picUrl}
            alt={'프로필 사진'}
            width={32} // 실제 픽셀 크기
            height={32} // 실제 픽셀 크기
            className="w-8 h-8 mr-2 rounded-full"
          />
          <span className="text-gray-300 mr-4 dos-font">
        {session.nickName} 님
      </span>
          <Image
            src={logout}
            alt={'로그아웃'}
            onClick={() => {
              handleLogout().catch((err) => {
                console.error('Error:', err)
              })
            }}
            className="hover:bg-gray-600 h-8 w-8 font-bold rounded-full"
          >
          </Image>
        </div>
        )
      : (<>
          <button
            onClick={toggleLoginModal}
            className="retro-font bg-gray-500 inline-flex items-center hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mr-5">
            <Image src={signIn} alt={'로그인'} className="w-5 h-5 mr-2"/>
            LOGIN
          </button>
          {isShowLoginModal && <SignInModal onClose={() => {
            toggleLoginModal()
          }}/>}
        </>
        )
  )
}
