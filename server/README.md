# Unleash Server

A serverless backend for managing point-cloud annotations built with AWS Lambda, API Gateway, and DynamoDB.

## Overview

This server provides a REST API for storing and managing annotations associated with 3D point cloud models. Each annotation is scoped to a specific `modelId`, allowing multiple models to maintain separate annotation sets.

## Architecture

### Tech Stack

- **Runtime**: Node.js 18.x
- **Language**: TypeScript
- **Framework**: Serverless Framework v3
- **Cloud Provider**: AWS (ap-southeast-2 region)
- **Database**: DynamoDB (on-demand billing)
- **Testing**: Jest with ts-jest

### AWS Services

- **Lambda**: Executes serverless functions
- **API Gateway**: HTTP endpoints for REST API
- **DynamoDB**: NoSQL database for annotation persistence
- **IAM**: Role-based access control for DynamoDB operations

## Project Structure

```
server/
├── src/
│   ├── index.ts                      # Express server (local development)
│   ├── types.ts                      # TypeScript interfaces
│   ├── utils.ts                      # Utility functions
│   ├── handlers/
│   │   └── annotations.ts            # Lambda handler for API Gateway
│   ├── services/
│   │   └── annotations.service.ts    # Business logic for CRUD operations
│   └── db/
│       └── dynamo.ts                 # Database connection (placeholder)
├── tests/
│   ├── annotations.test.ts           # Unit tests for annotation service
│   └── setup.ts                      # Jest configuration
├── serverless.yml                     # Serverless Framework configuration
├── package.json                       # Dependencies and scripts
├── tsconfig.json                      # TypeScript configuration
└── jest.config.js                     # Jest test configuration
```

## API Endpoints

All endpoints are scoped by `modelId` to organize annotations per point cloud model.

### Get All Annotations
```
GET /models/{modelId}/annotations
```
Returns all annotations for a specific model.

**Response**: `200 OK`
```json
[
  {
    "id": "uuid",
    "modelId": "model-123",
    "text": "annotation text",
    ...
  }
]
```

### Create Annotation
```
POST /models/{modelId}/annotations
```
Creates a new annotation. The `id` is auto-generated.

**Request Body**:
```json
{
  "text": "annotation text",
  ...
}
```

**Response**: `201 Created`
```json
{
  "id": "generated-uuid",
  "modelId": "model-123",
  "text": "annotation text",
  ...
}
```

### Update Annotation
```
PATCH /models/{modelId}/annotations/{id}
```
Updates an existing annotation.

**Request Body**:
```json
{
  "text": "updated text",
  ...
}
```

**Response**: `200 OK`
```json
{
  "id": "uuid",
  "modelId": "model-123",
  "text": "updated text",
  ...
}
```

### Delete Annotation
```
DELETE /models/{modelId}/annotations/{id}
```
Deletes an annotation.

**Response**: `204 No Content`

## Data Model

### DynamoDB Schema

**Table Name**: `Annotations`

**Keys**:
- `modelId` (String, HASH): Partition key - groups annotations by model
- `id` (String, RANGE): Sort key - unique identifier for each annotation

**Attributes**: The annotation object supports flexible schema with additional fields beyond the required keys.

### TypeScript Interface

```typescript
export interface Annotation {
  id: string;
  modelId: string;
  [key: string]: any; // Flexible schema for additional fields
}
```

## Development

### Prerequisites

- Node.js 18.x or later
- AWS account (for deployment)
- AWS CLI configured with credentials
- Serverless Framework CLI

### Installation

```bash
npm install
```

### Local Development

Start the Express server for local testing:

```bash
npm start
```

Server runs on `http://localhost:3000`

### Testing

Run the test suite with Jest:

```bash
npm test
```

The service includes in-memory storage for testing, allowing tests to run without AWS credentials.

## Deployment

### Deploy to AWS

```bash
serverless deploy
```

This will:
1. Package the TypeScript code
2. Create CloudFormation stack
3. Deploy Lambda function
4. Set up API Gateway endpoints
5. Create DynamoDB table
6. Configure IAM roles

### Environment Variables

The Lambda function uses:
- `ANNOTATIONS_TABLE`: Name of the DynamoDB table (set automatically by serverless.yml)
- `AWS_REGION`: AWS region for DynamoDB client (defaults to us-east-1, overridden by provider config)

### IAM Permissions

The Lambda execution role has permissions for:
- `dynamodb:GetItem`
- `dynamodb:PutItem`
- `dynamodb:UpdateItem`
- `dynamodb:DeleteItem`
- `dynamodb:Query`

## Service Implementation

### Handler Layer (`handlers/annotations.ts`)

Single Lambda function handling all HTTP methods:
- Routes requests based on `httpMethod`
- Extracts `modelId` and `id` from path parameters
- Delegates to service layer for business logic
- Returns appropriate HTTP status codes

### Service Layer (`services/annotations.service.ts`)

Implements CRUD operations with dual-mode support:
- **Production Mode**: Uses DynamoDB when `ANNOTATIONS_TABLE` env var is set
- **Test Mode**: Uses in-memory storage for unit tests
- Provides functions: `getAll`, `createOne`, `updateOne`, `deleteOne`, `resetAnnotations`

### Database Layer (`db/dynamo.ts`)

Placeholder for future database abstraction (currently empty).

## Testing Strategy

- Unit tests for service layer using in-memory storage
- Tests verify CRUD operations and error handling
- `resetAnnotations()` ensures test isolation
- Covers edge cases like non-existent resources

## Billing

DynamoDB uses **PAY_PER_REQUEST** (on-demand) billing mode, charging only for actual read/write operations. No idle costs for the database.

Lambda is charged per:
- Number of requests
- Execution duration (GB-seconds)

## Future Enhancements

Potential improvements:
- [ ] Add authentication/authorization (Cognito, JWT)
- [ ] Implement request validation with JSON schemas
- [ ] Add pagination for large annotation sets
- [ ] Set up CloudWatch alarms for monitoring
- [ ] Add API versioning
- [ ] Implement caching layer (ElastiCache/DynamoDB DAX)
- [ ] Add CORS configuration for browser clients
- [ ] Set up CI/CD pipeline (GitHub Actions, CodePipeline)

## License

ISC
