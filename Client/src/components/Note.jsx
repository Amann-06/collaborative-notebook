import React, { useEffect, useState } from 'react'
const Note = ({ id, ContainerRef, initialPosition, isSelected, onSelect , onMove}) => {
  const [isDragging, setIsDragging] = useState(false)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [position, setPosition] = useState(initialPosition || { x: 50, y: 50 })
  const [text, setText] = useState("New Note")
  const [isEditing, setIsEditing] = useState(false)

  const NOTE_SIZE = 250

  const handleMouseDown = (e) => {
    e.stopPropagation()

    if (!ContainerRef.current) return

    onSelect && onSelect()

    if (isEditing) return

    const rect = ContainerRef.current.getBoundingClientRect()

    setOffset({
      x: e.clientX - position.x - rect.left,
      y: e.clientY - position.y - rect.top
    })

    setIsDragging(true)
  }

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging || !ContainerRef.current) return

      const rect = ContainerRef.current.getBoundingClientRect()

      let newX = e.clientX - rect.left - offset.x
      let newY = e.clientY - rect.top - offset.y

      newX = Math.max(50, Math.min(newX, rect.width - NOTE_SIZE))
      newY = Math.max(50, Math.min(newY, rect.height - NOTE_SIZE))

      setPosition({ x: newX, y: newY });
      onMove(newX,newY)
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseup", handleMouseUp)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging, offset, ContainerRef])

  useEffect(() => {
    if (
      initialPosition &&
      (initialPosition.x !== position.x || initialPosition.y !== position.y)
    ) {
      setPosition(initialPosition);
    }
  }, [initialPosition]);

  return (
    <div
      onMouseDown={handleMouseDown}
      className={`absolute cursor-grab shadow-lg shadow-black/60 active:cursor-grabbing border border-black overflow-hidden
      }`}
      style={{
        top: position.y,
        left: position.x,
        width: '200px',
        height: '200px',
        zIndex: isSelected ? 10 : 1,
        backgroundColor:'Yellow',
        // backgroundImage: 'url("https://png.pngtree.com/png-vector/20250323/ourmid/pngtree-yellow-sticky-note-isolated-on-white-png-image_15844065.png")',
        // backgroundSize: 'cover',
        // backgroundPosition: 'center'
      }}
    >
      {isEditing ? (
        <textarea
          className='absolute outline-none p-3 border-none text-black text-lg bg-transparent resize-none overflow-hidden break-words'
          value={text}
          autoFocus
          onMouseDown={(e) => e.stopPropagation()}
          onChange={(e) => setText(e.target.value)}
          onBlur={() => setIsEditing(false)}
        />
      ) : (
        <p
          className='absolute p-3 text-black text-lg overflow-hidden break-words'
          onClick={(e) => {
            e.stopPropagation()
            onSelect && onSelect()
          }}
          onDoubleClick={() => setIsEditing(true)}
        >
          {text}
        </p>
      )}
    </div>
  )
}

export default Note