-- Migration: 032_blog_posts_thumbnail.sql
-- blog_posts 에 선택적 thumbnail 컬럼 추가.
-- 지금까지 표지는 코드(lib/blog/thumbnail.ts 의 COVER_BY_SLUG)로만 등록했으나,
-- 영문 글로벌 아티클 자동 생성 파이프라인(scripts/generate-global-post.mjs)이
-- Pexels 썸네일 경로를 배포 없이 바로 저장할 수 있도록 DB 컬럼을 둔다.
-- NULL 이면 기존처럼 COVER_BY_SLUG → YouTube/본문 첫 이미지 폴백을 그대로 따른다
-- (thumbnailForPost() 에서 이 컬럼을 COVER_BY_SLUG 보다 먼저 확인하도록 코드도 함께 바뀐다).
ALTER TABLE blog_posts
  ADD COLUMN IF NOT EXISTS thumbnail TEXT;
