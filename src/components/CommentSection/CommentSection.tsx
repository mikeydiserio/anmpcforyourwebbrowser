'use client'

import styled from '@emotion/styled'
import { JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal, useEffect } from 'react'
import { fetchComments } from '../../store/commentSlice'
import { useAppDispatch, useAppSelector } from '../../store/store'
import CommentForm from '../CommentForm/CommentForm'

const CommentsContainer = styled.div`
  margin-top: 2rem;
  padding: 1rem;
  background: #f5f5f5;
  border-radius: 8px;
`

const CommentList = styled.div`
  margin-bottom: 2rem;
`

const CommentItem = styled.div`
  padding: 1rem;
  background: white;
  border-radius: 4px;
  margin-bottom: 1rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`

const CommentAuthor = styled.p`
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: #333;
`

const CommentContent = styled.p`
  color: #666;
  line-height: 1.5;
`

const CommentDate = styled.small`
  color: #999;
  display: block;
  margin-top: 0.5rem;
`

interface CommentSectionProps {
  sampleId: string
}

export default function CommentSection({ sampleId }: CommentSectionProps) {
  const dispatch = useAppDispatch()
  const { comments, status, error } = useAppSelector((state: { comments: any }) => state.comments)

  useEffect(() => {
    dispatch(fetchComments(sampleId))
  }, [sampleId, dispatch])

  const filteredComments = comments.filter(
    (comment: { sampleId: string }) => comment.sampleId === sampleId
  )

  if (status === 'loading') {
    return <div>Loading comments...</div>
  }

  if (status === 'failed') {
    return <div>Error loading comments: {error}</div>
  }

  return (
    <CommentsContainer>
      <h3>Comments ({filteredComments.length})</h3>
      <CommentList>
        {filteredComments.map((comment: { id: Key | null | undefined; author: string; content: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; createdAt: string | number | Date }) => (
          <CommentItem key={comment.id}>
            <CommentAuthor>
              {comment.author || 'Anonymous'}
            </CommentAuthor>
            <CommentContent>{comment.content}</CommentContent>
            <CommentDate>
              {new Date(comment.createdAt).toLocaleDateString()}
            </CommentDate>
          </CommentItem>
        ))}
      </CommentList>
      <CommentForm sampleId={sampleId} />
    </CommentsContainer>
  )
}
