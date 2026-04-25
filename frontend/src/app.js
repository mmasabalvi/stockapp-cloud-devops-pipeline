const API_BASE = "http://3.228.17.99:30050";

// get elements
const ddl = document.getElementById('tickerDropdown');
const txtTicker = document.getElementById('tickerInput');
const btnPredict = document.getElementById('btnPredict');
const predResult = document.getElementById('predictionResult');
const historyList = document.getElementById('historyList');
const btnAdd = document.getElementById('btnAdd');
const dateEl = document.getElementById('date');
const priceEl = document.getElementById('price');
const addStatus = document.getElementById('addStatus');

// when user selects from dropdown, also set input
ddl.addEventListener('change', () => {
  txtTicker.value = ddl.value;
});

btnPredict.addEventListener('click', async () => {
  const ticker = txtTicker.value.trim();
  if (!ticker) {
    alert('Enter a ticker symbol');
    return;
  }

  // fetch prediction
  try {
    const resp = await fetch(`${API_BASE}/predict/${ticker}`);
    const data = await resp.json();
    if (!resp.ok) {
      predResult.textContent = `Error: ${data.error}`;
    } else {
      predResult.textContent = `Predicted Price: ${data.predicted_price.toFixed(2)}`;
    }
  } catch (err) {
    predResult.textContent = `Error: ${err.message}`;
  }

  // fetch history
  try {
    const resp2 = await fetch(`${API_BASE}/history/${ticker}`);
    const hist = await resp2.json();
    if (resp2.ok) {
      historyList.innerHTML = '';
      hist.forEach(item => {
        const li = document.createElement('li');
        li.textContent = `${item.date}: ${item.close_price}`;
        historyList.appendChild(li);
      });
    }
  } catch (err) {
    console.error("History fetch error:", err);
  }
});

btnAdd.addEventListener('click', async () => {
  const ticker = txtTicker.value.trim();
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
        ticker: ticker,
        date: date,
        price: price
      })
    });
    const resj = await resp.json();
    if (!resp.ok) {
      addStatus.textContent = `Error: ${resj.error}`;
      addStatus.style.color = 'red';
    } else {
      addStatus.textContent = 'Price added successfully';
      addStatus.style.color = 'green';
    }
  } catch (err) {
    addStatus.textContent = `Error: ${err.message}`;
    addStatus.style.color = 'red';
  }
});
