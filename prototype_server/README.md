# WorldPedia — Prototype

A comprehensive world countries information platform.

## Stack
- **Frontend**: HTML5 + CSS3 + Bootstrap 5 + jQuery 3 + Font Awesome 6
- **Backend**: Python 3.10+ + FastAPI + Jinja2 templates
- **Data**: CSV files (upgrade path: PostgreSQL / SQLite)
- **Monetisation**: Amazon affiliate links (products, books)

## Structure

```
worldpedia/
├── backend/
│   └── main.py              # FastAPI app + routing
├── frontend/
│   ├── static/
│   │   ├── css/worldpedia.css
│   │   └── js/worldpedia.js
│   └── templates/
│       ├── base.html
│       ├── index.html       # Homepage: country list
│       ├── country.html     # Country detail page
│       ├── history.html     # History timeline page
│       ├── divisions.html   # All divisions list with phonetics
│       └── division.html    # Individual division page
├── data/
│   ├── countries.csv
│   ├── languages.csv
│   ├── politics.csv
│   ├── division_types.csv
│   ├── divisions.csv        # Regions with native names + phonetics
│   ├── persons.csv          # Notable people (country + division linked)
│   ├── festivals.csv        # Festivals (country + division linked)
│   ├── foods.csv
│   ├── attractions.csv
│   ├── movies.csv
│   ├── books.csv
│   ├── history.csv
│   └── products.csv         # Amazon affiliate products
├── requirements.txt
└── README.md
```

## Setup & Run

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Run the development server
cd backend
python main.py
# OR: uvicorn main:app --reload --host 0.0.0.0 --port 8000

# 3. Visit http://localhost:8000
```

## Key URLs (with Denmark data)
- `/`                                — Homepage, country list
- `/country/denmark`                 — Denmark full page
- `/country/denmark/history`         — Denmark history timeline
- `/country/denmark/divisions`       — All regions with phonetics
- `/country/denmark/division/capital-region` — Capital Region detail
- `/api/countries`                   — JSON API
- `/api/country/denmark`             — Country JSON API

## Data Relationships (CSV)

Content items are linked to both countries AND divisions via comma-separated ID lists:
- `country_ids = "1"` → belongs to country 1
- `division_ids = "1,4"` → shows on Capital Region AND Central Denmark pages

This allows a person like Lars von Trier to appear on both:
- `/country/denmark` (persons section)
- `/country/denmark/division/central-denmark` (his home region)

Similarly, a festival like Roskilde appears on:
- `/country/denmark` (festivals section)  
- `/country/denmark/division/zealand` (it's held there)

## Planned Sections (not yet implemented)
- Art & Sculptures
- Transportation Guide (flight affiliate links)
- Ongoing & Upcoming Events
- Major Awards
- Written Articles
- More administrative division levels (municipalities)
- Gallery images
- YouTube recommendations
- Movie ticket affiliate links

## Monetisation Plan
1. **Amazon Affiliates** — Product recommendations + book links
2. **Flight Affiliates** — Transportation guide (Skyscanner/Booking.com)
3. **Movie Tickets** — Affiliate links for streaming/booking
4. **Premium Content** — In-depth articles, detailed guides (future)

## Adding More Countries
1. Add row to `data/countries.csv`
2. Add rows to all other CSV files with new `country_id`
3. No code changes required — fully data-driven

## Upgrade Path
- CSV → SQLite → PostgreSQL (minimal code changes, same API)
- Add full-text search with Meilisearch
- Add image CDN (Cloudflare R2 / S3)
- Server-side rendering → optionally add React for interactive components
