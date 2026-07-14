'use client'

import { useEffect, useRef } from 'react'
import { subscribeSavePopup, closeSavePopup, type PopupItem } from '@/lib/words/popupStore'
import { saveWord, savePhrase } from '@/lib/words/storage'
import { useT } from '@/hooks/useT'
import { useTrainerSafe } from '@/contexts/TrainerContext'

/**
 * Global singleton Word/Phrase save popup.
 * Replaces centered modal with Trainer bubble action buttons.
 */
export function GlobalSavePopup() {
  const trainer = useTrainerSafe()
  const trainerRef = useRef(trainer)
  const t = useT()
  const tRef = useRef(t)

  // Update refs synchronously in render body so subscribe callback always sees latest values
  trainerRef.current = trainer
  tRef.current = t

  useEffect(() => {
    return subscribeSavePopup((item: PopupItem | null) => {
      const trainer = trainerRef.current
      const t = tRef.current
      if (!item || !trainer) return

      const wordDisplay = item.word.length > 20 ? item.word.slice(0, 18) + '…' : item.word

      if (item.chunk) {
        const phraseDisplay = item.chunk.text.length > 20
          ? item.chunk.text.slice(0, 18) + '…'
          : item.chunk.text

        trainer.showAction(
          `Save "${phraseDisplay}"?`,
          [
            {
              label: t('save_word_only') || 'Word only',
              onClick: () => {
                saveWord({
                  word: item.word, sourceType: item.sourceType,
                  sourceId: item.sourceId, storyId: item.storyId,
                  patternId: item.patternId, paragraphId: item.paragraphId,
                  exampleIndex: item.exampleIndex, originalSentence: item.originalSentence,
                })
                window.getSelection()?.removeAllRanges()
                closeSavePopup()
                setTimeout(() => trainer.showMessage('Saved.', 1800), 100)
              },
            },
            {
              label: t('save_phrase_btn') || 'Save',
              primary: true,
              onClick: () => {
                savePhrase({
                  phrase: item.chunk!.text, phraseType: item.chunk!.type,
                  sourceType: item.sourceType, sourceId: item.sourceId,
                  storyId: item.storyId, patternId: item.patternId,
                  paragraphId: item.paragraphId, exampleIndex: item.exampleIndex,
                  originalSentence: item.originalSentence, meaning: item.koreanSentence,
                })
                window.getSelection()?.removeAllRanges()
                closeSavePopup()
                setTimeout(() => trainer.showMessage('Saved.', 1800), 100)
              },
            },
          ],
        )
      } else {
        trainer.showAction(
          `Save "${wordDisplay}"?`,
          [
            {
              label: 'No',
              onClick: () => {
                window.getSelection()?.removeAllRanges()
                closeSavePopup()
                trainer.clearMessage()
              },
            },
            {
              label: 'Save',
              primary: true,
              onClick: () => {
                saveWord({
                  word: item.word, sourceType: item.sourceType,
                  sourceId: item.sourceId, storyId: item.storyId,
                  patternId: item.patternId, paragraphId: item.paragraphId,
                  exampleIndex: item.exampleIndex, originalSentence: item.originalSentence,
                })
                window.getSelection()?.removeAllRanges()
                closeSavePopup()
                setTimeout(() => trainer.showMessage('Saved.', 1800), 100)
              },
            },
          ],
        )
      }
    })
  }, []) // subscribe once; trainer/t accessed via refs

  return null
}
