# Unleash - 3D Point Cloud Annotation Platform

A full-stack application for creating, managing, and synchronizing 3D box annotations on point cloud models using Potree viewer.

## Overview

Unleash enables users to interactively annotate 3D point cloud data with spatial notes. Users can draw volumetric boxes around regions of interest, add descriptive notes, and persist annotations both locally and to a cloud backend. The platform is designed for collaborative point cloud analysis, surveying, construction, and spatial data management.

## Architecture

### Client (Frontend)
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **3D Visualization**: Potree 1.8.2
- **State Management**: Custom React hooks
- **Storage**: localStorage (local) + REST API (server sync)

### Server (Backend)
- **Runtime**: Node.js 18.x with TypeScript
- **Framework**: Express 5
- **Deployment Options**: 
  - Local development server
  - AWS Lambda + API Gateway (serverless)
- **Database**: 
  - In-memory (development/testing)
  - DynamoDB (production)
- **Testing**: Jest with TypeScript support

## Project Structure

```
unleash/
├── client/                      # Frontend React application
│   ├── public/
│   │   └── Potree_1.8.2/       # Potree library and point cloud data
│   ├── src/
│   │   ├── componants/          # React components
│   │   │   ├── potree.tsx       # Main viewer component
│   │   │   ├── buttons.tsx      # UI button components
│   │   │   └── modificationTable.tsx
│   │   ├── hooks/               # Custom React hooks
│   │   │   ├── objectsHook.tsx  # Box annotation management
│   │   │   └── useAnnotationSync.tsx  # Server synchronization
│   │   ├── services/
│   │   │   └── annotationsApi.ts  # REST API client
│   │   └── pages/
│   │       └── work.tsx          # Main workspace page
│   ├── package.json
│   └── vite.config.ts
│
├── server/                      # Backend API server
│   ├── src/
│   │   ├── handlers/
│   │   │   └── annotations.ts   # Lambda handler
│   │   ├── services/
│   │   │   └── annotations.service.ts  # Business logic
│   │   ├── db/
│   │   │   └── dynamo.ts        # Database layer
│   │   ├── index.ts             # Express server (development)
│   │   ├── types.ts             # TypeScript interfaces
│   │   └── utils.ts
│   ├── tests/
│   │   └── annotations.test.ts
│   ├── serverless.yml           # Serverless Framework config
│   ├── package.json
│   └── README.md                # Server documentation
│
└── README.md                    # This file
```

## Features

### 3D Annotation Capabilities
- **Interactive Box Drawing**: Click and drag to create 3D volumetric boxes
- **Spatial Transforms**: Resize, rotate, and reposition boxes in 3D space
- **Text Notes**: Attach descriptive text to each annotation
- **Visual Highlighting**: Selected boxes highlight point cloud regions
- **Persistent State**: Auto-save every 2 seconds to capture manual adjustments

### Data Management
- **Local Storage**: Browser-based persistence for offline work
- **Server Sync**: Submit annotations to backend database
- **CRUD Operations**: Create, read, update, and delete annotations
- **Model Scoping**: Organize annotations by point cloud model ID

### User Interface
- **Real-time Preview**: See annotations as you create them
- **Annotation Table**: List view of all saved notes
- **Box Selection**: Click to highlight specific annotations
- **Color-coded Actions**: Intuitive button system for operations

## Getting Started

### Prerequisites
- Node.js 18.x or later
- npm or yarn package manager

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd unleash
```

2. **Install server dependencies**
```bash
cd server
npm install
```

3. **Install client dependencies**
```bash
cd ../client
npm install
```

### Development

1. **Start the backend server** (in one terminal)
```bash
cd server
npm start
```
Server runs on `http://localhost:3000`

2. **Start the frontend** (in another terminal)
```bash
cd client
npm run dev
```
Client runs on `http://localhost:5173` (or as shown in terminal)

3. **Open your browser** and navigate to the client URL

## Usage

### Creating Annotations

