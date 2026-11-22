/** RetentionLens Lab 5 static site interactions. No personal information is sent or stored by this calculator. */
(() => {
  'use strict';
  // The official Chatling widget is injected in each HTML page.
  // Some mobile browsers reject unmuted autoplay; the media element is muted and inline.
  const film = document.querySelector('.hero-video');
  if (film) {
    film.muted = true;
    film.defaultMuted = true;
    const playback = film.play();
    if (playback && playback.catch) playback.catch(() => {});
  }
  const inputs = ['customers', 'churn', 'revenue', 'improvement', 'cost'];
  const el = Object.fromEntries(inputs.map(id => [id, document.getElementById(id)]));
  if (!el.customers) return;
  const scenarios = {
    delivery: {
      hypothesis: 'Late or unreliable fulfillment may be causing customer exits. Verify whether churn is concentrated among delayed orders before committing to a fix.',
      decision: 'Compare treatment and control groups. Check both on-time delivery and subsequent repeat purchases before expanding the intervention.',
      values: {customers:18000,churn:12,revenue:72,improvement:25,cost:12000}
    },
    price: {
      hypothesis: 'Competitor promotions may be pulling away price-sensitive customers. First test whether the same cohorts actually cite price, and account for discount-driven margin erosion.',
      decision: 'Run a limited randomized offer and compare incremental contribution profit, not just redemption or retention. Avoid discounting customers who would have stayed.',
      values: {customers:12000,churn:16,revenue:54,improvement:18,cost:10000}
    },
    product: {
      hypothesis: 'Customers may be abandoning the product after a poor first-use experience. Test adoption milestones, returns, and usage patterns before investing in acquisition or price cuts.',
      decision: 'A/B test onboarding improvements, measure activation and cohort retention, and inspect whether gains survive beyond the first month.',
      values: {customers:9000,churn:20,revenue:98,improvement:30,cost:19000}
    }
  };
  let current = 'delivery';
  const formatter = new Intl.NumberFormat('en-US', {style:'currency',currency:'USD',maximumFractionDigits:0});
  const numberFormatter = new Intl.NumberFormat('en-US');
  const display = (id, value) => { const node = document.getElementById(id); if (node) node.textContent = value; };
  const signedMoney = value => `${value < 0 ? '−' : '+'}${formatter.format(Math.abs(value))}`;
  function calculate() {
    const v = Object.fromEntries(inputs.map(id => [id, Number(el[id].value)]));
    display('customers-value', numberFormatter.format(v.customers));
    display('churn-value', `${v.churn}%`);
    display('revenue-value', formatter.format(v.revenue));
    display('improvement-value', `${v.improvement}%`);
    display('cost-value', formatter.format(v.cost));
    const risk = v.customers * (v.churn/100) * v.revenue;
    const recovered = risk * (v.improvement/100);
    const net = recovered - v.cost;
    display('at-risk', formatter.format(risk));
    display('recovered', formatter.format(recovered));
    display('cost-result', formatter.format(v.cost));
    display('net-monthly', signedMoney(net));
    display('net-value', signedMoney(net * 12));
    const large = document.getElementById('net-value');
    large.classList.toggle('negative', net < 0);
    large.classList.toggle('positive', net >= 0);
    const verdict = net > 0 ? 'Modeled upside exceeds cost—but only if the intervention causally reduces churn.' : net === 0 ? 'The modeled value only breaks even. Uncertainty could easily turn it negative.' : 'Modeled intervention costs exceed recovered revenue. Reconsider the investment or target a more effective treatment.';
    display('verdict', verdict);
    display('decision-check', scenarios[current].decision);
  }
  function setScenario(key) {
    current = key;
    Object.entries(scenarios[key].values).forEach(([id, value]) => { el[id].value = String(value); });
    display('hypothesis-text', scenarios[key].hypothesis);
    document.querySelectorAll('[data-scenario]').forEach(btn => {
      const active = btn.dataset.scenario === key;
      btn.classList.toggle('selected', active);
      btn.setAttribute('aria-pressed', String(active));
    });
    calculate();
  }
  inputs.forEach(id => el[id].addEventListener('input', calculate));
  document.querySelectorAll('[data-scenario]').forEach(btn => btn.addEventListener('click', () => setScenario(btn.dataset.scenario)));
  document.getElementById('reset-scenario')?.addEventListener('click', () => setScenario(current));
  setScenario(current);
})();
