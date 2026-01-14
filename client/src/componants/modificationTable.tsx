import { useState } from "react";
import {LightBlueButton} from "./buttons";

interface BoxNote {
  id: string;
  note: string;
  box: any;

}

interface ModificationTableProps {
  modifications: BoxNote[];
  onDelete?: (index: number) => void;
  selectBox?: (id: string) => void;
}


const ModificationTable: React.FC<ModificationTableProps> =({ modifications, onDelete, selectBox }) => {
 const [selectBoxId, setSelectBoxId] = useState<string | null>('')

  const handleDelete = (index: number) => {
    if (onDelete) {
      onDelete(index)
    }
  }


  const handelSelect = (id: string) => {
    if (selectBox) {
      selectBox(id)
    } 
  }

  return (
    <div>
      <h2>Modification Table</h2>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          background: '#a29e9e',
        }}
      >
        <thead>
          <tr>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Line</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>
              Note Name
            </th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Select</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {modifications.map((mod, index) => (
            <tr key={mod.id}>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                <button
                  onClick={() => {
                    handelSelect(mod.id)
                    setSelectBoxId(mod.id)
                  }}
                  style={{
                    backgroundColor: selectBoxId === mod.id ? '#349fa6' : '#ccc',
                    color: 'white',
                    border: 'none',
                    padding: '5px 10px',
                    borderRadius: '3px',
                    cursor: 'pointer',
                  }}
                >
                  Select
                </button>
              </td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                {Number(index + 1)}
              </td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                {mod.note}
              </td>

              <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                <LightBlueButton
                  buttonName='Delete'
                  onClick={() => handleDelete(index)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default ModificationTable;