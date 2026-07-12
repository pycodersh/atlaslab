'use client'

import { useEffect } from 'react'
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
  const t = useT()

  useEffect(() => {
    return subscribeSavePopup((item: PopupItem | null) => {
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
              label: 'Not now',
              onClick: () => {
                window.getSelection()?.removeAllRanges()
                closeSavePopup()
                trainer.clearMessage()
              },
            },
            {
              label: t('save_word_btn') || 'Save',
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trainer])

  return null
}
