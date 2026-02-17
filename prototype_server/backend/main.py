"""
WorldPedia Backend — FastAPI + CSV
A prototype world countries information platform.
"""
from fastapi import FastAPI, HTTPException, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
import csv
import os
from typing import Optional

# ── App setup ──────────────────────────────────────────────────────────────────
app = FastAPI(title="WorldPedia API", version="0.1.0")
BASE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(BASE, "..", "data")
FRONTEND = os.path.join(BASE, "..", "frontend")

app.mount("/static", StaticFiles(directory=os.path.join(FRONTEND, "static")), name="static")
templates = Jinja2Templates(directory=os.path.join(FRONTEND, "templates"))


# ── CSV Helpers ────────────────────────────────────────────────────────────────
def read_csv(filename: str) -> list[dict]:
    path = os.path.join(DATA, filename)
    if not os.path.exists(path):
        return []
    with open(path, newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))


def find_by(rows: list[dict], field: str, value: str) -> Optional[dict]:
    for r in rows:
        if r.get(field) == str(value):
            return r
    return None


def filter_by(rows: list[dict], field: str, value: str) -> list[dict]:
    return [r for r in rows if str(value) in r.get(field, "").split(",")]


def filter_exact(rows: list[dict], field: str, value: str) -> list[dict]:
    return [r for r in rows if r.get(field) == str(value)]


# ── Data loaders ───────────────────────────────────────────────────────────────
def load_country_data(country_id: str) -> dict:
    """Load all data for a country by id"""
    countries = read_csv("countries.csv")
    country = find_by(countries, "id", country_id) or find_by(countries, "slug", country_id)
    if not country:
        return None
    cid = country["id"]
    return {
        "country": country,
        "languages": filter_exact(read_csv("languages.csv"), "country_id", cid),
        "politics": filter_exact(read_csv("politics.csv"), "country_id", cid),
        "division_types": filter_exact(read_csv("division_types.csv"), "country_id", cid),
        "divisions": filter_exact(read_csv("divisions.csv"), "country_id", cid),
        "persons": filter_by(read_csv("persons.csv"), "country_ids", cid),
        "festivals": filter_by(read_csv("festivals.csv"), "country_ids", cid),
        "foods": filter_by(read_csv("foods.csv"), "country_ids", cid),
        "attractions": filter_by(read_csv("attractions.csv"), "country_ids", cid),
        "movies": filter_by(read_csv("movies.csv"), "country_ids", cid),
        "books": filter_by(read_csv("books.csv"), "country_ids", cid),
        "history": filter_exact(read_csv("history.csv"), "country_id", cid),
        "products": filter_exact(read_csv("products.csv"), "country_id", cid),
    }


# ── Page Routes ────────────────────────────────────────────────────────────────
@app.get("/", response_class=HTMLResponse)
async def homepage(request: Request):
    countries = read_csv("countries.csv")
    return templates.TemplateResponse("index.html", {"request": request, "countries": countries})


@app.get("/country/{slug}", response_class=HTMLResponse)
async def country_page(request: Request, slug: str):
    data = load_country_data(slug)
    if not data:
        raise HTTPException(status_code=404, detail="Country not found")
    return templates.TemplateResponse("country.html", {"request": request, **data})


@app.get("/country/{slug}/history", response_class=HTMLResponse)
async def history_page(request: Request, slug: str):
    data = load_country_data(slug)
    if not data:
        raise HTTPException(status_code=404, detail="Country not found")
    return templates.TemplateResponse("history.html", {"request": request, **data})


@app.get("/country/{slug}/divisions", response_class=HTMLResponse)
async def divisions_page(request: Request, slug: str):
    data = load_country_data(slug)
    if not data:
        raise HTTPException(status_code=404, detail="Country not found")
    return templates.TemplateResponse("divisions.html", {"request": request, **data})


@app.get("/country/{country_slug}/division/{div_slug}", response_class=HTMLResponse)
async def division_page(request: Request, country_slug: str, div_slug: str):
    country_data = load_country_data(country_slug)
    if not country_data:
        raise HTTPException(status_code=404, detail="Country not found")
    division = find_by(country_data["divisions"], "slug", div_slug)
    if not division:
        raise HTTPException(status_code=404, detail="Division not found")
    did = division["id"]
    # Load division-specific data (items that include this division)
    div_data = {
        "persons": filter_by(read_csv("persons.csv"), "division_ids", did),
        "festivals": filter_by(read_csv("festivals.csv"), "division_ids", did),
        "foods": filter_by(read_csv("foods.csv"), "division_ids", did),
        "attractions": filter_by(read_csv("attractions.csv"), "division_id", did),
        "movies": filter_by(read_csv("movies.csv"), "division_ids", did),
        "books": filter_by(read_csv("books.csv"), "division_ids", did),
    }
    return templates.TemplateResponse("division.html", {
        "request": request,
        "country": country_data["country"],
        "division": division,
        **div_data
    })


# ── API Routes (JSON) ──────────────────────────────────────────────────────────
@app.get("/api/countries")
async def api_countries():
    return read_csv("countries.csv")


@app.get("/api/country/{slug}")
async def api_country(slug: str):
    data = load_country_data(slug)
    if not data:
        raise HTTPException(status_code=404)
    return data


@app.get("/api/country/{slug}/history")
async def api_history(slug: str):
    data = load_country_data(slug)
    if not data:
        raise HTTPException(status_code=404)
    return {"history": data["history"], "country": data["country"]}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
