import { atom, useAtom } from 'jotai/index'
import { type Comment } from '../(domain)/comment'
import { deleteComment, postComment } from '../(infra)/comment'

const commentsAtom = atom<Comment[]>([])

export interface CommentUseCases {
  comments: Comment[]
  addComment: (
    articleId: number,
    parentId: number | null,
    nickname: string,
    password: string | null,
    profileImageUrl: string | null,
    content: string,
    userId: number | null
  ) => Promise<void>
  setComments: (comments: Comment[]) => void
  removeComment: (commentId: number, password: string | null) => Promise<void>
}

export const useComments = (): CommentUseCases => {
  const [comments, setComments] = useAtom(commentsAtom)

  const addComment = async (
    articleId: number,
    parentId: number | null,
    nickname: string,
    password: string | null,
    profileImageUrl: string | null,
    content: string,
    userId: number | null = null
  ): Promise<void> => {
    const isRegistered = userId !== null
    const response = await postComment(articleId, parentId, isRegistered ? null : nickname, password, content)
    if (response === -1) {
      throw new Error('댓글 생성 실패')
    }
    const newComment: Comment = {
      id: response,
      content,
      nickname,
      profileImageUrl,
      createdAt: new Date(),
      children: [],
      authorId: isRegistered ? userId : null,
      deleted: false
    }
    const appendComment = (comments: Comment[]): Comment[] => {
      if (parentId === null) {
        return [...comments, newComment]
      }

      return comments.map(comment =>
        comment.id === parentId
          ? { ...comment, children: [...comment.children, newComment] }
          : { ...comment, children: appendComment(comment.children) }
      )
    }
    setComments(prev => appendComment(prev))
  }

  const removeComment = async (commentId: number, password: string | null): Promise<void> => {
    const response = await deleteComment(commentId, password)
    if (!response) {
      throw new Error('댓글 삭제 실패')
    }
    const markDeleted = (comments: Comment[]): Comment[] => {
      return comments.map(comment =>
        comment.id === commentId
          ? { ...comment, deleted: true }
          : { ...comment, children: markDeleted(comment.children) }
      )
    }

    setComments(prev => markDeleted(prev))
  }

  return {
    comments,
    setComments,
    removeComment,
    addComment
  }
}
