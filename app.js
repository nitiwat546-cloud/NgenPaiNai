(() => {
  'use strict';

  const STORE_KEY = 'ngenpainai.v1';
  const PREF_KEY = 'ngenpainai.prefs';

  const CATEGORIES = {
    expense: [
      { id: 'food', name: 'อาหาร', color: '#ff9f43' },
      { id: 'drink', name: 'เครื่องดื่ม', color: '#d9b48f' },
      { id: 'transport', name: 'เดินทาง', color: '#4cc9f0' },
      { id: 'shopping', name: 'ช้อปปิ้ง', color: '#ff7ab8' },
      { id: 'bills', name: 'บิล/ค่าน้ำไฟ', color: '#ffd43b' },
      { id: 'home', name: 'ที่พัก', color: '#a5abff' },
      { id: 'health', name: 'สุขภาพ', color: '#63e6be' },
      { id: 'fun', name: 'บันเทิง', color: '#c39bff' },
      { id: 'merit', name: 'ทำบุญ/ให้', color: '#ffb3a7' },
      { id: 'other', name: 'อื่นๆ', color: '#b4b4ac' },
    ],
    income: [
      { id: 'salary', name: 'เงินเดือน', color: '#e9ff8a' },
      { id: 'side', name: 'รายได้เสริม', color: '#ffe066' },
      { id: 'gift', name: 'ได้รับ/ของขวัญ', color: '#ff9fbd' },
      { id: 'refund', name: 'เงินคืน', color: '#80c8ff' },
      { id: 'other-in', name: 'อื่นๆ', color: '#d0d4d8' },
    ],
  };
  const UNKNOWN_CAT = { id: 'unknown', name: 'ไม่ระบุ', color: '#b4b4ac' };

  const $ = (id) => document.getElementById(id);
  const numFmt = new Intl.NumberFormat('th-TH', { maximumFractionDigits: 2 });
  const intFmt = new Intl.NumberFormat('th-TH', { maximumFractionDigits: 0 });
  const monthFmt = new Intl.DateTimeFormat('th-TH', { month: 'long', year: 'numeric' });
  const dayFmt = new Intl.DateTimeFormat('th-TH', { weekday: 'short', day: 'numeric', month: 'short' });
  const fullDayFmt = new Intl.DateTimeFormat('th-TH', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  // ---------- storage ----------
  function isValidTx(t) {
    return t && typeof t.id === 'string'
      && (t.type === 'income' || t.type === 'expense')
      && Number.isFinite(t.amount) && t.amount > 0
      && typeof t.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(t.date);
  }
  const validBudget = (b) => (Number.isFinite(b) && b > 0 ? b : 0);
  function isValidFixed(f) {
    return f && typeof f.id === 'string' && typeof f.name === 'string' && f.name.trim() !== ''
      && Number.isFinite(f.amount) && f.amount > 0
      && typeof f.since === 'string' && /^\d{4}-\d{2}$/.test(f.since)
      && (f.until == null || /^\d{4}-\d{2}$/.test(f.until));
  }

  function loadData() {
    try {
      const data = JSON.parse(localStorage.getItem(STORE_KEY) || 'null');
      return {
        txs: data && Array.isArray(data.txs) ? data.txs.filter(isValidTx) : [],
        budget: validBudget(data && data.budget),
        fixed: data && Array.isArray(data.fixed) ? data.fixed.filter(isValidFixed) : [],
      };
    } catch {
      return { txs: [], budget: 0, fixed: [] };
    }
  }

  function loadPrefs() {
    try { return JSON.parse(localStorage.getItem(PREF_KEY) || '{}') || {}; } catch { return {}; }
  }

  function persist() {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify({ version: 1, txs, budget, fixed }));
    } catch {
      toast('บันทึกลงเครื่องไม่สำเร็จ พื้นที่เบราว์เซอร์อาจเต็มหรือถูกปิดไว้');
    }
  }

  function savePrefs() {
    try { localStorage.setItem(PREF_KEY, JSON.stringify(prefs)); } catch { /* ไม่สำคัญ */ }
  }

  let { txs, budget, fixed } = loadData();
  const prefs = loadPrefs();
  const newIds = new Set(); // รายการที่จดในรอบนี้

  // ---------- helpers ----------
  const pad = (n) => String(n).padStart(2, '0');
  const isoDate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const todayISO = () => isoDate(new Date());
  const thisMonth = () => todayISO().slice(0, 7);
  const parseISO = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };

  function shiftMonth(ym, delta) {
    const [y, m] = ym.split('-').map(Number);
    const d = new Date(y, m - 1 + delta, 1);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
  }
  function daysInMonth(ym) {
    const [y, m] = ym.split('-').map(Number);
    return new Date(y, m, 0).getDate();
  }

  const money = (n) => '฿' + numFmt.format(n);
  const signed = (n, type) => (type === 'expense' ? '−' : '+') + money(n);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const icon = (id) => `<svg class="ic" aria-hidden="true"><use href="#i-${id}"/></svg>`;

  function catOf(type, id) {
    return (CATEGORIES[type] || []).find((c) => c.id === id) || UNKNOWN_CAT;
  }
  const tile = (c) => `<span class="tile" style="background:${c.color}">${icon(c.id)}</span>`;

  // รับ "1,250" หรือ "60+45-5" ก็ได้
  function parseAmount(raw) {
    const s = String(raw).replace(/[,\s฿]/g, '');
    if (!/^\d*\.?\d+([+-]\d*\.?\d+)*$/.test(s)) return NaN;
    const total = s.match(/[+-]?\d*\.?\d+/g).reduce((sum, part) => sum + Number(part), 0);
    return Math.round(total * 100) / 100;
  }

  const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  const monthTxs = (ym) => txs.filter((t) => t.date.startsWith(ym));
  const sumOf = (list, type) => list.reduce((s, t) => (t.type === type ? s + t.amount : s), 0);

  // รายจ่ายประจำที่มีผลในเดือนนั้น (since..until เป็นเดือน YYYY-MM)
  const fixedFor = (ym) => fixed.filter((f) => f.since <= ym && (!f.until || ym <= f.until));
  const fixedSum = (ym) => fixedFor(ym).reduce((s, f) => s + f.amount, 0);

  // ---------- state ----------
  const state = {
    month: thisMonth(),
    view: prefs.view === 'stats' ? 'stats' : 'list',
    shown: null,      // ค่าตัวเลขหลักที่แสดงอยู่ เพื่อหมุนนับไปค่าใหม่
    popToday: false,
  };

  // ---------- render ----------
  function render() {
    const [y, m] = state.month.split('-').map(Number);
    const label = $('monthLabel');
    label.textContent = monthFmt.format(new Date(y, m - 1, 1));
    label.classList.toggle('other', state.month !== thisMonth());

    document.querySelectorAll('.tab').forEach((tab) => {
      tab.setAttribute('aria-selected', String(tab.dataset.view === state.view));
    });

    renderAnswer();
    if (state.view === 'list') renderList(); else renderStats();
  }

  // คำนวณสิ่งที่แผงคำตอบต้องบอก
  function answerModel() {
    const ym = state.month;
    const list = monthTxs(ym);
    const fix = fixedSum(ym);
    const exp = sumOf(list, 'expense') + fix;
    const inc = sumOf(list, 'income');
    const dim = daysInMonth(ym);
    const now = thisMonth();
    const when = ym === now ? 'now' : ym < now ? 'past' : 'future';
    const thisWord = when === 'now' ? 'เดือนนี้' : 'เดือนนั้น';
    const base = { list, exp, inc, dim, when, fix };

    if (!budget) {
      return {
        ...base, over: false, value: exp,
        tab: `${thisWord}จ่ายไปแล้ว`,
        line: `<button type="button" class="link-btn" data-action="budget">ตั้งงบรายเดือน</button> เพื่อดูว่าใช้ได้อีกเท่าไร`,
        pace: null,
      };
    }

    const left = budget - exp;
    // เพดานรายวันคิดจากงบที่เหลือหลังหักรายจ่ายประจำ
    const pace = Math.max(0, budget - fix) / dim;
    if (when === 'future') {
      return {
        ...base, over: false, value: left, tab: 'งบเดือนนั้น',
        line: fix ? 'หักรายจ่ายประจำ ' + money(fix) + ' แล้ว ยังมาไม่ถึง' : 'ยังมาไม่ถึง ค่อยมาจดกันนะ',
        pace,
      };
    }
    if (left < 0) {
      return {
        ...base, over: true, value: -left,
        tab: `${thisWord}เกินงบมาแล้ว`,
        line: when === 'now'
          ? `ใช้ไป <b>${money(exp)}</b> จากงบ ${money(budget)} ไม่เป็นไร ค่อยๆ เบรกนะ`
          : `ใช้ไป <b>${money(exp)}</b> จากงบ ${money(budget)} เดือนนี้เอาใหม่`,
        pace,
      };
    }
    if (when === 'past') {
      return {
        ...base, over: false, value: left,
        tab: 'เดือนนั้นเหลือจากงบ',
        line: list.length ? `ใช้ไป <b>${money(exp)}</b> จากงบ ${money(budget)} เก่งมาก` : 'เดือนนั้นไม่ได้จดอะไรไว้',
        pace,
      };
    }
    const daysLeft = dim - new Date().getDate() + 1;
    const perDay = Math.floor(left / daysLeft);
    return {
      ...base, over: false, value: left,
      tab: 'เดือนนี้ใช้ได้อีก',
      line: daysLeft === 1
        ? 'วันสุดท้ายของเดือนแล้ว'
        : `อีก ${daysLeft} วัน · ใช้ได้วันละ <b>${money(perDay)}</b>`,
      pace,
    };
  }

  function renderAnswer() {
    const a = answerModel();
    const el = $('answer');
    el.classList.toggle('over', a.over);

    // แถบฟิล์ม: หนึ่งรูต่อหนึ่งวัน
    const byDay = new Array(a.dim + 1).fill(0);
    for (const t of a.list) if (t.type === 'expense') byDay[Number(t.date.slice(8, 10))] += t.amount;
    const today = new Date().getDate();
    let holes = '';
    let hiDays = 0;
    for (let d = 1; d <= a.dim; d++) {
      const future = a.when === 'future' || (a.when === 'now' && d > today);
      let cls = future ? 'future' : 'none';
      if (!future && byDay[d] > 0) {
        const hi = a.pace !== null && byDay[d] > a.pace;
        if (hi) hiDays++;
        cls = hi ? 'hi' : 'ok';
      }
      if (a.when === 'now' && d === today) cls += ' today' + (state.popToday ? ' pop' : '');
      holes += `<i class="${cls.trim()}"></i>`;
    }
    state.popToday = false;

    const reelLabel = a.pace !== null
      ? `แถบรายวัน ${a.dim} วัน มี ${hiDays} วันที่จ่ายเกินงบเฉลี่ยวันละ ${money(Math.round(a.pace))}`
      : `แถบรายวัน ${a.dim} วัน รูทึบคือวันที่มีรายจ่าย`;

    el.innerHTML = `
      <div class="answer-head"><span class="answer-tab">${a.tab}</span><span class="answer-fill"></span></div>
      <div class="answer-body">
        <p class="answer-num"><span class="cur">฿</span><span id="answerNum">${intFmt.format(Math.round(a.value))}</span></p>
        <p class="answer-line">${a.line}</p>
      </div>
      <div class="reel" role="img" aria-label="${reelLabel}">${holes}</div>`;

    // หมุนตัวเลขจากค่าเดิมไปค่าใหม่
    const target = Math.round(a.value);
    const key = `${state.month}|${a.tab}`;
    if (state.shown && state.shown.key === key && state.shown.value !== target && !reduceMotion.matches) {
      countTo($('answerNum'), state.shown.value, target);
    }
    state.shown = { key, value: target };

    const none = '<span><i class="none"></i>ไม่ได้จ่าย</span>';
    const legend = a.pace !== null
      ? `<span><i style="background:var(--ink)"></i>อยู่ในงบ</span><span><i style="background:var(--coral)"></i>เกินงบวันนั้น</span>${none}`
      : `<span><i style="background:var(--ink)"></i>มีรายจ่าย</span>${none}`;
    $('flow').innerHTML = `
      <span class="legend" title="${a.pace !== null ? 'เทียบกับงบเฉลี่ยวันละ ' + money(Math.round(a.pace)) : ''}">${legend}</span>
      <span style="display:block;margin-top:8px">เงินเข้า <b class="in">${money(a.inc)}</b> · จ่ายไป <b>${money(a.exp)}</b>${a.fix ? ` <span class="flow-note">(รวมประจำ ${money(a.fix)})</span>` : ''}</span>`;
  }

  function countTo(node, from, to) {
    const start = performance.now();
    const dur = 450;
    const step = (now) => {
      const p = Math.min(1, (now - start) / dur);
      const e = 1 - Math.pow(2, -10 * p);
      node.textContent = intFmt.format(Math.round(from + (to - from) * e));
      if (p < 1) requestAnimationFrame(step);
    };
    node.textContent = intFmt.format(from);
    requestAnimationFrame(step);
  }

  function dayLabel(iso) {
    const y = new Date(); y.setDate(y.getDate() - 1);
    if (iso === todayISO()) return { chip: 'วันนี้', now: true };
    if (iso === isoDate(y)) return { chip: 'เมื่อวาน', now: false };
    return { chip: String(parseISO(iso).getDate()), now: false };
  }

  function renderList() {
    const list = monthTxs(state.month)
      .sort((a, b) => b.date.localeCompare(a.date) || (b.createdAt || 0) - (a.createdAt || 0));

    const fixedHtml = fixedSection(state.month);
    if (!list.length) {
      const now = state.month === thisMonth();
      $('view').innerHTML = fixedHtml + `
        <div class="empty">
          <h2>${now ? 'เดือนนี้ยังไม่ได้จดอะไรเลย' : 'เดือนนั้นไม่มีรายการ'}</h2>
          <p>${now ? 'เงินยังไม่ได้ไปไหน หรือแค่ยังไม่ได้จด? กด “จด” มุมขวาล่างได้เลย' : 'ลองเลื่อนไปดูเดือนอื่น หรือกด “จด” เพื่อเติมย้อนหลัง'}</p>
        </div>`;
      return;
    }

    const groups = new Map();
    for (const t of list) {
      if (!groups.has(t.date)) groups.set(t.date, []);
      groups.get(t.date).push(t);
    }

    let html = '';
    for (const [date, items] of groups) {
      const net = sumOf(items, 'income') - sumOf(items, 'expense');
      const label = dayLabel(date);
      html += `
        <section class="day" aria-label="${esc(dayFmt.format(parseISO(date)))}">
          <div class="day-head">
            <span class="chip${label.now ? ' now' : ''}">${label.chip}</span>
            <span class="day-date">${dayFmt.format(parseISO(date))}</span>
            <span class="day-total${net > 0 ? ' in' : ''}">${net === 0 ? money(0) : (net > 0 ? '+' : '−') + money(Math.abs(net))}</span>
          </div>
          <ul class="rows panel">${items.map(txRow).join('')}</ul>
        </section>`;
    }
    $('view').innerHTML = html + fixedHtml;
  }

  function fixedSection(ym) {
    const items = fixedFor(ym);
    if (!items.length) return '';
    const rows = items.map((f) => {
      const c = catOf('expense', f.category);
      return '<li><button class="tx" data-fixed="' + esc(f.id) + '" aria-label="' + esc(f.name) + ' ' + signed(f.amount, 'expense') + ' ต่อเดือน แตะเพื่อแก้ไข">'
        + tile(c)
        + '<span class="tx-main"><span class="tx-title">' + esc(f.name) + '</span><span class="tx-sub">' + esc(c.name) + ' · ทุกเดือน</span></span>'
        + '<span class="tx-amt">' + signed(f.amount, 'expense') + '</span></button></li>';
    }).join('');
    return '<section class="day" aria-label="รายจ่ายประจำ"><div class="day-head">'
      + '<span class="chip fixed">ประจำ</span><span class="day-date">หักอัตโนมัติทุกเดือน</span>'
      + '<span class="day-total">−' + money(fixedSum(ym)) + '</span></div>'
      + '<ul class="rows panel">' + rows + '</ul></section>';
  }

  function txRow(t) {
    const c = catOf(t.type, t.category);
    const title = esc(t.note || c.name);
    const sub = t.note ? `<span class="tx-sub">${esc(c.name)}</span>` : '';
    const fresh = newIds.has(t.id) ? '<span class="new-tag">ใหม่</span>' : '';
    return `
      <li>
        <button class="tx" data-id="${esc(t.id)}" aria-label="${title} ${signed(t.amount, t.type)} แตะเพื่อแก้ไข">
          ${tile(c)}
          <span class="tx-main"><span class="tx-title">${title}</span>${sub}</span>
          ${fresh}
          <span class="tx-amt${t.type === 'income' ? ' in' : ''}">${signed(t.amount, t.type)}</span>
        </button>
      </li>`;
  }

  function breakdown(list, type) {
    const totals = new Map();
    for (const t of list) if (t.type === type) totals.set(t.category, (totals.get(t.category) || 0) + t.amount);
    const sum = [...totals.values()].reduce((a, b) => a + b, 0);
    const rows = [...totals.entries()].sort((a, b) => b[1] - a[1]).map(([id, amt]) => ({ c: catOf(type, id), amt, pct: sum ? (amt / sum) * 100 : 0 }));
    return { sum, rows };
  }

  function breakdownHtml({ rows }) {
    return rows.map((r) => `
      <div class="cat-row">
        ${tile(r.c)}
        <span class="cat-name">${esc(r.c.name)}<small>${r.pct.toFixed(r.pct < 10 ? 1 : 0)}%</small></span>
        <span class="cat-val">${money(r.amt)}</span>
        <span class="meter"><i style="width:${r.pct}%;background:${r.c.color}"></i></span>
      </div>`).join('');
  }

  function renderStats() {
    const list = monthTxs(state.month);
    const fixedAsTx = fixedFor(state.month).map((f) => ({ type: 'expense', amount: f.amount, category: f.category }));
    const exp = breakdown(list.concat(fixedAsTx), 'expense');
    const inc = breakdown(list, 'income');
    const varExp = sumOf(list, 'expense');
    const prevMonth = shiftMonth(state.month, -1);
    const prevExp = sumOf(monthTxs(prevMonth), 'expense') + fixedSum(prevMonth);

    const now = thisMonth();
    let days = 0;
    if (state.month === now) days = new Date().getDate();
    else if (state.month < now) days = daysInMonth(state.month);

    const facts = [];
    if (prevExp > 0 && exp.sum > 0) {
      const diff = ((exp.sum - prevExp) / prevExp) * 100;
      const rounded = Math.abs(diff).toFixed(0);
      facts.push(['เทียบเดือนก่อน', rounded === '0'
        ? 'พอๆ กัน'
        : `<span class="${diff > 0 ? 'up' : 'down'}">จ่าย${diff > 0 ? 'มากขึ้น' : 'น้อยลง'} ${rounded}%</span>`]);
    }
    if (days && varExp > 0) facts.push([fixedAsTx.length ? 'เฉลี่ยจ่ายต่อวัน (ไม่นับประจำ)' : 'เฉลี่ยจ่ายต่อวัน', `${money(Math.round(varExp / days))} <span class="muted">(${days} วัน)</span>`]);
    const biggest = list.filter((t) => t.type === 'expense').sort((a, b) => b.amount - a.amount)[0];
    if (biggest) facts.push(['ก้อนใหญ่สุด', `${esc(biggest.note || catOf('expense', biggest.category).name)} ${money(biggest.amount)}`]);
    facts.push(['จดไปทั้งหมด', `${list.length} รายการ`]);

    $('view').innerHTML = `
      <section class="block panel">
        <h2>${exp.sum ? `จ่ายไป <span class="num">${money(exp.sum)}</span> กับอะไรบ้าง` : 'ยังไม่มีรายจ่ายในเดือนนี้'}</h2>
        ${exp.sum ? breakdownHtml(exp) : '<p class="muted">พอเริ่มจด ตรงนี้จะบอกว่าเงินไปหมวดไหนมากที่สุด</p>'}
      </section>
      <section class="block panel">
        <h2>ตัวเลขน่ารู้</h2>
        <dl class="facts">${facts.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>
      </section>
      <section class="block panel">
        <h2>${inc.sum ? `เงินเข้า <span class="num">${money(inc.sum)}</span> จาก` : 'ยังไม่มีเงินเข้าในเดือนนี้'}</h2>
        ${inc.sum ? breakdownHtml(inc) : '<p class="muted">เงินเดือน รายได้เสริม หรือเงินคืน จดไว้ตรงนี้ได้</p>'}
      </section>`;
  }

  // ---------- จด / แก้ไข ----------
  const txDialog = $('txDialog');
  const txForm = $('txForm');
  let editingId = null;
  let formType = 'expense';
  let formCat = null;
  let sessionCount = 0;

  const lastCat = (type) => (prefs.lastCat || {})[type] || null;

  function openTx(tx) {
    editingId = tx ? tx.id : null;
    sessionCount = 0;
    formType = tx ? tx.type : (prefs.lastType || 'expense');
    formCat = tx ? tx.category : lastCat(formType);
    $('txTitle').textContent = tx ? 'แก้ไขรายการ' : 'จดรายการ';
    $('saveBtn').textContent = tx ? 'บันทึกการแก้ไข' : 'บันทึก';
    $('doneBtn').hidden = !!tx;
    $('amount').value = tx ? String(tx.amount) : '';
    $('note').value = tx ? tx.note || '' : '';
    setDate(tx ? tx.date : (state.month === thisMonth() ? todayISO() : `${state.month}-01`));
    $('deleteBtn').hidden = !tx;
    setMsg('');
    renderForm();
    txDialog.showModal();
    if (!tx) $('amount').focus();
  }

  function renderForm() {
    txForm.dataset.type = formType;
    document.querySelectorAll('#typeSeg button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.type === formType)));
    const cats = CATEGORIES[formType];
    if (!cats.some((c) => c.id === formCat)) formCat = cats[0].id;
    $('catGrid').innerHTML = cats.map((c) => `
      <button type="button" class="cat" data-cat="${c.id}" aria-pressed="${c.id === formCat}">
        ${tile(c)}${esc(c.name)}
      </button>`).join('');
  }

  const yesterdayISO = () => { const y = new Date(); y.setDate(y.getDate() - 1); return isoDate(y); };

  function setDate(iso) {
    $('date').value = iso;
    const which = iso === todayISO() ? 'today' : iso === yesterdayISO() ? 'yesterday' : 'pick';
    document.querySelectorAll('.dchip').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.day === which)));
    $('dateShow').textContent = /^\d{4}-\d{2}-\d{2}$/.test(iso) ? fullDayFmt.format(parseISO(iso)) : '';
  }

  document.querySelector('.date-row').addEventListener('click', (e) => {
    const chip = e.target.closest('.dchip');
    if (!chip) return;
    if (chip.dataset.day === 'today') setDate(todayISO());
    else if (chip.dataset.day === 'yesterday') setDate(yesterdayISO());
    else {
      const input = $('date');
      try { input.showPicker(); } catch { input.focus(); input.click(); }
    }
  });
  $('date').addEventListener('change', (e) => { if (e.target.value) setDate(e.target.value); });

  function setMsg(msg, isErr) {
    const el = $('formMsg');
    el.textContent = msg;
    el.classList.toggle('err', !!isErr);
    el.hidden = !msg;
  }

  $('typeSeg').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-type]');
    if (!btn || btn.dataset.type === formType) return;
    formType = btn.dataset.type;
    formCat = lastCat(formType);
    renderForm();
  });

  $('catGrid').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-cat]');
    if (!btn) return;
    formCat = btn.dataset.cat;
    renderForm();
  });

  txForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const amount = parseAmount($('amount').value);
    if (!(amount > 0)) {
      setMsg('ใส่จำนวนเงินเป็นตัวเลขก่อนนะ เช่น 45 หรือ 60+45', true);
      $('amount').focus();
      return;
    }
    const date = $('date').value;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      setMsg('เลือกวันที่ก่อนนะ', true);
      return;
    }
    const note = $('note').value.trim();

    prefs.lastType = formType;
    prefs.lastCat = { ...(prefs.lastCat || {}), [formType]: formCat };
    savePrefs();

    if (editingId) {
      const t = txs.find((x) => x.id === editingId);
      if (t) Object.assign(t, { type: formType, amount, category: formCat, note, date });
      persist();
      state.month = date.slice(0, 7);
      txDialog.close();
      render();
      toast('แก้ไขแล้ว');
      return;
    }

    const tx = { id: newId(), type: formType, amount, category: formCat, note, date, createdAt: Date.now() };
    txs.push(tx);
    newIds.add(tx.id);
    persist();
    sessionCount++;
    state.month = date.slice(0, 7);
    state.popToday = date === todayISO();
    render();

    // จดต่อได้ทันที: ล้างแค่จำนวนเงินกับโน้ต
    $('amount').value = '';
    $('note').value = '';
    $('amount').focus();
    setMsg(`จดแล้ว ${note || catOf(formType, formCat).name} ${signed(amount, formType)} · รอบนี้ ${sessionCount} รายการ จดต่อได้เลย`);
  });

  $('deleteBtn').addEventListener('click', () => {
    const idx = txs.findIndex((x) => x.id === editingId);
    if (idx < 0) return;
    const [removed] = txs.splice(idx, 1);
    persist();
    txDialog.close();
    render();
    toast('ลบรายการแล้ว', { label: 'เลิกทำ', fn: () => { txs.push(removed); persist(); render(); } });
  });

  $('doneBtn').addEventListener('click', () => txDialog.close());
  $('closeTx').addEventListener('click', () => txDialog.close());

  // ---------- เมนู: งบ + ข้อมูล ----------
  const menuDialog = $('menuDialog');

  function openMenu(focus, fixedId) {
    $('budgetInput').value = budget ? intFmt.format(budget) : '';
    $('menuNote').textContent = `มีทั้งหมด ${txs.length} รายการ ข้อมูลอยู่ในเบราว์เซอร์นี้เท่านั้น ควรสำรองเก็บไว้เป็นระยะ`;
    resetFixedForm();
    renderFixedList();
    menuDialog.showModal();
    if (focus === 'budget') $('budgetInput').focus();
    if (focus === 'fixed') {
      if (fixedId) editFixed(fixedId);
      $('fixedHead').scrollIntoView({ block: 'start' });
    }
  }

  $('menuBtn').addEventListener('click', () => openMenu());

  // ---------- รายจ่ายประจำ ----------
  let fixedEditing = null;
  $('fixedCat').innerHTML = CATEGORIES.expense.map((c) => `<option value="${c.id}">${esc(c.name)}</option>`).join('');

  function renderFixedList() {
    const items = fixedFor(thisMonth());
    $('fixedList').innerHTML = items.map((f) => {
      const c = catOf('expense', f.category);
      return `
        <li>
          <button type="button" class="fixed-row" data-edit="${esc(f.id)}" aria-current="${f.id === fixedEditing}">
            ${tile(c)}<span class="fixed-name">${esc(f.name)}</span><span class="fixed-amt">${money(f.amount)}</span>
          </button>
          <button type="button" class="icon-btn" data-end="${esc(f.id)}" aria-label="เลิกหัก ${esc(f.name)}">${icon('close')}</button>
        </li>`;
    }).join('') + (items.length ? `<li class="fixed-total"><span>รวมต่อเดือน</span><b>${money(fixedSum(thisMonth()))}</b></li>` : '');
  }

  function fixedMsg(msg, isErr) {
    const el = $('fixedMsg');
    el.textContent = msg;
    el.classList.toggle('err', !!isErr);
    el.hidden = !msg;
  }

  function resetFixedForm() {
    fixedEditing = null;
    $('fixedName').value = '';
    $('fixedAmount').value = '';
    $('fixedCat').value = 'home';
    $('fixedSave').textContent = 'เพิ่มรายจ่ายประจำ';
    $('fixedCancel').hidden = true;
    fixedMsg('');
  }

  function editFixed(id) {
    const f = fixed.find((x) => x.id === id);
    if (!f) return;
    fixedEditing = id;
    $('fixedName').value = f.name;
    $('fixedAmount').value = intFmt.format(f.amount);
    $('fixedCat').value = f.category;
    $('fixedSave').textContent = 'บันทึกการแก้ไข';
    $('fixedCancel').hidden = false;
    fixedMsg('');
    renderFixedList();
    $('fixedAmount').focus();
  }

  $('fixedList').addEventListener('click', (e) => {
    const editBtn = e.target.closest('[data-edit]');
    if (editBtn) { editFixed(editBtn.dataset.edit); return; }
    const endBtn = e.target.closest('[data-end]');
    if (!endBtn) return;
    const f = fixed.find((x) => x.id === endBtn.dataset.end);
    if (!f) return;
    const before = JSON.stringify(fixed);
    const now = thisMonth();
    // เดือนก่อนๆ ยังนับรายการนี้ตามเดิม เลิกหักตั้งแต่เดือนนี้
    if (f.since >= now) fixed = fixed.filter((x) => x.id !== f.id);
    else f.until = shiftMonth(now, -1);
    persist();
    resetFixedForm();
    renderFixedList();
    render();
    toast(`เลิกหัก ${f.name} แล้ว`, { label: 'เลิกทำ', fn: () => { fixed = JSON.parse(before); persist(); renderFixedList(); render(); } });
  });

  $('fixedCancel').addEventListener('click', () => { resetFixedForm(); renderFixedList(); });

  $('fixedForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = $('fixedName').value.trim();
    const amount = parseAmount($('fixedAmount').value);
    const category = $('fixedCat').value;
    if (!name) { fixedMsg('ตั้งชื่อก่อนนะ เช่น ค่าห้อง', true); $('fixedName').focus(); return; }
    if (!(amount > 0)) { fixedMsg('ใส่จำนวนเงินเป็นตัวเลขนะ เช่น 3500', true); $('fixedAmount').focus(); return; }
    const now = thisMonth();
    const f = fixedEditing && fixed.find((x) => x.id === fixedEditing);
    if (f && f.since < now && (f.amount !== amount || f.category !== category)) {
      // เก็บยอดเดิมไว้กับเดือนก่อนๆ แล้วเริ่มยอดใหม่ตั้งแต่เดือนนี้
      f.until = shiftMonth(now, -1);
      fixed.push({ id: newId(), name, amount, category, since: now });
    } else if (f) {
      Object.assign(f, { name, amount, category });
    } else {
      fixed.push({ id: newId(), name, amount, category, since: now });
    }
    persist();
    const verb = f ? 'แก้' : 'เพิ่ม';
    resetFixedForm();
    renderFixedList();
    render();
    fixedMsg(`${verb} ${name} ${money(amount)}/เดือน แล้ว`);
  });
  $('budgetInput').addEventListener('blur', (e) => {
    const v = parseAmount(e.target.value);
    if (v > 0) e.target.value = intFmt.format(v);
  });
  $('menuClose').addEventListener('click', () => menuDialog.close());

  $('budgetForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const raw = $('budgetInput').value.trim();
    if (!raw) {
      budget = 0;
      persist();
      menuDialog.close();
      render();
      toast('ยกเลิกงบแล้ว');
      return;
    }
    const val = parseAmount(raw);
    if (!(val > 0)) {
      $('budgetNote').textContent = 'ใส่งบเป็นตัวเลขนะ เช่น 15000';
      $('budgetInput').focus();
      return;
    }
    budget = val;
    persist();
    menuDialog.close();
    render();
    toast(`ตั้งงบเดือนละ ${money(val)} แล้ว`);
  });

  function download(filename, content, mime) {
    const url = URL.createObjectURL(new Blob([content], { type: mime }));
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  $('exportCsv').addEventListener('click', () => {
    const cell = (v) => `"${String(v).replace(/"/g, '""')}"`;
    const rows = [['วันที่', 'ประเภท', 'หมวด', 'จำนวนเงิน', 'บันทึกช่วยจำ']];
    [...txs].sort((a, b) => a.date.localeCompare(b.date)).forEach((t) => {
      rows.push([t.date, t.type === 'income' ? 'รายรับ' : 'รายจ่าย', catOf(t.type, t.category).name, t.amount, t.note || '']);
    });
    fixed.forEach((f) => {
      rows.push([f.since, 'รายจ่ายประจำ', catOf('expense', f.category).name, f.amount, f.name + ' (ทุกเดือนตั้งแต่ ' + f.since + (f.until ? ' ถึง ' + f.until : '') + ')']);
    });
    // BOM เพื่อให้ Excel อ่านภาษาไทยถูก
    download(`ngenpainai-${todayISO()}.csv`, '﻿' + rows.map((r) => r.map(cell).join(',')).join('\r\n'), 'text/csv;charset=utf-8');
    menuDialog.close();
  });

  $('backupJson').addEventListener('click', () => {
    const data = { app: 'ngenpainai', version: 1, exportedAt: new Date().toISOString(), budget, fixed, txs };
    download(`ngenpainai-backup-${todayISO()}.json`, JSON.stringify(data, null, 2), 'application/json');
    menuDialog.close();
    toast('ดาวน์โหลดไฟล์สำรองแล้ว');
  });

  $('restoreJson').addEventListener('click', () => $('importFile').click());

  $('importFile').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      const incoming = Array.isArray(data) ? data : data.txs;
      if (!Array.isArray(incoming)) throw new Error('bad format');
      const valid = incoming.filter(isValidTx);
      if (!valid.length) throw new Error('empty');
      if (!confirm(`แทนที่ข้อมูลตอนนี้ (${txs.length} รายการ) ด้วยข้อมูลจากไฟล์ (${valid.length} รายการ) ใช่ไหม?`)) return;
      txs = valid;
      if (!Array.isArray(data) && validBudget(data.budget)) budget = data.budget;
      if (!Array.isArray(data) && Array.isArray(data.fixed)) fixed = data.fixed.filter(isValidFixed);
      newIds.clear();
      persist();
      menuDialog.close();
      render();
      toast(`กู้คืน ${valid.length} รายการแล้ว`);
    } catch {
      toast('ไฟล์นี้ไม่ใช่ไฟล์สำรองของเงินไปไหน');
    }
  });

  $('clearAll').addEventListener('click', () => {
    if (!txs.length && !fixed.length) { toast('ยังไม่มีข้อมูลให้ลบ'); return; }
    if (!confirm(`ลบข้อมูลทั้งหมด ${txs.length} รายการ และรายจ่ายประจำ ${fixed.length} รายการ? ลบแล้วย้อนกลับไม่ได้ (แนะนำให้สำรองข้อมูลก่อน)`)) return;
    txs = [];
    fixed = [];
    newIds.clear();
    persist();
    menuDialog.close();
    render();
    toast('ลบข้อมูลทั้งหมดแล้ว');
  });

  // ---------- toast ----------
  let toastTimer;
  function toast(msg, action) {
    const el = $('toast');
    el.innerHTML = `<span>${esc(msg)}</span>${action ? `<button type="button">${esc(action.label)}</button>` : ''}`;
    if (action) {
      el.querySelector('button').addEventListener('click', () => {
        action.fn();
        el.classList.remove('show');
      }, { once: true });
    }
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), action ? 5000 : 2600);
  }

  // ---------- wiring ----------
  $('addBtn').addEventListener('click', () => openTx(null));
  $('prevMonth').addEventListener('click', () => { state.month = shiftMonth(state.month, -1); render(); });
  $('nextMonth').addEventListener('click', () => { state.month = shiftMonth(state.month, 1); render(); });
  $('monthLabel').addEventListener('click', () => { state.month = thisMonth(); render(); });

  document.querySelector('.tabs').addEventListener('click', (e) => {
    const tab = e.target.closest('[data-view]');
    if (!tab) return;
    state.view = tab.dataset.view;
    prefs.view = state.view;
    savePrefs();
    render();
  });

  $('answer').addEventListener('click', (e) => {
    if (e.target.closest('[data-action="budget"]')) openMenu('budget');
  });

  $('view').addEventListener('click', (e) => {
    const row = e.target.closest('.tx');
    if (!row) return;
    if (row.dataset.fixed) { openMenu('fixed', row.dataset.fixed); return; }
    const tx = txs.find((t) => t.id === row.dataset.id);
    if (tx) openTx(tx);
  });

  // คลิกพื้นหลังมืดเพื่อปิด
  for (const dlg of [txDialog, menuDialog]) {
    dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
  }

  // กด N เพื่อจดเร็วๆ บนคอม
  document.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() !== 'n' || e.ctrlKey || e.metaKey || e.altKey) return;
    if (document.querySelector('dialog[open]') || /INPUT|TEXTAREA/.test(document.activeElement.tagName)) return;
    e.preventDefault();
    openTx(null);
  });

  render();
})();
