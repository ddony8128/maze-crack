# maze-crack

`React 19 + Vite + TypeScript` 기반 프론트엔드 보일러플레이트.

## 실행

```bash
npm install
npm run dev
```

## 구조

- `src/pages/`: 라우팅 단위 페이지(오케스트레이션)
- `src/components/`: UI 컴포넌트
- `src/engine/`: 게임 엔진/AI(Worker 포함) — 이후 maze-crack 규칙에 맞게 교체
- `src/types/`: 워커 메시지 등 공유 타입
- `src/lib/`: 유틸/트래킹 등 공통 모듈
