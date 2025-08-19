#!/bin/bash

# 연차 관리 시스템 배포 스크립트

echo "🚀 연차 관리 시스템 배포 시작..."

# 1. 의존성 설치
echo "📦 의존성 설치 중..."
npm install

# 2. 프로덕션 빌드
echo "🏗️  프로덕션 빌드 중..."
npm run build

# 3. Git에 커밋 (변경사항이 있는 경우)
if [ -n "$(git status --porcelain)" ]; then
    echo "📝 Git에 변경사항 커밋 중..."
    git add .
    git commit -m "Update: 연차 관리 시스템 배포 $(date '+%Y-%m-%d %H:%M:%S')

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>"
else
    echo "✅ 변경사항이 없습니다."
fi

# 4. GitHub에 푸시
echo "📤 GitHub에 푸시 중..."
git push origin main

echo "✅ 배포 완료!"
echo "🌐 GitHub 저장소: https://github.com/cheongahm1996/HR-POC"
echo "💻 로컬 실행: npm run dev"