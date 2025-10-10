const API_BASE = window.location.origin;  
// If backend is on a different host (or port), you might use something like “http://localhost:5000”
// but if your backend + frontend are served under same domain via compose, using origin helps.

document.getElementById('btnPredict').addEventListener('click', async () => {
  const ticker = document.getElementById('ticker').value.trim();
  if (!ticker) {
    alert('Enter a ticker symbol');
    return;
  }

  // fetch prediction
  try {
    const resp = await fetch(`${API_BASE}/predict/${ticker}`);
    const data = await resp.json();
    if (!resp.ok) {
      document.getElementById('predictionResult').textContent = `Error: ${data.error}`;
    } else {
      document.getElementById('predictionResult').textContent =
        `Predicted Price: ${data.predicted_price.toFixed(2)}`;
    }
  } catch (err) {
    document.getElementById('predictionResult').textContent = `Error: ${err.message}`;
  }

  // fetch history
  try {
    const resp2 = await fetch(`${API_BASE}/history/${ticker}`);
    const hist = await resp2.json();
    if (resp2.ok) {
      const ul = document.getElementById('historyList');
      ul.innerHTML = '';
      hist.forEach(item => {
        const li = document.createElement('li');
        li.textContent = `${item.date}: ${item.close_price}`;
        ul.appendChild(li);
      });
    }
  } catch (_) {
    // ignore history fetch error for now
  }
});

document.getElementById('btnAdd').addEventListener('click', async () => {
  const ticker = document.getElementById('ticker').value.trim();
  const date = document.getElementById('date').value;
  const price = document.getElementById('price').value;
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
      document.getElementById('addStatus').textContent = `Error: ${resj.error}`;
    } else {
      document.getElementById('addStatus').textContent = 'Price added successfully';
    }
  } catch (err) {
    document.getElementById('addStatus').textContent = `Error: ${err.message}`;
  }
});
