import { atom, useAtom } from 'jotai/index'
import { type Comment } from '../(domain)/comment'
import { postComment } from '../(infra)/comment'

const commentsAtom = atom<Comment[]>([])

export interface CommentUseCases {
  comments: Comment[]
  addComment: (
    articleId: number,
    parentId: number | null,
    nickname: string,
    password: string,
    content: string
  ) => Promise<void>
  setComments: (comments: Comment[]) => void
  removeComment: (commentId: number) => void
}

export const useComments = (): CommentUseCases => {
  const [comments, setComments] = useAtom(commentsAtom)

  const addComment = async (articleId: number, parentId: number | null, nickname: string, password: string, content: string): Promise<void> => {
    const newComment = await postComment(articleId, parentId, nickname, password, content)
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

  const removeComment = (commentId: number): void => {
    setComments(prev => prev.filter(comment => comment.id !== commentId))
  }

  return {
    comments,
    setComments,
    removeComment,
    addComment
  }
}
