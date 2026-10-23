# 외부 에셋 출처·라이선스

모두 Kenney (www.kenney.nl) — **CC0 1.0 (퍼블릭 도메인)**. 출처 표기 의무 없음, 감사의 뜻으로 기록.

| 파일 | 원본 | 팩 | 가공 |
|---|---|---|---|
| tiles/open.png | PNG/Tiles/Terrain/Grass/grass_05.png | Hexagon Pack | 이름 변경 |
| tiles/road.png | PNG/Tiles/Terrain/Dirt/dirt_06.png | Hexagon Pack | 이름 변경 |
| tiles/orchard.png | PNG/Tiles/Terrain/Grass/grass_13.png | Hexagon Pack | 이름 변경 |
| tiles/bocage.png | PNG/Tiles/Terrain/Grass/grass_10.png | Hexagon Pack | 이름 변경 |
| tiles/woods.png | PNG/Tiles/Terrain/Grass/grass_12.png | Hexagon Pack | 이름 변경 |
| tiles/farm.png | PNG/Tiles/Medieval/medieval_farm.png | Hexagon Pack | 이름 변경 |
| tiles/church.png | PNG/Tiles/Medieval/medieval_church.png | Hexagon Pack | 이름 변경 |
| sfx/step1.mp3, step2.mp3 | footstep_grass_000/003.ogg | Impact Sounds | ogg→mp3 모노 96k |
| sfx/hit.mp3 | impactPunch_heavy_001.ogg | Impact Sounds | ogg→mp3 |
| sfx/thud.mp3 | impactSoft_medium_002.ogg | Impact Sounds | ogg→mp3 |
| sfx/tear.mp3 | impactPlank_medium_000.ogg | Impact Sounds | ogg→mp3 |
| sfx/click.mp3 | click_002.ogg | Interface Sounds | ogg→mp3 |
| sfx/select.mp3 | select_003.ogg | Interface Sounds | ogg→mp3 |
| sfx/confirm.mp3 | confirmation_002.ogg | Interface Sounds | ogg→mp3 |
| sfx/error.mp3 | error_004.ogg | Interface Sounds | ogg→mp3 |
| sfx/draw.mp3 | scroll_002.ogg | Interface Sounds | ogg→mp3 |
| sfx/card.mp3 | drop_002.ogg | Interface Sounds | ogg→mp3 |
| sfx/bell.mp3 | bong_001.ogg | Interface Sounds | ogg→mp3 |
| sfx/rally.mp3 | maximize_004.ogg | Interface Sounds | ogg→mp3 |

총성·기관총·저격 소리는 녹음 샘플 없이 WebAudio 합성 (`src/systems/sfx.ts`).
유닛 토큰·카드·주사위는 코드로 그린다 (외부 그림 없음).

### 시나리오 2 추가 타일 (2026-10-23)
| 파일 | 원본 | 팩 | 가공 |
|---|---|---|---|
| tiles/river.png | PNG/Tiles/Terrain/Grass/grass_05.png | Hexagon Pack | 파란 색조로 재채색 + 물결 선 (`tools/tilegen/make_water_tiles.py`) |
| tiles/bridge.png | 위 river.png | Hexagon Pack | 남북 돌다리 띠·난간 그림 |
| tiles/ford.png | PNG/Tiles/Terrain/Grass/grass_05.png | Hexagon Pack | 옅은 청록 재채색 + 징검돌·물결 |
| tiles/windmill.png | PNG/Tiles/Medieval/medieval_windmill.png | Hexagon Pack | 이름 변경 |
| tiles/ruins.png | PNG/Tiles/Medieval/medieval_ruins.png | Hexagon Pack | 이름 변경 |
