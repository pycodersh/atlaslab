import { useContext } from 'react'
import { TrainerOrbContext } from '@/components/trainer/TrainerOrbContext'

export function useTrainer() {
  return useContext(TrainerOrbContext)
}
