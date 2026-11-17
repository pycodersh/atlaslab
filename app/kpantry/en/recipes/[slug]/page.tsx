import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import RecipeDetailClient from '@/components/kpantry/recipe-detail/RecipeDetailClient'
import { getRecipeForPage, getRecipeSlugs, type RecipePageData } from '@/lib/kpantry/recipePage'
import { LOCKED_STEPS_CLASS, RECIPE_LOCK_ENABLED, isFreeRecipe } from '@/lib/kpantry/access'
import { firstSentence } from '@/lib/kpantry/buyInfo'
import { DEFAULT_OPEN_GRAPH } from '@/lib/seo/site'

const BASE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.atlaslabstudios.com').replace(/^﻿/, '')

interface PageProps {
  params: Promise<{ slug: string }>
}

/*
 * 레시피 상세 — 서버 렌더링(SSG, 하루마다 다시 굽기). 색인 대상.
 *
 * 잠금 정책 (2026-11-17):
 *   무료 10개 — 설명·재료·조리 단계 전부 서버 HTML 에.
 *   잠긴 93개 — 설명·재료 목록까지만. 조리 단계는 HTML 에 없다(RLS 로 공개 키에도 안 보인다).
 *              Recipe 구조화 데이터에 isAccessibleForFree:false + 잠긴 단계 자리(cssSelector)를 표시한다.
 *   잠금을 연 사용자는 화면에서 /api/kpantry/recipe-steps 로 단계를 받는다.
 * 데이터는 publishable 키로만 읽는다 — service_role 을 이 공개 페이지에 들이지 않는다.
 */
export const dynamic = 'force-static'
export const revalidate = 86400

export async function generateStaticParams() {
  return (await getRecipeSlugs()).map(slug => ({ slug }))
}

const isLockedForAll = (slug: string) => RECIPE_LOCK_ENABLED && !isFreeRecipe(slug)

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const recipe = await getRecipeForPage(slug)
  if (!recipe) return { robots: { index: false, follow: true } }

  const title = `${recipe.name_en}${recipe.name_ko ? ` (${recipe.name_ko})` : ''} Recipe | K-Pantry`
  const description = firstSentence(recipe.description, 155)
    || `How to make ${recipe.name_en}, a Korean home-cooking recipe, with the full ingredient list.`
  const url = `${BASE_URL}/kpantry/en/recipes/${recipe.slug}`
  return {
    title,
    description,
    alternates: { canonical: url },
    // layout 의 noindex 기본값을 이 서버 렌더링 상세에서 해제한다
    robots: { index: true, follow: true },
    openGraph: {
      ...DEFAULT_OPEN_GRAPH,
      type: 'article',
      title,
      description,
      url,
      ...(recipe.hero_image_url ? { images: [{ url: recipe.hero_image_url, alt: recipe.name_en }] } : {}),
    },
  }
}

function recipeJsonLd(recipe: RecipePageData) {
  const url = `${BASE_URL}/kpantry/en/recipes/${recipe.slug}`
  const locked = isLockedForAll(recipe.slug)
  const ingredients = (recipe.pantry_recipe_ingredients ?? [])
    .map((ri: any) => [ri.amount, ri.pantry_ingredients?.name].filter(Boolean).join(' ').trim())
    .filter(Boolean)
  const nutrition = recipe.calories != null ? {
    nutrition: {
      '@type': 'NutritionInformation',
      calories: `${recipe.calories} calories`,
      ...(recipe.protein_g != null ? { proteinContent: `${recipe.protein_g} g` } : {}),
      ...(recipe.carbs_g != null ? { carbohydrateContent: `${recipe.carbs_g} g` } : {}),
      ...(recipe.fat_g != null ? { fatContent: `${recipe.fat_g} g` } : {}),
    },
  } : {}

  return {
    '@context': 'https://schema.org',
    '@type': 'Recipe',
    name: recipe.name_en,
    ...(recipe.name_ko ? { alternateName: recipe.name_ko } : {}),
    url,
    ...(recipe.description ? { description: recipe.description } : {}),
    ...(recipe.hero_image_url ? { image: [recipe.hero_image_url] } : {}),
    recipeCuisine: 'Korean',
    ...(recipe.category ? { recipeCategory: recipe.category } : {}),
    ...(recipe.cooking_time_min ? { totalTime: `PT${recipe.cooking_time_min}M` } : {}),
    ...(recipe.servings ? { recipeYield: `${recipe.servings} servings` } : {}),
    recipeIngredient: ingredients,
    ...nutrition,
    author: { '@type': 'Organization', name: 'K-Pantry by Atlas Lab', url: `${BASE_URL}/kpantry/en` },
    ...(locked
      ? {
          // 조리 단계는 Lifetime Pass 구매자에게만 — 단계 자리는 HTML 에 잠금 안내로만 있다
          isAccessibleForFree: false,
          hasPart: {
            '@type': 'WebPageElement',
            isAccessibleForFree: false,
            cssSelector: `.${LOCKED_STEPS_CLASS}`,
          },
        }
      : {
          isAccessibleForFree: true,
          recipeInstructions: (recipe.pantry_recipe_steps ?? []).map((s: any) => ({
            '@type': 'HowToStep',
            ...(s.title ? { name: s.title } : {}),
            text: s.description ?? s.title,
            ...(s.image_url ? { image: s.image_url } : {}),
          })),
        }),
  }
}

/** 존재하지 않는 슬러그에는 실제 HTTP 404 */
export default async function RecipeDetailPage({ params }: PageProps) {
  const { slug } = await params
  const recipe = await getRecipeForPage(slug)
  if (!recipe) notFound()

  // 잠긴 레시피는 공개 키 조회라 단계가 원래 비어 있다 — 혹시라도 섞이면 HTML 에 넣지 않는다
  const forPage = isLockedForAll(slug) ? { ...recipe, pantry_recipe_steps: [] } : recipe

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(recipeJsonLd(forPage)).replace(/</g, '\\u003c') }}
      />
      <RecipeDetailClient initialRecipe={forPage} />
    </>
  )
}
