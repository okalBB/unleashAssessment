
/**
 * 300-char summary: This test suite validates the annotations service module's CRUD operations.
 * It tests getAll for retrieving annotations by modelId, createOne for adding new annotations, updateOne for modifying existing ones, and deleteOne for removal.
 * Uses Jest framework with TypeScript support, includes error handling tests for not-found cases, and ensures test isolation via resetAnnotations.
 * Covers both happy paths and edge cases for in-memory storage implementation.
 */

import { getAll, createOne, updateOne, deleteOne, resetAnnotations } from '../src/services/annotations.service';
import { Annotation } from '../src/types';

// Test suite for the Annotations Service
describe('Annotations Service', () => {
  // Reset in-memory storage before each test to ensure isolation
  beforeEach(() => {
    resetAnnotations();
  });

  // Tests for getAll function
  describe('getAll', () => {
    it('should return empty array for non-existent modelId', async () => {
      const result = await getAll('nonexistent');
      expect(result).toEqual([]);
    });

    it('should return annotations for existing modelId', async () => {
      const modelId = 'test-model';
      const data = { text: 'test' };
      const created: Annotation = await createOne(modelId, data);

      const result: Annotation[] = await getAll(modelId);
      expect(result).toEqual([created]);
    });
  });

  // Tests for createOne function
  describe('createOne', () => {
    it('should create and return a new annotation', async () => {
      const modelId = 'test-model';
      const data = { text: 'new annotation' };

      const result = await createOne(modelId, data);
      expect(result.text).toBe('new annotation');
      expect(result.id).toBeDefined();

      const all = await getAll(modelId);
      expect(all).toContain(result);
    });

    it('should initialize array for new modelId', async () => {
      const modelId = 'new-model';
      const data = { text: 'first' };

      const result = await createOne(modelId, data);
      const all = await getAll(modelId);
      expect(all).toEqual([result]);
    });
  });

  // Tests for updateOne function
  describe('updateOne', () => {
    it('should update existing annotation', async () => {
      const modelId = 'test-model';
      const created = await createOne(modelId, { text: 'original' });

      const updates = { text: 'updated' };
      const result = await updateOne(modelId, created.id, updates);

      expect(result).toEqual({ id: created.id, modelId, text: 'updated' });
    });

    it('should throw error if annotation not found', async () => {
      await expect(updateOne('test-model', 'nonexistent', {})).rejects.toThrow('Annotation not found');
    });
  });

  // Tests for deleteOne function
  describe('deleteOne', () => {
    it('should delete existing annotation', async () => {
      const modelId = 'test-model';
      const created = await createOne(modelId, { text: 'to delete' });

      await deleteOne(modelId, created.id);

      const all = await getAll(modelId);
      expect(all).toEqual([]);
    });

    it('should throw error if annotation not found', async () => {
      await expect(deleteOne('test-model', 'nonexistent')).rejects.toThrow('Annotation not found');
    });
  });
});