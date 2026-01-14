/**
 * 300-char summary:
 * Custom React hook for managing 3D box annotations in Potree point cloud viewer. Handles box creation, editing, persistence to localStorage, and scene management.
 * Provides CRUD operations for spatial notes with position/scale/rotation. Integrates Potree volume tools and annotations for interactive 3D markup.
 */

import { useEffect, useState, useCallback, useRef } from 'react'

declare global {
  interface Window {
    Potree: any
    viewer?: any
  }
}

interface BoxNote {
  id: string
  note: string
  box: any
}

interface BoxPersist {
  id: string
  note: string
  position: [number, number, number]
  scale: [number, number, number]
  rotation: [number, number, number]
}

interface UseModelNotesProps {
  initialState?: { inputs: { note: string } }
}

const LS_KEY = 'potree_box_notes'

const useModelNotes = ({ initialState = { inputs: { note: '' } } }: UseModelNotesProps = {}) => {
  const [values, setValues] = useState(initialState)
  const [draft, setDraft] = useState<BoxNote | null>(null)
  const [boxes, setBoxes] = useState<BoxNote[]>([])
  const viewerRef = useRef<any>(null)
  const potreeRef = useRef<any>(null)

  /**
   * Creates a new 3D box annotation in the Potree viewer.
   * Initializes a box volume with clipping enabled and sets it as the current draft.
   * The box is configured to highlight the selected region of the point cloud.
   */
  const newBox = useCallback(() => {
    const v = viewerRef.current
    const P = potreeRef.current
    
    if (!v || !P) return

    const box = v.volumeTool.startInsertion({ type: P.BoxVolume })
    box.clip = true
    box.clipTask = P.ClipTask.HIGHLIGHT
    box.name = 'note-box'
    box.label?.setText?.('New Note')
    
    setDraft({ id: crypto.randomUUID(), note: '', box })
  }, [])

  /**
   * Saves the current draft box annotation to the scene and state.
   * Attaches the note text to the box's userData, updates the visible label,
   * adds it to the boxes array, and creates a Potree annotation marker.
   * Clears the draft after saving.
   */
  const saveBox = useCallback(() => {
    const v = viewerRef.current
    const P = potreeRef.current
    
    if (!draft || !v || !P) return

    // Attach note to the Potree box object
    draft.box.userData = draft.box.userData || {}
    draft.box.userData.note = draft.note

    // Update box label
    draft.box.label?.setText?.(draft.note || 'Unnamed Note')

    // Add to React state
    setBoxes((prevBoxes) => [...prevBoxes, draft])

    // Create scene annotation
    const annotation = new P.Annotation({
      title: draft.note || 'Unnamed Note',
      position: [
        draft.box.position.x,
        draft.box.position.y,
        draft.box.position.z,
      ],
    })
    v.scene.annotations.add(annotation)

    setDraft(null)
  }, [draft])

  /**
   * Converts a BoxNote object to a serializable BoxPersist format.
   * Extracts the spatial transform data (position, scale, rotation) from the
   * Potree box object for storage in localStorage.
   * 
   * @param b - The BoxNote object containing the 3D box and metadata
   * @returns A plain object with numeric arrays suitable for JSON serialization
   */
  const toPersist = useCallback((b: BoxNote): BoxPersist => ({
    id: b.id,
    note: b.note,
    position: [b.box.position.x, b.box.position.y, b.box.position.z],
    scale: [b.box.scale.x, b.box.scale.y, b.box.scale.z],
    rotation: [b.box.rotation.x, b.box.rotation.y, b.box.rotation.z],
  }), [])

  /**
   * Reconstructs a BoxNote from persisted data loaded from localStorage.
   * Creates a new Potree BoxVolume, applies the saved transform (position, scale, rotation),
   * configures clipping behavior, and adds it to the scene.
   * 
   * @param p - The persisted box data with spatial transforms
   * @returns A BoxNote object with the recreated Potree box, or null if viewer unavailable
   */
  const fromPersist = useCallback((p: BoxPersist): BoxNote | null => {
    const v = viewerRef.current
    const P = potreeRef.current
    
    if (!v || !P) return null

    const box = new P.BoxVolume()
    box.position.set(p.position[0], p.position[1], p.position[2])
    box.scale.set(p.scale[0], p.scale[1], p.scale[2])
    box.rotation.set(p.rotation[0], p.rotation[1], p.rotation[2])
    box.clip = true
    box.clipTask = P.ClipTask.HIGHLIGHT
    box.name = 'note-box'
    box.label?.setText?.(p.note || 'Unnamed Note')
    
    v.scene.addVolume(box)
    
    return { id: p.id, note: p.note, box }
  }, [])

  /**
   * Initializes the Potree viewer on component mount.
   * Sets up the 3D viewer, loads the point cloud, restores saved boxes from localStorage,
   * and creates an initial draft box. Cleans up viewer resources on unmount.
   */
  useEffect(() => {
    const P = window.Potree
    const el = document.getElementById('potree_render_area')
    
    if (!P || !el) {
      console.warn('Potree or render area not found')
      return
    }

    // Initialize viewer
    const v = new P.Viewer(el)
    window.viewer = v
    viewerRef.current = v
    potreeRef.current = P

    // Configure viewer settings
    v.setFOV(30)
    v.setPointBudget(5_000_000)
    v.setEDLEnabled(true)
    v.loadSettingsFromURL?.()

    // Load point cloud
    P.loadPointCloud(
      'Potree_1.8.2/pointclouds/lion_takanawa_laz/cloud.js',
      'lion',
      (e: any) => {
        v.scene.addPointCloud(e.pointcloud)
        v.fitToScreen()
      }
    )

    // Restore saved boxes from localStorage
    try {
      const raw = localStorage.getItem(LS_KEY)
      if (raw) {
        const saved: BoxPersist[] = JSON.parse(raw)
        const restoredBoxes = saved
          .map((p) => fromPersist(p))
          .filter((b): b is BoxNote => b !== null)
        setBoxes(restoredBoxes)
      }
    } catch (error) {
      console.error('Error loading saved boxes:', error)
    }

    // Start first box draft
    newBox()

    // Cleanup on unmount
    return () => {
      v.dispose?.()
      viewerRef.current = null
      potreeRef.current = null
    }
  }, [newBox, fromPersist])

  /**
   * Persists the current list of boxes to localStorage whenever it changes.
   * Automatically saves all box annotations with their spatial transforms
   * to enable restoration across browser sessions.
   */
  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(boxes.map(toPersist)))
    } catch (error) {
      console.error('Error saving boxes to localStorage:', error)
    }
  }, [boxes, toPersist])

  /**
   * Periodically saves box transforms to localStorage to capture manual resizing/moving.
   * Runs every 2 seconds to persist any changes made to existing boxes in the Potree viewer,
   * ensuring modifications are not lost on page refresh.
   */
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (boxes.length > 0) {
        try {
          localStorage.setItem(LS_KEY, JSON.stringify(boxes.map(toPersist)))
        } catch (error) {
          console.error('Error auto-saving box transforms:', error)
        }
      }
    }, 2000) // Save every 2 seconds

    return () => clearInterval(intervalId)
  }, [boxes, toPersist])

  /**
   * Deletes a box annotation by index.
   * Removes the box from the Potree scene, updates the boxes array,
   * and synchronizes the change to localStorage.
   * 
   * @param index - The array index of the box to delete
   */
  const handleDeleteBox = useCallback((index: number) => {
    setBoxes((currentBoxes) => {
      if (index < 0 || index >= currentBoxes.length) {
        console.warn('Invalid box index:', index)
        return currentBoxes
      }

      const boxToRemove = currentBoxes[index]
      
      // Remove the box from the Potree scene
      if (boxToRemove?.box && viewerRef.current?.scene) {
        viewerRef.current.scene.removeVolume(boxToRemove.box)
      }

      // Create new array without the deleted box
      const newBoxes = currentBoxes.filter((_, i) => i !== index)

      // Update localStorage
      try {
        localStorage.setItem(LS_KEY, JSON.stringify(newBoxes.map(toPersist)))
      } catch (error) {
        console.error('Error updating localStorage after delete:', error)
      }

      return newBoxes
    })
  }, [toPersist])

  return {
    values,
    setValues,
    draft,
    setDraft,
    boxes,
    setBoxes,
    newBox,
    saveBox,
    handleDeleteBox,
  }
}

export default useModelNotes
