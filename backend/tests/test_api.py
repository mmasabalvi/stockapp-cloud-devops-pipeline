import pytest
from app import app

# Monkeypatch models functions to simulate DB

def test_root():
    client = app.test_client()
    resp = client.get('/')
    assert resp.status_code == 200
    assert "Stock Prediction Backend API" in resp.json.get("message", "")

def test_predict_no_data(monkeypatch):
    monkeypatch.setattr('models.fetch_recent_prices', lambda ticker, limit: [])
    client = app.test_client()
    resp = client.get('/predict/XYZ')
    assert resp.status_code == 400
    assert "no historical data" in resp.json.get("error", "")

def test_predict_average(monkeypatch):
    monkeypatch.setattr('models.fetch_recent_prices', lambda ticker, limit: [10, 20, 30])
    client = app.test_client()
    resp = client.get('/predict/AAPL')
    assert resp.status_code == 200
    assert resp.json.get("predicted_price") == 20.0

def test_add_price(monkeypatch):
    # intercept insert_price
    def fake_insert(tk, d, p):
        assert tk == "AAPL"
        assert isinstance(p, float)
    monkeypatch.setattr('models.insert_price', fake_insert)
    client = app.test_client()
    resp = client.post('/add-price', json={"ticker": "AAPL", "date": "2025-10-10", "price": "100.5"})
    assert resp.status_code == 200
    assert resp.json.get("status") == "ok"
