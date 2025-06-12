// components/CommentForm.tsx
import styled from '@emotion/styled'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, CircularProgress, TextField } from '@mui/material'
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { postComment } from '../../store/commentSlice'
import { useAppDispatch } from '../../store/store'

// Zod validation schema
const commentSchema = z.object({
  content: z.string()
    .min(10, 'Comment must be at least 10 characters')
    .max(500, 'Comment cannot exceed 500 characters'),
  author: z.string()
    .max(50, 'Name cannot exceed 50 characters')
    .optional(),
  sampleId: z.string().uuid()
})

type CommentFormData = z.infer<typeof commentSchema>

const FormContainer = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 600px;
  margin: 0 auto;
`

const ErrorMessage = styled.span`
  color: #d32f2f;
  font-size: 0.875rem;
  margin-top: -0.5rem;
`

interface CommentFormProps {
  sampleId: string
}

export default function CommentForm({ sampleId }: CommentFormProps) {
  const { executeRecaptcha } = useGoogleReCaptcha()
  const dispatch = useAppDispatch()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<CommentFormData>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      sampleId,
      author: '',
      content: ''
    }
  })

  const onSubmit = async (data: CommentFormData) => {
    try {
      if (!executeRecaptcha) {
        throw new Error('Recaptcha not initialized')
      }

      // Get reCAPTCHA token
      const token = await executeRecaptcha('commentSubmit')

      // Dispatch the comment with reCAPTCHA token
      await dispatch(postComment({
        ...data,
        recaptchaToken: token
      })).unwrap()

      // Reset form on success
      reset()
    } catch (error) {
      console.error('Comment submission failed:', error)
    }
  }

  return (
    <FormContainer onSubmit={handleSubmit(onSubmit)}>
      <TextField
        label="Your Name (optional)"
        variant="outlined"
        error={!!errors.author}
        helperText={errors.author?.message}
        {...register('author')}
      />

      <TextField
        label="Comment"
        variant="outlined"
        multiline
        rows={4}
        error={!!errors.content}
        helperText={errors.content?.message}
        {...register('content')}
        required
      />

      <input type="hidden" {...register('sampleId')} />

      <Button
        type="submit"
        variant="contained"
        color="primary"
        disabled={isSubmitting}
        startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
      >
        {isSubmitting ? 'Posting...' : 'Post Comment'}
      </Button>

      {errors.root && (
        <ErrorMessage>{errors.root.message}</ErrorMessage>
      )}
    </FormContainer>
  )
}
