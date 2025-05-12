import React, { ChangeEvent } from 'react';
import './FormInput.css';

interface FormInputProps {
  label: string;
  id: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

const FormInput: React.FC<FormInputProps> = ({ label, id, type = 'text', placeholder, value, onChange }) => {
  return (
    <div className="form-input">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange} // Handle input changes
      />
    </div>
  );
};

export default FormInput;