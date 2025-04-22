import React from 'react';
import './FormInput.css';

interface FormInputProps {
  label: string;
  id: string;
  type?: string;
  placeholder?: string;
}

export default function FormInput({
  label,
  id,
  type = 'text',
  placeholder,
}: FormInputProps) {
  return (
    <div className="form-input">
      <label htmlFor={id}>{label}</label>
      <input id={id} type={type} placeholder={placeholder} />
    </div>
  );
}