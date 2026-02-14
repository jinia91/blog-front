import React from 'react'
import RoguelikeApp from './(components)/roguelike-app'

export const metadata = {
  title: '어비스 크롤러',
  description: '10층 던전을 돌파하는 어비스 크롤러'
}

export default function RoguelikePage (): React.ReactElement {
  return <RoguelikeApp />
}
