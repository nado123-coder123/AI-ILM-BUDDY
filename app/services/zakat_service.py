"""
Zakat calculation. Pure arithmetic, no external dependency — prices are
passed in by the caller (mobile app fetches current gold/silver spot
price) rather than hardcoded, since a baked-in price goes stale
immediately and would silently misinform a religious obligation.

Nisab reference weights (traditional, widely agreed):
  - Gold Nisab:   87.48 grams
  - Silver Nisab: 612.36 grams
Which one sets the threshold is a matter of scholarly preference (the
API lets the caller pick); we don't adjudicate that, only compute both
consistently.
"""
from app.models.schemas import ZakatRequest, ZakatResponse

GOLD_NISAB_GRAMS = 87.48
SILVER_NISAB_GRAMS = 612.36
ZAKAT_RATE = 0.025


def calculate_zakat(request: ZakatRequest) -> ZakatResponse:
    gold_value = request.gold_grams * request.gold_price_per_gram
    silver_value = request.silver_grams * request.silver_price_per_gram

    total_wealth = (
        gold_value
        + silver_value
        + request.cash
        + request.savings
        + request.business_assets
        - request.debts_due
    )
    total_wealth = max(total_wealth, 0.0)

    gold_nisab_value = GOLD_NISAB_GRAMS * request.gold_price_per_gram
    silver_nisab_value = SILVER_NISAB_GRAMS * request.silver_price_per_gram
    nisab_threshold = (
        gold_nisab_value if request.nisab_basis == "gold" else silver_nisab_value
    )

    meets_nisab = total_wealth >= nisab_threshold
    zakat_due = round(total_wealth * ZAKAT_RATE, 2) if meets_nisab else 0.0

    return ZakatResponse(
        total_zakatable_wealth=round(total_wealth, 2),
        nisab_threshold=round(nisab_threshold, 2),
        nisab_basis=request.nisab_basis,
        meets_nisab=meets_nisab,
        zakat_due=zakat_due,
        breakdown={
            "gold_value": round(gold_value, 2),
            "silver_value": round(silver_value, 2),
            "cash": round(request.cash, 2),
            "savings": round(request.savings, 2),
            "business_assets": round(request.business_assets, 2),
            "debts_deducted": round(request.debts_due, 2),
        },
    )
