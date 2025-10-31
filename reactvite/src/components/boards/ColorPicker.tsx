import { useState, useRef, useEffect } from 'react';
import './ColorPicker.css';

interface ColorPickerProps {
  currentColor: string;
  onColorChange: (color: string) => void;
  onClose: () => void;
}

const PRESET_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
  '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2',
  '#F8B500', '#FF69B4', '#20B2AA', '#FF8C42',
  '#6C5CE7', '#00B894', '#FDCB6E', '#E17055',
  '#74B9FF', '#A29BFE', '#FD79A8', '#636E72'
];

export default function ColorPicker({ currentColor, onColorChange, onClose }: ColorPickerProps) {
  const [hexInput, setHexInput] = useState(currentColor);
  const [previewColor, setPreviewColor] = useState(currentColor);
  const [showActions, setShowActions] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setHexInput(value);

    if (/^#[0-9A-F]{6}$/i.test(value)) {
      setPreviewColor(value);
    }
  };

  const handleInputFocus = () => {
    setShowActions(true);
  };

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (/^#[0-9A-F]{6}$/i.test(hexInput)) {
      onColorChange(hexInput);
    }
    setShowActions(false);
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setHexInput(currentColor);
    setPreviewColor(currentColor);
    setShowActions(false);
  };

  const handlePresetClick = (e: React.MouseEvent, color: string) => {
    e.preventDefault();
    e.stopPropagation();
    setHexInput(color);
    setPreviewColor(color);
    onColorChange(color);
    setShowActions(false);
  };

  const handlePickerClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div className="color-picker" ref={pickerRef} onClick={handlePickerClick}>
      <div className="color-picker-presets">
        {PRESET_COLORS.map(color => (
          <button
            key={color}
            className={`color-preset ${currentColor === color ? 'active' : ''}`}
            style={{ backgroundColor: color }}
            onClick={(e) => handlePresetClick(e, color)}
            title={color}
          />
        ))}
      </div>

      <div className="color-picker-custom">
        <input
          id="hex-input"
          type="text"
          value={hexInput}
          onChange={handleHexChange}
          onFocus={handleInputFocus}
          placeholder="#000000"
          maxLength={7}
        />
        <div
          className="color-preview-box"
          style={{ backgroundColor: previewColor }}
        />
      </div>

      {showActions && (
        <div className="color-picker-actions">
          <button
            className="color-picker-btn color-picker-btn--save"
            onClick={handleSave}
          >
            Save
          </button>
          <button
            className="color-picker-btn color-picker-btn--cancel"
            onClick={handleCancel}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
