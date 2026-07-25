# Build from classic-way-shopping/backend:
#   docker build -t classic-way-shopping-api .
#
# Or from monorepo root:
#   docker build -f classic-way-shopping/backend/Dockerfile classic-way-shopping/backend
#
# Local run:
#   uvicorn main:app --reload --port 8001
#
# Uploads: mount the same volume as admin at /app/uploads so media URLs match.

FROM python:3.13-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app

WORKDIR /app

COPY requirements.txt /tmp/requirements.txt
RUN pip install --no-cache-dir -r /tmp/requirements.txt

COPY . /app

EXPOSE 8001

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001"]
