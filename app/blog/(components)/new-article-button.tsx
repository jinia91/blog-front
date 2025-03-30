import React, { useCallback } from 'react'
import { BsFillPencilFill } from 'react-icons/bs'
import { useSession } from '../../login/(usecase)/session-usecases'
import { useTabBarAndRouter } from '../../(layout)/(usecase)/tab-usecases'
import { initDraftArticle } from '../(infra)/article'

const NewArticleButton: React.FC = () => {
  const { session } = useSession()
  const { upsertAndSelectTab, tabs } = useTabBarAndRouter()

  const createArticle = async (): Promise<string | null> => {
    try {
      return await initDraftArticle()
    } catch (error) {
      console.error('Error creating article:', error)
      throw error
    }
  }

  const handleClick = useCallback(() => {
    createArticle()
      .then(id => {
        if (id != null) {
          upsertAndSelectTab({ name: 'New Article', urlPath: `/blog/edit/${id}` })
        }
      })
      .catch(error => {
        console.error('새로운 글 생성 실패:', error)
      })
  }, [tabs])

  if (session == null || !(session?.roles.values().next().value === 'ADMIN')) {
    return null
  }

  return (
    <button
      onClick={handleClick}
      className="flex items-center justify-center w-10 h-10 border border-yellow-400 rounded-lg bg-gray-900 text-orange-400 shadow-md hover:bg-gray-700 transition"
    >
      <BsFillPencilFill size={28}/>
    </button>
  )
}

export default NewArticleButton
