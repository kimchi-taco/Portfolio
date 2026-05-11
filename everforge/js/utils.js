// Everforge — shared utilities

const EF = {
  fmt: {
    // 1,234.5조 형식
    trillion(v, digits = 1) {
      if (v == null || isNaN(v)) return '—';
      return v.toLocaleString('ko-KR', { minimumFractionDigits: digits, maximumFractionDigits: digits });
    },
    // 조원을 자동으로 단위 변환 (소액이면 억원)
    auto(v) {
      if (v == null || isNaN(v)) return '—';
      if (Math.abs(v) >= 1.0) return `${EF.fmt.trillion(v)}조`;
      return `${(v * 10000).toLocaleString('ko-KR', { maximumFractionDigits: 0 })}억`;
    },
    pct(v, digits = 2, signed = false) {
      if (v == null || isNaN(v)) return '—';
      const s = signed && v > 0 ? '+' : '';
      return `${s}${v.toFixed(digits)}%`;
    },
    // 25.1조원 표시용 큰 숫자 (천 단위 구분자)
    bigKrw(v) {
      if (v == null || isNaN(v)) return '—';
      return v.toLocaleString('ko-KR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    },
    year(y) { return y == null ? '—' : `${y}년`; },
  },

  // depletion 연도에 따른 유머러스한 한 줄
  depletionQuip(year, anchorYear = 2026) {
    if (year == null) return '<em>이번 시나리오에서는 고갈 안 됨</em> — 일단은요';
    const diff = year - anchorYear;
    if (diff <= 25) return `올해 태어난 아기가 초등학생 졸업 전`;
    if (diff <= 30) return `올해 신생아가 30살 되는 해`;
    if (diff <= 40) return `올해 신생아가 마흔 무렵`;
    if (diff <= 50) return `올해 신생아가 환갑 전까지는 받을 수 있을지도`;
    return `먼 미래... 일단 안심`;
  },

  // counter 카운트업 애니메이션
  animateNumber(el, from, to, duration = 1400, formatter = EF.fmt.bigKrw) {
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const v = from + (to - from) * eased;
      el.textContent = formatter(v);
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  },

  // fetch JSON with cache-bust
  async loadJson(path) {
    const r = await fetch(`${path}?t=${Date.now()}`, { cache: 'no-store' });
    if (!r.ok) throw new Error(`failed to load ${path}: ${r.status}`);
    return r.json();
  },

  // 자산군 한글 라벨
  CLASS_KO: {
    domestic_equity: '국내주식',
    foreign_equity:  '해외주식',
    domestic_bond:   '국내채권',
    foreign_bond:    '해외채권',
    alternative:     '대체투자',
    cash:            '단기자금',
    welfare_other:   '복지·기타',
  },
};

window.EF = EF;