1. **Draw a Box**: A box tool starts automatically on load
2. **Position the Box**: Click and drag in the 3D viewer to define the volume
3. **Add a Note**: Type your annotation in the text input field
4. **Save**: Click "Add note" to save the annotation
5. **Create More**: Click "New Box" to add additional annotations

### Managing Annotations

- **Edit Box**: After saving, you can still resize/move boxes in the viewer
- **Delete**: Use the delete button in the annotation table
- **Select**: Click rows in the table to highlight boxes in the 3D view
- **Submit to Server**: Click "Submit to Server" to sync all annotations

### Server Synchronization

The "Submit to Server" button:
- Creates new annotations on the server
- Updates existing annotations with current transforms
- Handles duplicates intelligently (POST → PATCH fallback)
- Shows success/error feedback

## API Endpoints

### Base URL: `http://localhost:3000`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/models/:modelId/annotations` | Get all annotations for a model |
| POST | `/models/:modelId/annotations` | Create a new annotation |
| PATCH | `/models/:modelId/annotations/:id` | Update an annotation |
| DELETE | `/models/:modelId/annotations/:id` | Delete an annotation |

See [server/README.md](server/README.md) for detailed API documentation.

## Deployment

### AWS Serverless Deployment

```bash
cd server
serverless deploy
```

This creates:
- Lambda function for API handling
- API Gateway for HTTP endpoints
- DynamoDB table for persistence
- IAM roles with appropriate permissions

See [server/README.md](server/README.md) for deployment details.

## Configuration

### Client Environment Variables

Create `.env` in the client directory:
```env
VITE_API_URL=http://localhost:3000  # Backend API URL
```

### Server Environment Variables

The server uses:
- `ANNOTATIONS_TABLE`: DynamoDB table name (set by serverless.yml)
- `AWS_REGION`: AWS region for DynamoDB (defaults to us-east-1)

## Technology Stack

### Frontend
- React 18
- TypeScript 5
- Vite 5
- Potree 1.8.2 (WebGL point cloud renderer)

### Backend
- Node.js 18.x
- Express 5
- AWS SDK v3 (DynamoDB)
- TypeScript 5
- Jest 30 (testing)

### Cloud Services (Optional)
- AWS Lambda
- AWS API Gateway
- AWS DynamoDB
- Serverless Framework v3

## Development Workflow

1. **Local Development**: Run both client and server locally
2. **Testing**: Use Jest for backend unit tests
3. **Version Control**: Git with GitHub/GitLab
4. **Deployment**: Serverless Framework for AWS deployment

## Testing

Run server tests:
```bash
cd server
npm test
```

Tests cover:
- Annotation CRUD operations
- In-memory storage functionality
- Error handling
- Edge cases

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Performance Considerations

- **Auto-save**: Annotations save every 2 seconds (configurable)
- **Batch Operations**: Server sync processes all annotations in parallel
- **Optimistic UI**: Local changes reflect immediately
- **Lazy Loading**: Point cloud data loads progressively

## Browser Compatibility

- Chrome 90+ (recommended)
- Firefox 88+
- Safari 14+
- Edge 90+

WebGL 2.0 support required for Potree rendering.

## Known Limitations

- Model ID currently hardcoded as "default-model" (can be made dynamic)
- No user authentication (can be added with Cognito/JWT)
- No real-time collaboration (would require WebSockets)
- Single point cloud per session

## Future Enhancements

- [ ] User authentication and authorization
- [ ] Multiple point cloud models support
- [ ] Real-time collaborative editing
- [ ] Advanced annotation types (polygons, measurements)
- [ ] Export annotations to GIS formats
- [ ] Annotation history and versioning
- [ ] Mobile-responsive viewer
- [ ] Annotation search and filtering

## License

ISC

## Support

For issues and questions:
- Check existing documentation in `server/README.md`
- Review code comments and inline documentation
- Open an issue in the repository

## Acknowledgments

- Potree by Markus Schütz for point cloud rendering
- AWS Serverless Framework team
- React and TypeScript communities
