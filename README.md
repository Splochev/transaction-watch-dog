# Transaction Watch Dog

A modular, extensible Ethereum blockchain monitoring service with dynamic rule-based configuration, persistent storage, and robust logging.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Folder Structure](#folder-structure)
- [Requirements](#requirements)
- [Setup & Installation](#setup--installation)
- [Database Migration](#database-migration)
- [Configuration](#configuration)
- [API Usage](#api-usage)
- [Logging](#logging)
- [Development](#development)
- [Testing](#testing)

---

## Overview

**Transaction Watch Dog** monitors the Ethereum blockchain for transactions matching user-defined rules. When a transaction matches a rule, it is stored in a PostgreSQL database, tagged with the rule that triggered it. The system supports dynamic, hot-reloadable configuration and exposes a REST API for managing rules and querying transactions.

---

## Features

- **Dynamic Rule Configuration**: Add, update, or remove monitoring rules via API or by editing `configuration.json`.
- **Hot Reload**: Configuration changes are detected and applied without restarting the server.
- **Ethereum Monitoring**: Uses Infura and ethers.js to watch for relevant transactions in real time.
- **Persistent Storage**: Matching transactions are stored in PostgreSQL, with rule association.
- **Robust Logging**: Winston-based logging with daily log files and automatic cleanup.
- **REST API**: Full CRUD for configuration and querying of stored transactions.
- **Block Delay Support**: Optionally delay processing by a configurable number of blocks.

---

## Folder Structure

```
|-- README.md
|-- TASK.md
|-- configuration.json
|-- logs
|   |-- logs-2025-05-11.log
|   `-- logs-2025-05-12.log
|-- migrations
|   `-- 20250510153738-create-transaction.js
|-- models
|   |-- index.js
|   `-- transaction.js
|-- package-lock.json
|-- package.json
|-- src
|   |-- api
|   |   |-- controllers
|   |   |   |-- configuration.js
|   |   |   `-- ethereum.js
|   |   |-- index.js
|   |   `-- routers
|   |       |-- configuration.js
|   |       `-- ethereum.js
|   |-- container
|   |   `-- index.js
|   |-- db
|   |   |-- config.js
|   |   `-- index.js
|   |-- index.js
|   |-- logger
|   |   `-- logger.js
|   |-- schemas
|   |   `-- configuration.js
|   |-- services
|   |   |-- configuration-service.js
|   |   `-- ethereum-service.js
|   |-- utils
|   |   `-- error-handler.js
|   `-- validators
|       `-- configuration.js
`-- tests
    |-- api
    |   |-- configuration.controller.test.js
    |   `-- ethereum.controller.test.js
    |-- schemas
    |   `-- configuration-schema.test.js
    |-- services
    |   |-- configuration-service.test.js
    |   `-- ethereum-service.test.js
    `-- utils
        `-- error-handler.test.js
```

---

## Requirements

- **Node.js**: v22.14.0
- **PostgreSQL**: Any recent version
- **Infura API Key**: For Ethereum mainnet access

---

## Setup & Installation

1. **Clone the repository:**

   ```sh
   git clone https://github.com/Splochev/transaction-watch-dog.git
   cd transaction-watch-dog
   ```

2. **Install dependencies:**

   ```sh
   npm install
   ```

3. **Configure environment variables:**
   - Copy `.env.sample` to `.env` and fill in your values:
     ```sh
     cp .env.sample .env
     ```
   - Set your Infura API key, database credentials, and other settings.

---

## Database Migration

1. **Run migrations to set up the database schema:**

   ```sh
   npx sequelize-cli db:migrate
   ```

---

## Configuration

- **Dynamic Rules**: Rules are defined in `configuration.json` and can be managed via the API.
- **Hot Reload**: Changes to `configuration.json` are detected and applied automatically.
- **Environment Variables**: See `.env.sample` for all available options.
- **Edit configurations** via the API or directly in `configuration.json`.
---

## API Usage

### Base URL

```
http://localhost:<PORT>/api
```

### Endpoints

#### Configuration

- `GET    /api/config` — Get current configuration
- `POST   /api/config` — Add a new rule
- `PUT    /api/config` — Update an existing rule
- `PUT    /api/config/delay-blocks` — Update block delay
- `DELETE /api/config/:id` — Delete a rule

#### Ethereum Transactions

- `GET    /api/ethereum` — Query stored transactions (supports filters)

### Example: Add a Rule

```sh
curl -X POST http://localhost:3000/api/config \
  -H "Content-Type: application/json" \
  -d '{"id":"rule-007","name":"Monitor Example","enabled":true,"match":{"address":"0x...","topics":["0x..."]}}'
```

---

## Logging

- Logs are stored in the `logs/` directory, one file per day.
- Log retention is controlled by `MAX_DAYS_TO_STORE_LOGS` in your `.env`.
- Console logging can be enabled with `CONSOLE_LOG=true`.
- DB queries logging can be enabled with `LOG_SEQUALIZE=true`

---

## Development

- **Start the server:**

  ```sh
  npm start
  ```

  or for auto-reload on changes:

  ```sh
  npm run dev
  ```

---

## Testing

This project includes a comprehensive suite of unit tests to ensure functionality and reliability.

### Run Tests

To execute the tests, use the following command:

```sh
npm test
```


