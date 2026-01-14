/**
 * 300-char summary:
 * Custom React hook for syncing box annotations with the server API. Handles fetching, creating, updating, and deleting annotations via REST endpoints.
 * Provides automatic synchronization between local state and backend database. Manages loading states and error handling for all CRUD operations.
 */

import { useEffect, useCallback, useState, useRef } from 'react'
import {
  getAllAnnotations,
  createAnnotation,
  updateAnnotation,
  deleteAnnotation,
} from '../services/annotationsApi'

interface BoxPersist {
  id: string
  note: string
  position: [number, number, number]
  scale: [number, number, number]
  rotation: [number, number, number]
}

interface UseAnnotationSyncProps {
  modelId: string
  enabled?: boolean
}

interface UseAnnotationSyncReturn {
  isLoading: boolean
  error: string | null
  syncAnnotations: (boxes: BoxPersist[]) => Promise<void>
  submitAnnotations: (boxes: BoxPersist[]) => Promise<void>
  loadAnnotations: () => Promise<BoxPersist[]>
  createServerAnnotation: (box: BoxPersist) => Promise<void>
  updateServerAnnotation: (box: BoxPersist) => Promise<void>
  deleteServerAnnotation: (id: string) => Promise<void>
  isSyncing: boolean
}

/**
 * Hook for synchronizing local box annotations with the server.
 * Provides functions to perform CRUD operations on annotations via the REST API.
 *
 * @param modelId - The ID of the point cloud model
 * @param enabled - Whether syncing is enabled (default: true)
 */
const useAnnotationSync = ({
  modelId,
  enabled = true,
}: UseAnnotationSyncProps): UseAnnotationSyncReturn => {
  const [isLoading, setIsLoading] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  /**
   * Loads all annotations for the current model from the server.
   * Converts server annotations to BoxPersist format.
   *
   * @returns Array of box annotations from the server
   */
  const loadAnnotations = useCallback(async (): Promise<BoxPersist[]> => {
    if (!enabled || !modelId) return []

    setIsLoading(true)
    setError(null)

    try {
      const annotations = await getAllAnnotations(modelId)

      // Convert server annotations to BoxPersist format
      const boxes: BoxPersist[] = annotations.map((ann) => ({
        id: ann.id,
        note: ann.note || '',
        position: ann.position || [0, 0, 0],
        scale: ann.scale || [1, 1, 1],
        rotation: ann.rotation || [0, 0, 0],
      }))

      if (isMountedRef.current) {
        setIsLoading(false)
      }

      return boxes
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to load annotations'
      if (isMountedRef.current) {
        setError(errorMessage)
        setIsLoading(false)
      }
      console.error('Error loading annotations:', err)
      return []
    }
  }, [modelId, enabled])

  /**
   * Creates a new annotation on the server.
   * Converts BoxPersist to server annotation format.
   *
   * @param box - The box annotation to create
   */
  const createServerAnnotation = useCallback(
    async (box: BoxPersist): Promise<void> => {
      if (!enabled || !modelId) return

      setError(null)

      try {
        await createAnnotation(modelId, {
          note: box.note,
          position: box.position,
          scale: box.scale,
          rotation: box.rotation,
        })
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to create annotation'
        setError(errorMessage)
        console.error('Error creating annotation:', err)
        throw err
      }
    },
    [modelId, enabled]
  )

  /**
   * Updates an existing annotation on the server.
   * Sends only the changed data to the server.
   *
   * @param box - The box annotation to update
   */
  const updateServerAnnotation = useCallback(
    async (box: BoxPersist): Promise<void> => {
      if (!enabled || !modelId) return

      setError(null)

      try {
        await updateAnnotation(modelId, box.id, {
          note: box.note,
          position: box.position,
          scale: box.scale,
          rotation: box.rotation,
        })
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to update annotation'
        setError(errorMessage)
        console.error('Error updating annotation:', err)
        throw err
      }
    },
    [modelId, enabled]
  )

  /**
   * Deletes an annotation from the server.
   *
   * @param id - The ID of the annotation to delete
   */
  const deleteServerAnnotation = useCallback(
    async (id: string): Promise<void> => {
      if (!enabled || !modelId) return

      setError(null)

      try {
        await deleteAnnotation(modelId, id)
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to delete annotation'
        setError(errorMessage)
        console.error('Error deleting annotation:', err)
        throw err
      }
    },
    [modelId, enabled]
  )

  /**
   * Syncs all local annotations to the server.
   * Compares local state with server state and performs necessary updates.
   * This is a batch operation that ensures server matches local state.
   *
   * @param boxes - Array of local box annotations to sync
   */
  const syncAnnotations = useCallback(
    async (boxes: BoxPersist[]): Promise<void> => {
      if (!enabled || !modelId || isSyncing) return

      setIsSyncing(true)
      setError(null)

      try {
        // Get current server state
        const serverAnnotations = await getAllAnnotations(modelId)
        const serverIds = new Set(serverAnnotations.map((a) => a.id))
        const localIds = new Set(boxes.map((b) => b.id))

        // Find annotations to create (exist locally but not on server)
        const toCreate = boxes.filter((box) => !serverIds.has(box.id))

        // Find annotations to update (exist on both)
        const toUpdate = boxes.filter((box) => serverIds.has(box.id))

        // Find annotations to delete (exist on server but not locally)
        const toDelete = serverAnnotations.filter(
          (ann) => !localIds.has(ann.id)
        )

        // Perform batch operations
        await Promise.all([
          ...toCreate.map((box) => createServerAnnotation(box)),
          ...toUpdate.map((box) => updateServerAnnotation(box)),
          ...toDelete.map((ann) => deleteServerAnnotation(ann.id)),
        ])

        if (isMountedRef.current) {
          setIsSyncing(false)
        }
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to sync annotations'
        if (isMountedRef.current) {
          setError(errorMessage)
          setIsSyncing(false)
        }
        console.error('Error syncing annotations:', err)
        throw err
      }
    },
    [
      modelId,
      enabled,
      isSyncing,
      createServerAnnotation,
      updateServerAnnotation,
      deleteServerAnnotation,
    ]
  )

  /**
   * Submits all annotations directly to the server without comparison.
   * Attempts to create each annotation, automatically updates if it already exists.
   * More efficient when you know the current state should override server.
   * 
   * @param boxes - Array of local box annotations to submit
   */
  const submitAnnotations = useCallback(
    async (boxes: BoxPersist[]): Promise<void> => {
      if (!enabled || !modelId || isSyncing) return

      setIsSyncing(true)
      setError(null)

      try {
        // Try to create/update each annotation
        await Promise.all(
          boxes.map(async (box) => {
            try {
              // Try to create first (POST)
              await createServerAnnotation(box)
            } catch (err: any) {
              // If creation fails (likely already exists), try update (PATCH)
              if (err.message.includes('already exists') || err.message.includes('409') || err.message.includes('conflict')) {
                await updateServerAnnotation(box)
              } else {
                throw err
              }
            }
          })
        )

        if (isMountedRef.current) {
          setIsSyncing(false)
        }
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to submit annotations'
        if (isMountedRef.current) {
          setError(errorMessage)
          setIsSyncing(false)
        }
        console.error('Error submitting annotations:', err)
        throw err
      }
    },
    [modelId, enabled, isSyncing, createServerAnnotation, updateServerAnnotation]
  )

  return {
    isLoading,
    error,
    syncAnnotations,
    submitAnnotations,
    loadAnnotations,
    createServerAnnotation,
    updateServerAnnotation,
    deleteServerAnnotation,
    isSyncing,
  }
}

export default useAnnotationSync
