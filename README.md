# Bilkent.IO

**A centralized operations platform for university tours and information-office teams.**

[Open the live web app](https://bilkentio.vercel.app)

## Problem

University information offices coordinate school visits, individual tours, guides, advisors, counselors, fairs, feedback, and reporting. When those workflows live in spreadsheets and separate message threads, staff lose visibility into schedules, responsibilities, and follow-up.

## Approach

Bilkent.IO models the complete tour lifecycle in one role-based system:

- Counselors and individuals submit visit requests and track their status.
- Advisors and coordinators review forms, schedule tours, and manage availability.
- Guides discover assignments, join tours, update progress, and receive feedback.
- Presidents and administrators manage staff, schools, fairs, and operational data.
- Analytics endpoints aggregate school, city, time, feedback, guide, and trend data.
- A Spring AI assistant retrieves Bilkent information from a ChromaDB knowledge base and keeps short-lived conversation context in Redis.
- A separate Python pipeline prepares and prioritizes school data used by the platform.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Web frontend | React 18, React Router, Bootstrap, Axios, Chart.js, Recharts |
| Backend | Java 17, Spring Boot 3.3, Spring Security, Spring Data JPA |
| Data | PostgreSQL, Redis, ChromaDB |
| AI and retrieval | Spring AI, OpenAI API, sentence-transformers |
| Supporting tools | Python, pandas, Flask, Beautiful Soup |
| Build and local services | Maven, npm, Docker Compose |

The repository also contains an early Flutter client, while the maintained product interface is the React application.

## Setup

### Prerequisites

- Java 17
- Node.js 18+ and npm
- Docker with Docker Compose, or local PostgreSQL and Redis instances
- An OpenAI API key for the assistant feature

Clone the project:

```bash
git clone https://github.com/asyau/bilkentio.git
cd bilkentio
```

### Start PostgreSQL and Redis

Review the development credentials in `database_docker/docker-compose.yml`, then run:

```bash
cd database_docker
docker compose up -d
cd ..
```

### Configure and run the backend

Spring Boot can read configuration from environment variables. At minimum, provide values appropriate for your machine:

```env
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/bilkentio
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=your_local_password
JWT_SECRET=replace_with_a_long_random_value
SPRING_AI_OPENAI_API_KEY=your_openai_api_key
SPRING_DATA_REDIS_HOST=localhost
SPRING_DATA_REDIS_PORT=6379
```

Mail settings are required only for email-driven flows. Start the API:

```bash
cd bilkentio-backend
./mvnw spring-boot:run
```

The backend listens on `http://localhost:8080`.

### Run the frontend

In another terminal:

```bash
cd bilkentio/bilkentio-frontend
npm install
npm start
```

The React client opens at `http://localhost:3000` and currently expects the backend at `http://localhost:8080`.

## Demo

The deployed frontend is available at [bilkentio.vercel.app](https://bilkentio.vercel.app).

Core demo flows include:

1. Submit a school or individual tour request.
2. Review and approve the request from an advisor/coordinator workspace.
3. Assign or join a guide and manage the tour status.
4. Submit feedback and review guide or operations analytics.
5. Ask the information assistant a Bilkent-related question.

Some flows require a configured backend and role-specific account; the public frontend deployment may not expose every integration.

## Results

- The codebase contains 34 React page modules covering seven role-oriented experiences.
- The Spring Boot backend contains 13 controllers and 92 mapped HTTP handlers for authentication, users, tours, forms, guides, fairs, schools, analytics, scheduling, and the assistant.
- PostgreSQL persists the operational model; Redis supports assistant conversation caching; analytics and school-priority pipelines extend the core workflow.
- A live frontend deployment is available, but the repository does not currently publish usability metrics, production traffic, performance benchmarks, or broad automated test coverage.

## Repository Structure

```text
bilkentio-frontend/              React web application
bilkentio-backend/               Spring Boot API and domain modules
database_docker/                 PostgreSQL and Redis development services
bilkentwebsite-pythonscraper/    Bilkent content ingestion and vector-store helpers
schoolprioritygrouping/           School ranking and data-preparation scripts
flutterapp/                       Early cross-platform client
DeveloperDocumentation.md        Extended project documentation
```

## Next Steps

- Move all credentials and deployment-specific values to environment-only configuration and enable secret scanning.
- Replace hard-coded frontend API URLs with environment-based configuration.
- Add focused backend unit/integration tests and frontend end-to-end tests for each role-critical flow.
- Document seed data and demo accounts so reviewers can reproduce the complete workflow locally.
- Add screenshots for the counselor, coordinator, guide, analytics, and assistant experiences.
- Add CI for backend tests, frontend tests, and production builds.
- Remove generated build artifacts from version control and separate the maintained React client from archived experiments.

## Team

- Asya Ünal
- Aybars Buğra Aksoy
- Barış Yaycı
- Eren Berk Eraslan

Built as the CS 319 group project at Bilkent University.
