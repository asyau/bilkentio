# Bilkent.IO

**A centralized operations platform for university tours and information-office teams.**

[Live demo](https://bilkentio.vercel.app)

Bilkent.IO replaces spreadsheets and fragmented communication with one full-stack system for school tour requests, guide assignment, scheduling, prioritization, feedback, fairs, and operational analytics.

## Core capabilities

- School tour applications with duplicate detection and terms confirmation
- Shared calendar for availability, reservations, and tour plans
- Role-based workflows for administrators, advisors, coordinators, guides, and teachers
- Guide assignment, levels, points, availability, and post-tour feedback
- School prioritization and operational analytics dashboards
- University-fair invitations and event management
- AI-assisted information retrieval with Spring AI and Redis-backed services

## Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 18, React Router, Bootstrap, Chart.js, Recharts |
| Backend | Java 17, Spring Boot 3, Spring Security, Spring Data JPA |
| Data | PostgreSQL, Redis |
| AI | Spring AI, OpenAI integration |
| Build | Maven, npm |

## Repository structure

```text
bilkentio-frontend/    React client and dashboards
bilkentio-backend/     Spring Boot API and domain modules
```

## Run locally

### Backend

Configure PostgreSQL, Redis, mail, JWT, and AI settings for your environment, then run:

```bash
cd bilkentio-backend
./mvnw spring-boot:run
```

### Frontend

```bash
cd bilkentio-frontend
npm install
npm start
```

## Team

- Asya Ünal
- Aybars Buğra Aksoy
- Barış Yaycı
- Eren Berk Eraslan

Built as the CS 319 group project at Bilkent University.