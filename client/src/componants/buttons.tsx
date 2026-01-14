



interface ButtonProps {
  buttonName?: string;
  onClick?: () => void;
  disabled?: boolean;
  color?: string;
  fontColor?: string;
}

export const LightBlueButton: React.FC<ButtonProps> = ({
  buttonName,
  onClick,
  disabled = false,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        backgroundColor: '#eb2424', // Light blue color
        color: '#fcfcfc', // Black text for contrast
        border: 'none',
        padding: '5px 5px',
        borderRadius: '5px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontSize: '12px',
        fontWeight: 'bold',
        transition: 'background-color 0.3s ease',
        width: '100%',
      }}
      onMouseOver={(e) => {
        if (!disabled) {
          e.currentTarget.style.backgroundColor = '#cd87eb' // Slightly darker blue on hover
        }
      }}
      onMouseOut={(e) => {
        if (!disabled) {
          e.currentTarget.style.backgroundColor = '#ADD8E6'
        }
      }}
    >
      {buttonName ? buttonName : 'Button'}
    </button>
  )
}


export const BlackButton: React.FC<ButtonProps> = ({
  buttonName,
  onClick,
  disabled = false,
  color = '#068754',
  fontColor = '#fcfcfc',
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        backgroundColor: disabled ? '#cccccc' : color,
        color: disabled ? '#666666' : fontColor,
        border: 'none',
        padding: '5px 5px',
        borderRadius: '5px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontSize: '12px',
        fontWeight: 'bold',
        transition: 'background-color 0.3s ease',
        width: '100%',
        maxHeight: '30px',
        opacity: disabled ? 0.6 : 1,
      }}
      onMouseOver={(e) => {
        if (!disabled) {
          e.currentTarget.style.backgroundColor = '#c0dae2' // Slightly darker blue on hover
        }
      }}
      onMouseOut={(e) => {
        if (!disabled) {
          e.currentTarget.style.backgroundColor = color
          e.currentTarget.style.color = fontColor
        }
      }}
    >
      {buttonName ? buttonName : 'Button'}
    </button>
  )
}
