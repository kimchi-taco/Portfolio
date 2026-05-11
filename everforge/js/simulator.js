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

// Estimate current asset given a hypothetical KOSPI level (others held at current).
// current = current.json contents (needs .estimate.by_class anchor_value & .market_levels)
window.EF_estimateAssetForKospi = function(kospiLevel, current) {
  const lvls = current.market_levels || {};
  const ko = lvls.KOSPI;
  if (!ko || !ko.anchor) return current.estimate.estimated_total;

  const byClass = current.estimate.by_class;
  let total = 0;
  for (const [cls, c] of Object.entries(byClass)) {
    if (c.proxy === 'KOSPI') {
      // 사용자 KOSPI 가정으로 재계산
      const change = (kospiLevel / ko.anchor) - 1;
      total += c.anchor_value * (1 + change);
    } else {
      // 다른 자산군은 현재 추정 그대로
      total += c.current_value;
    }
  }
  return Math.round(total * 10) / 10;
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
