const API_BASE = "http://3.228.17.99:30050";

const ddl = document.getElementById('tickerDropdown');
const txtTicker = document.getElementById('tickerInput');
const btnPredict = document.getElementById('btnPredict');
const predResult = document.getElementById('predictionResult');
const historyList = document.getElementById('historyList');
const btnAdd = document.getElementById('btnAdd');
const dateEl = document.getElementById('date');
const priceEl = document.getElementById('price');
const addStatus = document.getElementById('addStatus');
const tickerBadge = document.getElementById('tickerBadge');
const recordCount = document.getElementById('recordCount');
const latestPrice = document.getElementById('latestPrice');
const latestDate = document.getElementById('latestDate');
const trendChart = document.getElementById('trendChart');
const trendSummary = document.getElementById('trendSummary');

ddl.addEventListener('change', () => {
  txtTicker.value = ddl.value;
});

btnPredict.addEventListener('click', async () => {
  const ticker = txtTicker.value.trim().toUpperCase();
  if (!ticker) {
    alert('Enter a ticker symbol');
    return;
  }

  txtTicker.value = ticker;
  tickerBadge.textContent = ticker;
  predResult.textContent = 'Loading forecast...';
  trendSummary.textContent = 'Fetching latest history';

  try {
    const resp = await fetch(`${API_BASE}/predict/${ticker}`);
    const data = await resp.json();
    if (!resp.ok) {
      predResult.textContent = `Error: ${data.error}`;
      predResult.classList.add('is-error');
    } else {
      predResult.classList.remove('is-error');
      predResult.textContent = `$${Number(data.predicted_price).toFixed(2)}`;
    }
  } catch (err) {
    predResult.textContent = `Error: ${err.message}`;
    predResult.classList.add('is-error');
  }

  try {
    const resp = await fetch(`${API_BASE}/history/${ticker}`);
    const hist = await resp.json();
    if (resp.ok) {
      renderHistory(hist);
      renderTrend(hist);
    }
  } catch (err) {
    historyList.innerHTML = `<li><strong>History unavailable</strong><span>${err.message}</span></li>`;
    trendSummary.textContent = 'Unable to load trend';
  }
});

btnAdd.addEventListener('click', async () => {
  const ticker = txtTicker.value.trim().toUpperCase();
  const date = dateEl.value;
  const price = priceEl.value;
  if (!ticker || !date || !price) {
    alert('Fill all fields to add price');
    return;
  }

  try {
    const resp = await fetch(`${API_BASE}/add-price`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ticker,
        date,
        price
      })
    });
    const resj = await resp.json();
    if (!resp.ok) {
      setAddStatus(`Error: ${resj.error}`, false);
    } else {
      setAddStatus('Price added successfully', true);
      btnPredict.click();
    }
  } catch (err) {
    setAddStatus(`Error: ${err.message}`, false);
  }
});

function renderHistory(items) {
  historyList.innerHTML = '';
  recordCount.textContent = items.length;

  if (!items.length) {
    historyList.innerHTML = '<li><strong>No records found</strong><span>--</span></li>';
    latestPrice.textContent = '--';
    latestDate.textContent = 'No data returned';
    return;
  }

  items.forEach(item => {
    const li = document.createElement('li');
    const date = formatDate(item.date);
    const price = Number(item.close_price).toFixed(2);
    li.innerHTML = `<strong>${date}</strong><span>$${price}</span>`;
    historyList.appendChild(li);
  });

  const latest = items[items.length - 1];
  latestPrice.textContent = `$${Number(latest.close_price).toFixed(2)}`;
  latestDate.textContent = formatDate(latest.date);
}

function renderTrend(items) {
  trendChart.innerHTML = '';
  if (!items.length) {
    trendSummary.textContent = 'No data available';
    return;
  }

  const values = items.map(item => Number(item.close_price));
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(max - min, 1);

  items.forEach(item => {
    const value = Number(item.close_price);
    const height = 18 + ((value - min) / range) * 82;
    const bar = document.createElement('div');
    bar.className = 'trend-bar';
    bar.style.height = `${height}%`;
    bar.dataset.label = `${formatShortDate(item.date)} $${value.toFixed(2)}`;
    trendChart.appendChild(bar);
  });

  const direction = values[values.length - 1] >= values[0] ? 'up' : 'down';
  trendSummary.textContent = `${items.length} records, ${direction} from first close`;
}

function formatDate(value) {
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric'
  });
}

function formatShortDate(value) {
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit'
  });
}

function setAddStatus(message, success) {
  addStatus.textContent = message;
  addStatus.classList.toggle('is-success', success);
  addStatus.classList.toggle('is-error', !success);
}
