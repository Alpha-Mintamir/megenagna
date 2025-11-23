# Megenagna -  መገናኛ

Ethiopian Calendar Meeting Scheduler

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env.local` file:
```
MONGODB_URI=your_mongodb_connection_string
MONGODB_DB=calendarr
```

3. Create database indexes for optimal performance:
```bash
node scripts/create-indexes.js
```

This will create indexes on:
- `id` field (unique) - for fast meeting lookups
- `createdAt` field - for sorting meetings
- `availability.userId` field - for fast availability queries

4. Run development server:
```bash
npm run dev
```

## Testing

### Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests in CI mode
npm run test:ci
```

### Test Structure

- **Unit Tests** (`__tests__/unit/`): Test individual utilities and functions
  - `ethiopian-calendar.test.ts` - Calendar conversion utilities
  - `translations.test.ts` - Translation system
  - `inMemoryMeetings.test.ts` - In-memory meeting storage

- **API Tests** (`__tests__/api/`): Test API route handlers
  - `meetings.test.ts` - Meeting CRUD operations

- **Component Tests** (`__tests__/components/`): Test React components
  - `ThemeToggle.test.tsx` - Theme switching
  - `LanguageToggle.test.tsx` - Language switching
  - `EthiopianDatePicker.test.tsx` - Date picker component

- **Integration Tests** (`__tests__/integration/`): Test complete workflows
  - `meeting-flow.test.ts` - Full meeting lifecycle

- **E2E Tests** (`__tests__/e2e/`): End-to-end user journeys
  - `meeting-creation-flow.test.ts` - Complete user flows

### Test Coverage

The project aims for 70% code coverage across:
- Branches
- Functions
- Lines
- Statements

## Performance Optimizations

- MongoDB connection pooling enabled
- Database indexes for fast queries
- Optimized API routes with reduced round trips
- Efficient query projections (excludes unnecessary fields)

## Features

- ✅ Ethiopian calendar support with Ge'ez numerals
- ✅ Dark mode
- ✅ Mobile responsive
- ✅ Custom meeting durations
- ✅ Calendar system selector (Ethiopian/Gregorian/Both)
- ✅ Real-time availability tracking
- ✅ Amharic language support
- ✅ Comprehensive test suite
