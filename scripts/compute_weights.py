#!/usr/bin/env python3
"""
Compute portfolio weights from a private holdings file and output a public weights.json
that contains only tickers and percentage weights (no dollar amounts, no share counts).

Usage:
  python3 scripts/compute_weights.py \
      --input data/holdings.private.json \
      --output data/weights.json [--fetch]

Input schema (JSON):
{
  "as_of": "YYYY-MM-DD",
  "currency": "USD",
  "positions": [ {"ticker": "AAPL", "shares": 10, "price": 190.0}, ... ]
}

Notes:
- If --fetch is provided, the script will try to fetch prices using yfinance when
  a position has no price. Install with: pip install yfinance
"""
import argparse
import json
import sys
from pathlib import Path


def maybe_fetch_price(ticker: str):
    try:
        import yfinance as yf  # type: ignore
    except Exception:
        return None
    try:
        t = yf.Ticker(ticker)
        info = t.fast_info  # faster than .info
        price = getattr(info, 'last_price', None) or info.get('last_price')
        if price is None:
            hist = t.history(period='1d')
            if not hist.empty:
                price = float(hist['Close'][-1])
        return float(price) if price is not None else None
    except Exception:
        return None


def main():
    p = argparse.ArgumentParser()
    p.add_argument('--input', default='data/holdings.private.json')
    p.add_argument('--output', default='data/weights.json')
    p.add_argument('--fetch', action='store_true', help='Fetch missing prices with yfinance')
    args = p.parse_args()

    inp = Path(args.input)
    if not inp.exists():
        print(f"Input not found: {inp}. See data/holdings.private.json.example", file=sys.stderr)
        sys.exit(1)

    obj = json.loads(inp.read_text())
    positions = obj.get('positions', [])
    if not positions:
        print('No positions found in input.', file=sys.stderr)
        sys.exit(1)

    enriched = []
    for pos in positions:
        ticker = str(pos['ticker']).upper()

        # Allow direct notional override for assets like CASH
        if 'value' in pos and pos['value'] is not None:
            try:
                value = float(pos['value'])
            except Exception:
                print(f"Warning: {ticker} has non-numeric value; skipping.", file=sys.stderr)
                continue
            enriched.append({'ticker': ticker, 'value': value})
            continue

        shares = float(pos.get('shares', 0) or 0)
        price = pos.get('price')

        # Treat cash-like tickers with price=1 if not provided
        cash_like = { 'CASH', 'USD', 'CASHUSD' }
        if ticker in cash_like and price is None:
            price = 1.0

        # Fetch price if missing and allowed
        if price is None and args.fetch:
            price = maybe_fetch_price(ticker)

        if price is None:
            print(f"Warning: {ticker} has no price; defaulting to 1.0 (equal-weight by shares).", file=sys.stderr)
            price = 1.0

        value = shares * float(price)
        enriched.append({'ticker': ticker, 'value': value})

    total = sum(p['value'] for p in enriched)
    if total <= 0:
        print('Total portfolio value is zero or negative.', file=sys.stderr)
        sys.exit(1)

    # Normalize and round weights; filter negligible negatives due to floats
    weights = []
    for e in enriched:
        w = 100 * e['value'] / total
        if w < 0 and w > -1e-9:
            w = 0.0
        weights.append({ 'ticker': e['ticker'], 'weight': round(w, 4) })

    outp = Path(args.output)
    outp.parent.mkdir(parents=True, exist_ok=True)
    outp.write_text(json.dumps(weights, indent=2))
    print(f"Wrote weights to {outp}")


if __name__ == '__main__':
    main()
