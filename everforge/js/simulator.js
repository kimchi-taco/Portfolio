// Everforge — client-side forecast engine (port of model/fund_forecast.py)

(function() {

function fertilityLagFactor(year, factor, anchor = 2026, lag = 20, ramp = 20) {
  const since = year - anchor;
  if (since < lag) return 1.0;
  const progress = Math.min(1.0, (since - lag) / ramp);
  return 1.0 + (factor - 1.0) * progress;
}

function isBase(scenario, base, tol = 1e-6) {
  return Object.keys(base).every(k => Math.abs(scenario[k] - base[k]) < tol);
}

// project(scenario, baseTraj, baseAssumptions, options?)
//   options.startYear:    int — year at which to start forecasting (history kept unchanged)
//   options.startBalance: float — override the balance at startYear (조원)
// → {year: {balance, revenue, expenditure, return_income}}
window.EF_project = function(scenario, baseTraj, baseAssum, options) {
  options = options || {};
  const years = Object.keys(baseTraj).map(Number).sort((a, b) => a - b);
  const startYear = options.startYear != null ? options.startYear : years[0];
  const hasBalanceOverride = options.startBalance != null;

  if (isBase(scenario, baseAssum) && !hasBalanceOverride && startYear === years[0]) {
    return JSON.parse(JSON.stringify(baseTraj));
  }

  const rRatio       = scenario.real_return_rate  / baseAssum.real_return_rate;
  const contribRatio = scenario.contribution_rate / baseAssum.contribution_rate;
  const replaceRatio = scenario.replacement_rate  / baseAssum.replacement_rate;
  const fertRatio    = scenario.fertility_rate    / baseAssum.fertility_rate;
  const wagePerYear  = (1.0 + scenario.real_wage_growth) / (1.0 + baseAssum.real_wage_growth);

  const result = {};
  // History before startYear stays unchanged
  for (const y of years) {
    if (y < startYear) result[y] = { ...baseTraj[y] };
  }
  // Seed balance at startYear (with optional override)
  const seedBalance = hasBalanceOverride ? options.startBalance : baseTraj[startYear].balance;
  result[startYear] = { ...baseTraj[startYear], balance: Math.round(seedBalance * 10) / 10 };
  let balance = seedBalance;

  const startIdx = years.indexOf(startYear);
  for (let i = startIdx + 1; i < years.length; i++) {
    const y = years[i];
    const baseY = baseTraj[y];
    const prevY = baseTraj[years[i-1]];
    const anchorYear = startYear;

    const wageEff = Math.pow(wagePerYear, y - anchorYear);
    const fertEff = fertilityLagFactor(y, fertRatio);
    const wageEffBenefit = Math.pow(wageEff, 0.7);

    const revenue     = baseY.revenue     * contribRatio * fertEff * wageEff;
    const expenditure = baseY.expenditure * replaceRatio * wageEffBenefit;

    let returnIncome;
    const prevBaseBalance = prevY.balance;
    const baseReturn = baseY.return_income;
    if (prevBaseBalance > 0) {
      returnIncome = baseReturn * (balance / prevBaseBalance) * rRatio;
    } else {
      returnIncome = balance * scenario.real_return_rate;
    }

    let newBalance = balance + revenue - expenditure + returnIncome;
    if (newBalance < 0) newBalance = 0;

    result[y] = {
      balance:       Math.round(newBalance * 10) / 10,
      revenue:       Math.round(revenue * 10) / 10,
      expenditure:   Math.round(expenditure * 10) / 10,
      return_income: Math.round(returnIncome * 10) / 10,
    };
    balance = newBalance;
  }
  return result;
};

// Estimate current asset given hypothetical proxy levels (others held at current).
// overrides: {KOSPI: level, NASDAQ: level, ...}  — missing proxies use current.
// current = current.json contents (needs .estimate.by_class, .market_levels, .market_changes)
window.EF_estimateAssetForLevels = function(overrides, current) {
  const lvls    = current.market_levels  || {};
  const changes = current.market_changes || {};
  const byClass = current.estimate.by_class;
  // 해외자산은 KRW 환산 위해 환율 변동 반영 (USDKRW change 그대로)
  const fxFactor = 1 + (changes.USDKRW || 0);

  let total = 0;
  for (const [cls, c] of Object.entries(byClass)) {
    const proxy = c.proxy;
    const userLevel = overrides[proxy];
    const lvl = lvls[proxy];
    if (userLevel != null && lvl && lvl.anchor > 0) {
      // 사용자 가정으로 anchor → user_level 까지 보간
      const rawChange = (userLevel / lvl.anchor) - 1;
      // 해외 프록시는 환율 곱
      const isForeign = (proxy === 'NASDAQ' || proxy === 'MSCI_EXUS' || proxy === 'GLOBAL_BOND');
      const effChange = isForeign ? ((1 + rawChange) * fxFactor - 1) : rawChange;
      total += c.anchor_value * (1 + effChange);
    } else {
      total += c.current_value;
    }
  }
  return Math.round(total * 10) / 10;
};

// 후위호환: 기존 호출 그대로 사용 가능
window.EF_estimateAssetForKospi = function(kospiLevel, current) {
  return window.EF_estimateAssetForLevels({KOSPI: kospiLevel}, current);
};

window.EF_depletionYear = function(traj) {
  const years = Object.keys(traj).map(Number).sort((a,b) => a-b);
  for (const y of years) {
    if (traj[y].balance <= 0.0) return y;
  }
  return null;
};

window.EF_peak = function(traj) {
  const years = Object.keys(traj).map(Number).sort((a,b) => a-b);
  let bestY = years[0], bestB = traj[bestY].balance;
  for (const y of years) {
    if (traj[y].balance > bestB) { bestB = traj[y].balance; bestY = y; }
  }
  return { year: bestY, balance: bestB };
};

})();
