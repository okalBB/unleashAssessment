# Unleash Client

Frontend application for interactive 3D point cloud annotation using Potree viewer.

## Overview

The Unleash client provides a web-based interface for visualizing and annotating 3D point cloud data. Built with React and TypeScript, it integrates the Potree WebGL renderer to display point clouds and enables users to create volumetric box annotations with descriptive notes.

## Features

### Current Functionality

- **3D Point Cloud Visualization**: Renders point cloud data using Potree 1.8.2
- **Interactive Box Annotations**: Draw and manipulate 3D volumetric boxes around regions of interest
- **Text Notes**: Attach descriptive notes to each annotation
- **Real-time Editing**: Resize, move, and rotate boxes directly in the 3D viewer
- **Auto-save**: Automatic persistence to localStorage every 2 seconds
- **Annotation Management**: View, select, and delete annotations via table interface
- **Server Synchronization**: Submit local annotations to backend API
- **CRUD Operations**: Full create, read, update, delete support for annotations

### Work in Progress

> **Note**: The following features are currently under development:

- 🚧 **Fetch Saved Models**: Load previously saved annotations from the server on startup
- 🚧 **Model Selection**: Choose between different point cloud models
- 🚧 **Load from Server**: Initialize viewer with server-stored annotations
- 🚧 **Auto-sync**: Automatic background synchronization with server
- 🚧 **Conflict Resolution**: Handle concurrent edits and conflicts
- 🚧 **User Authentication**: Login and user-specific annotation storage

## Technology Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite 5
- **3D Renderer**: Potree 1.8.2 (WebGL-based point cloud viewer)
- **State Management**: Custom React hooks
- **API Client**: Fetch API
- **Storage**: Browser localStorage + REST API backend

## Project Structure

```
client/
├── public/
│   └── Potree_1.8.2/           # Potree library and point cloud data
│       ├── build/potree/       # Compiled Potree library
│       ├── libs/               # Third-party dependencies
│       ├── pointclouds/        # Sample point cloud data
│       └── examples/           # Potree example files
├── src/
│   ├── componants/             # React components
│   │   ├── potree.tsx          # Main Potree viewer component
│   │   ├── buttons.tsx         # Reusable button components
│   │   ├── modificationTable.tsx # Annotation list table
│   │   └── PotreeViewer.tsx    # Viewer wrapper
│   ├── hooks/                  # Custom React hooks
│   │   ├── objectsHook.tsx     # Box annotation state management
│   │   └── useAnnotationSync.tsx # Server sync logic
│   ├── services/               # API clients
│   │   └── annotationsApi.ts   # REST API functions
│   ├── pages/                  # Page components
│   │   └── work.tsx            # Main workspace page
│   ├── App.tsx                 # Root component
│   └── main.tsx                # Application entry point
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn

### Installation

```bash
cd client
npm install
```

### Development Server

```bash
npm run dev
```

The application will start on `http://localhost:5173` (or next available port).

### Build for Production

```bash
npm run build
```

Production files are output to the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Configuration

### Environment Variables

Create a `.env` file in the client directory:

```env
VITE_API_URL=http://localhost:3000
```

- `VITE_API_URL`: Backend API base URL (defaults to `http://localhost:3000`)

## Usage

### Basic Workflow

1. **View Point Cloud**: The viewer loads automatically with a sample point cloud
2. **Create Annotation**: 
   - A box tool starts automatically
   - Click and drag in the 3D viewer to define a volume
3. **Add Note**: Type a description in the input field
4. **Save Locally**: Click "Add note" to save to localStorage
5. **Adjust Box**: Resize or reposition the box as needed
6. **Submit to Server**: Click "Submit to Server" to sync with backend

### Controls

**Mouse Controls**:
- Left click + drag: Rotate view
- Right click + drag: Pan view
- Scroll: Zoom in/out

**Keyboard Shortcuts** (Potree defaults):
- Arrow keys: Navigate
- +/-: Zoom

### Annotation Table

- **Select**: Click a row to highlight the box in 3D view
- **Delete**: Remove an annotation from local storage
- **Visual Feedback**: Selected boxes highlight the point cloud region

## Component Overview

### `potree.tsx`
Main viewer component integrating Potree renderer, annotation controls, and table interface.

### `objectsHook.tsx`
Custom hook managing:
- Box creation and manipulation
- localStorage persistence
- Auto-save functionality
- Potree viewer lifecycle

### `useAnnotationSync.tsx`
Server synchronization hook providing:
- Batch submission to server
- Individual CRUD operations
- Error handling and loading states
- Optimistic updates

### `annotationsApi.ts`
REST API client with typed functions for all backend endpoints.

## Browser Compatibility

Requires modern browser with WebGL 2.0 support:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Development

### TypeScript

The project uses strict TypeScript with full type checking:

```bash
npm run type-check
```

### Linting

```bash
npm run lint
```

## Known Issues

- Model ID is currently hardcoded as "default-model"
- No loading indicator for server operations
- Limited error messages for network failures
- Browser localStorage has size limits (~5-10MB)

## Roadmap

### Short Term
- [ ] Load annotations from server on mount
- [ ] Model selection dropdown
- [ ] Better error handling and user feedback
- [ ] Loading states and spinners

### Medium Term
- [ ] User authentication integration
- [ ] Multiple point cloud support
- [ ] Annotation search and filtering
- [ ] Export annotations (JSON, CSV)

### Long Term
- [ ] Real-time collaboration
- [ ] Advanced annotation types (polygons, measurements)
- [ ] Mobile-responsive interface
- [ ] GIS format support

## Contributing

See the main project [README](../README.md) for contribution guidelines.

## License

ISC

// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
