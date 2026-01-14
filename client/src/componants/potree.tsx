
import ModificationTable from './modificationTable'
import { BlackButton } from './buttons'
import useModelNotes from '../hooks/objectsHook'
import useAnnotationSync from '../hooks/useAnnotationSync'



export default function PotreeViewer() {
  const {draft,setDraft,boxes, newBox,saveBox,handleDeleteBox,} = useModelNotes()
  
  // Sync hook for server communication
  const { submitAnnotations, isSyncing, error } = useAnnotationSync({
    modelId: 'default-model', // You can make this dynamic based on which model is loaded
    enabled: true,
  })

  // Handler to submit changes to server
  const handleSubmitToServer = async () => {
    try {
      // Convert boxes to BoxPersist format and submit directly
      const boxesData = boxes.map((b) => ({
        id: b.id,
        note: b.note,
        position: [b.box.position.x, b.box.position.y, b.box.position.z] as [number, number, number],
        scale: [b.box.scale.x, b.box.scale.y, b.box.scale.z] as [number, number, number],
        rotation: [b.box.rotation.x, b.box.rotation.y, b.box.rotation.z] as [number, number, number],
      }))
      
      await submitAnnotations(boxesData)
      alert('Annotations submitted to server successfully!')
    } catch (err) {
      alert('Failed to submit annotations to server')
    }
  }
 


const selectBox = (id: string) => {
  const v = window.viewer,
    P = window.Potree
  if (!v || !P) return

  boxes.forEach((b) => {
    b.box.visible = false // hide all
    b.box.clipTask = P.ClipTask.NONE // remove highlight
  })

  const sel = boxes.find((b) => b.id === id)
  if (!sel) return

  sel.box.visible = true // show selected
  sel.box.clipTask = P.ClipTask.HIGHLIGHT // highlight selected
}


  return (
    <div
      className='potree_container'
      style={{ width: '100vw', height: '100vh' }}
    >
      <div id='potree_render_area' style={{ width: '100%', height: '100%' }} />

      <div
        style={{
          position: 'fixed',
          left: 20,
          top: 20,
          background: '#e5dada',
          border: '1px solid #000',
          padding: 8,
          zIndex: 9999,
          width: 280,
          borderRadius: 4,
        }}
      >
        <div style={{ marginBottom: 6, fontWeight: 'bold', color: '#333' }}>
          Saved notes : {boxes.length}
        </div>

        {error && (
          <div style={{ color: 'red', fontSize: 12, marginBottom: 4 }}>
            {error}
          </div>
        )}

        <input
          maxLength={256}
          value={draft?.note ?? ''}
          onChange={(e) =>
            setDraft((d) => (d ? { ...d, note: e.target.value } : d))
          }
          style={{ width: '100%' }}
        />

        <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
          <BlackButton
            buttonName='Add note'
            color='#349fa6'
            fontColor='#000'
            onClick={() => saveBox()}
          />

          <BlackButton
            buttonName='Cancel'
            color='#a6872b'
            fontColor='#000'
            onClick={() => setDraft(null)}
          />

          <BlackButton
            buttonName=' New Box'
            color='#1bb44e'
            fontColor='#000'
            onClick={() => newBox()}
          />
        </div>

        <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid #999' }}>
          <BlackButton
            buttonName={isSyncing ? 'Syncing...' : 'Submit to Server'}
            color='#2563eb'
            fontColor='#fff'
            onClick={handleSubmitToServer}
            disabled={isSyncing || boxes.length === 0}
          />
        </div>

        <ModificationTable
          modifications={boxes}
          onDelete={handleDeleteBox}
          selectBox={selectBox}
        
        />
      </div>
    </div>
  )
}
