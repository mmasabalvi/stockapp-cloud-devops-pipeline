CREATE TABLE IF NOT EXISTS price_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ticker VARCHAR(10),
  date DATE,
  close_price DOUBLE
);

INSERT INTO price_history (ticker, date, close_price) VALUES 
  ('AAPL', '2025-10-01', 172.5),
  ('AAPL', '2025-10-02', 173.0),
  ('GOOG', '2025-10-01', 2840.0);
