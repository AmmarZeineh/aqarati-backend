# Aqarati — Real-Estate Office API (in progress)

A NestJS REST API for **Aqarati**, a platform for real-estate offices. An office subscribes with a code, adds its team,
manages property listings with photos and private details, and shares single listings or collections with clients
through public links that track their views. The Flutter client is [aqarati-app](https://github.com/AmmarZeineh/aqarati-app).

> 🚧 In development: the data model and authentication are complete; the remaining modules are being implemented.

![NestJS](https://img.shields.io/badge/NestJS-E0234E?logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)
![Swagger](https://img.shields.io/badge/Docs-Swagger-85EA2D?logo=swagger&logoColor=black)

## Done so far

- **Data model** (Prisma, 13 models): users, offices and office members with roles, subscription codes and office
  subscriptions, properties with private details and photos, property collections, public share links with view
  tracking, and an activity log.
- **Auth:** register, log in (Passport local + JWT), current user.
- **Subscriptions:** redeem a subscription code to activate an office.
- **Properties:** read and update a property, upload property photos.
- Swagger API docs, migrations and a seed script.

## Planned

Agencies, clients, inquiries, image handling and public sharing endpoints (modules already scaffolded).

## Tech stack

NestJS 11 · TypeScript · Prisma 7 · PostgreSQL · Passport JWT · bcrypt · Swagger · Jest

## Getting started

```bash
npm install
cp .env.example .env      # DATABASE_URL, JWT_SECRET, PORT
npx prisma migrate dev
npm run seed
npm run start:dev
```

## Author

**Ammar Zeineh**, Flutter Developer · [LinkedIn](https://linkedin.com/in/ammar-zeineh) · [GitHub](https://github.com/AmmarZeineh)
