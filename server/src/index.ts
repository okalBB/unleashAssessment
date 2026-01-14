/**
 * 300-char summary:
 * Express server providing REST API endpoints for point-cloud annotations. Implements CRUD operations (GET, POST, PATCH, DELETE) scoped by modelId.
 * Supports local development with in-memory storage. Routes mirror serverless Lambda handler for consistency. Includes error handling and JSON middleware.
 */

import express from 'express';
import { v4 as uuid } from 'uuid';
import { getAll, createOne, updateOne, deleteOne } from './services/annotations.service';

const app = express();
const port = 3000;

// CORS middleware - allow requests from frontend
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // Allow all origins in development
  res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

// Middleware to parse JSON bodies
app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
  res.send('Unleash Server - Annotations API');
});

// GET /models/:modelId/annotations - Get all annotations for a model
app.get('/models/:modelId/annotations', async (req, res) => {
  try {
    const { modelId } = req.params;
    const annotations = await getAll(modelId);
    res.status(200).json(annotations);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /models/:modelId/annotations - Create a new annotation
app.post('/models/:modelId/annotations', async (req, res) => {

  try {
    const { modelId } = req.params;
    const data = req.body;
    
    // Use client-provided id if available, otherwise generate new one
    const annotation = await createOne(modelId, {
      id: data.id || uuid(),
      ...data,
    });
    
    res.status(201).json(annotation);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /models/:modelId/annotations/:id - Update an annotation
app.patch('/models/:modelId/annotations/:id', async (req, res) => {
  try {
    const { modelId, id } = req.params;
    const data = req.body;
    
    const annotation = await updateOne(modelId, id, data);
    res.status(200).json(annotation);
  } catch (error: any) {
    if (error.message === 'Annotation not found') {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// DELETE /models/:modelId/annotations/:id - Delete an annotation
app.delete('/models/:modelId/annotations/:id', async (req, res) => {
  try {
    const { modelId, id } = req.params;
    
    await deleteOne(modelId, id);
    res.status(204).send();
  } catch (error: any) {
    if (error.message === 'Annotation not found') {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});