import React from 'react'
import RoguelikeApp from './(components)/roguelike-app'

export const metadata = {
  title: 'Roguelike Dungeon Crawler',
  description: '10-floor roguelike dungeon crawler game'
}

export default function RoguelikePage (): React.ReactElement {
  return <RoguelikeApp />
}
