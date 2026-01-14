/**
 * 300-char summary:
 * API client for point-cloud annotations REST endpoints. Provides typed functions for CRUD operations on annotations scoped by modelId.
 * Uses fetch API for HTTP requests to Express/Lambda backend. Handles JSON serialization and error responses. Supports local and production environments.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface Annotation {
  id: string;
  modelId: string;
  [key: string]: any;
}

export interface CreateAnnotationData {
  [key: string]: any;
}

export interface UpdateAnnotationData {
  [key: string]: any;
}

/**
 * Get all annotations for a specific model
 */
export async function getAllAnnotations(modelId: string): Promise<Annotation[]> {
  const response = await fetch(`${API_BASE_URL}/models/${modelId}/annotations`);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to fetch annotations' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }
  
  return response.json();
}

/**
 * Create a new annotation for a model
 */
export async function createAnnotation(
  modelId: string,
  data: CreateAnnotationData
): Promise<Annotation> {
  const response = await fetch(`${API_BASE_URL}/models/${modelId}/annotations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to create annotation' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }
  
  return response.json();
}

/**
 * Update an existing annotation
 */
export async function updateAnnotation(
  modelId: string,
  id: string,
  data: UpdateAnnotationData
): Promise<Annotation> {
  const response = await fetch(`${API_BASE_URL}/models/${modelId}/annotations/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to update annotation' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }
  
  return response.json();
}

/**
 * Delete an annotation
 */
export async function deleteAnnotation(modelId: string, id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/models/${modelId}/annotations/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to delete annotation' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }
}
