import { notFound } from 'next/navigation'
import { TrainerUIPlayground } from './playground'

export default function TrainerUIPage() {
  if (process.env.NODE_ENV !== 'development') notFound()
  return <TrainerUIPlayground />
}
