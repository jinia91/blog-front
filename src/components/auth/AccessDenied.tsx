import React from 'react'

export default function AdminAccessDenied (): React.ReactElement {
  return (
    <div className="flex items-center justify-center min-h-full pb-20 pt-20">
      <div className="p-6 rounded-lg border-4 border-gray-600 text-center bg-gray-900">
        <div className="mb-4 flex justify-center">
          <p className="flex text-gray-300 font-bold dos-font">
            {'┌─┐'}<br/>
            {'│X│'}<br/>
            {'└─┘'}
          </p>
          <p className={'dos-font flex flex-col text-gray-300 justify-center'}>{'<- ACCESS DENIED!'}</p>
        </div>
        <p className="text-gray-300 mb-4 dos-font">
          어드민 권한만 접근할 수 있습니다
        </p>
        <button
          onClick={() => {
            window.history.back()
          }}
          className="bg-gray-800 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded dos-font"
        >
          뒤로 가기
        </button>
      </div>
    </div>
  )
}
