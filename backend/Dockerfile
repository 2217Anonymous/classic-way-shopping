# classic-way-shopping backend (Postgres — same classic_way DB as admin)
FROM python:3.13-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app
COPY main.py .

RUN mkdir -p /app/uploads/categories /app/uploads/products

EXPOSE 8001

HEALTHCHECK --interval=10s --timeout=5s --start-period=20s --retries=5 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8001/health')"

# Schema migrations are owned by classic-way-admin (Alembic).
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001"]
