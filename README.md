# Classic Way Shopping

## Docker

The Compose stack includes the API, PostgreSQL, and persistent volumes for
database data and uploaded media. Run the frontend separately outside Docker.

```sh
docker compose up --build
```

Open:

- API documentation: http://localhost:8011/docs
- API health check: http://localhost:8011/health
- PostgreSQL: `localhost:5434`

To customize ports or credentials, copy `.env.example` to `.env` before
building.

Stop the stack without deleting data:

```sh
docker compose down
```

Delete the local database and uploads as well:

```sh
docker compose down --volumes
```

The Compose startup command creates missing tables for a fresh local database.
Production schema migrations remain owned by the `classic-way-admin` project.
