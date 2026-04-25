from flask import Flask, request, jsonify
from flask_cors import CORS            # import CORS
from models import fetch_recent_prices, fetch_history, insert_price
from config import Config

app = Flask(__name__)
CORS(app)



@app.errorhandler(Exception)
def handle_all_exceptions(e):
    # Log the full exception
    app.logger.error("Unhandled Exception: %s", str(e), exc_info=True)
    return jsonify({"error": str(e)}), 500

@app.route('/')
def root():
    return jsonify({"message": "Stock Prediction Backend API is running"})

@app.route('/history/<ticker>', methods=['GET'])
def get_history(ticker):
    data = fetch_history(ticker)
    return jsonify(data)

@app.route('/predict/<ticker>', methods=['GET'])
def predict(ticker):
    prices = fetch_recent_prices(ticker, limit=3)
    if not prices:
        return jsonify({"error": "no historical data"}), 400
    prediction = sum(prices) / len(prices)
    return jsonify({"ticker": ticker, "predicted_price": prediction})

@app.route('/add-price', methods=['POST'])
def add_price_endpoint():
    payload = request.json
    ticker = payload.get('ticker')
    date = payload.get('date')
    price = payload.get('price')
    if ticker is None or date is None or price is None:
        return jsonify({"error": "Missing fields"}), 400
    try:
        insert_price(ticker, date, float(price))
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    return jsonify({"status": "ok"})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)

