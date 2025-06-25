<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

# CMP Backend

Backend service for the CMP (Compliance Management Platform) built with NestJS, Prisma, and Azure services.

## Architecture

- **Framework**: NestJS with TypeScript
- **Database**: Azure SQL Database via Prisma ORM
- **File Storage**: Azure Blob Storage
- **API**: GraphQL + REST endpoints for documents
- **Authentication**: Azure Managed Identity (for Azure services)

## Environment Variables

Create a `.env` file or set the following environment variables:

```bash
# Database Configuration
DATABASE_URL="sqlserver://server:port;database=db_name;user=username;password=password;encrypt=true;trustServerCertificate=false"

# Azure Storage Configuration
AZURE_STORAGE_ACCOUNT_NAME="your_storage_account_name"
AZURE_STORAGE_CONTAINER_NAME="cmpdocs"

# Application Configuration
NODE_ENV="production"
PORT="4000"
FRONTEND_URL="https://your-frontend-domain.com"
```

## Features

- **Task Management**: Create and manage tasks with compliance tracking
- **Document Management**: Upload/download documents via REST API
- **Beneficiary Management**: Manage beneficiaries and contacts
- **Compliance Tracking**: Monitor compliance status and deadlines
- **Audit Trail**: History tracking for all changes

## API Endpoints

### GraphQL
- **Endpoint**: `/graphql`
- **Playground**: Available in development mode only

### REST (Documents)
- `POST /documents/upload` - Upload a file
- `GET /documents/download/:id` - Download a file
- `GET /documents` - List all documents
- `GET /documents/:id` - Get document metadata
- `DELETE /documents/:id` - Delete a document

## Development

```bash
# Install dependencies
npm install

# Run database migrations
npx prisma migrate dev

# Start development server
npm run start:dev
```

## Production Deployment

### Docker

```bash
# Build image
docker build -t cmp-backend .

# Run container
docker run -d \
  -p 4000:4000 \
  -e DATABASE_URL="your_database_url" \
  -e AZURE_STORAGE_ACCOUNT_NAME="your_storage_account" \
  -e FRONTEND_URL="your_frontend_url" \
  cmp-backend
```

### Azure Container Apps

1. Build and push image to Azure Container Registry
2. Deploy to Azure Container Apps with Managed Identity
3. Configure environment variables
4. Ensure proper networking and CORS settings

## Security Features

- CORS configuration for production
- Environment-based configuration
- Azure Managed Identity integration
- Non-root container execution
- Input validation and sanitization

## Monitoring

- Application logs via NestJS Logger
- Health check endpoint for container orchestration
- GraphQL introspection (disabled in production)

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://kamilmysliwiec.com)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](LICENSE).
