# SchemaKit

A lightweight developer toolkit for generating schemas, validating JSON data, and comparing data structures.

## Features

- **TypeScript Generator** — Generate TypeScript interfaces and types from JSON.
- **Zod Generator** — Generate Zod validation schemas.
- **JSON Schema Generator** — Generate JSON Schema definitions.
- **PostgreSQL SQL Generator** — Generate SQL table definitions from JSON objects.
- **JSON Data Validator** — Validate JSON data against an inferred structure.
- **Mock Data Generator** — Generate dummy records for development and testing.
- **Schema Diff** — Compare two JSON structures and identify added, removed, and changed properties.

## Tech Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- Monaco Editor
- Zod
- Faker.js
- Vitest
- Lucide React

## Getting Started

### Prerequisites

- Node.js
- npm

### Installation

```bash
git clone <your-repository-url>
cd schemakit
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

| Command         | Description                  |
| --------------- | ---------------------------- |
| `npm run dev`   | Start the development server |
| `npm run build` | Build for production         |
| `npm run start` | Start the production server  |
| `npm run lint`  | Run ESLint                   |
| `npm run test`  | Run the Vitest test suite    |

## How It Works

SchemaKit uses JSON input as a reference to generate type definitions, validation schemas, SQL, and sample data. All current generation and validation features run locally in the browser.

## Project Status

SchemaKit is an MVP. Some behavior is inferred from sample data, so generated outputs should be reviewed before being used in production systems.

## License

Add a license before distributing this project publicly.
