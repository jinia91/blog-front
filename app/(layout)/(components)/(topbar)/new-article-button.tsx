import React, { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { initDraftArticle } from '../../../blog/(infra)/article'
import { BsFillPencilFill } from 'react-icons/bs'
import { useSession } from '../../../login/(usecase)/session-usecases'

const NewArticleButton: React.FC = () => {
  const router = useRouter()
  const { session } = useSession()

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
          router.push(`/blog/edit/${id}`)
        }
      })
      .catch(error => {
        console.error('새로운 글 생성 실패:', error)
      })
  }, [])

  if (session == null || !(session?.roles.values().next().value === 'ADMIN')) {
    return null
  }

  return (
    <button
      onClick={handleClick}
      className="flex items-center justify-center w-10 h-10 border border-yellow-400 rounded-lg ml-2 bg-gray-900 text-orange-400 shadow-md hover:bg-gray-700 transition"
    >
      <BsFillPencilFill size={28}/>
    </button>
  )
}

export default NewArticleButton
