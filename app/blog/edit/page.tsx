'use client'

import type React from 'react'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { initDraftArticle } from '../(infra)/article'

// 임시페이지, 나중에 삭제
export default function Page (): React.ReactElement | null {
  const router = useRouter()

  useEffect(() => {
    const createArticle = async (): Promise<void> => {
      try {
        const id = await initDraftArticle()
        console.log(id)
        router.push(`/blog/edit/${id}`)
      } catch (error) {
        console.error('Error creating article:', error)
      }
    }

    void createArticle()
  }, [])

  return null
}
