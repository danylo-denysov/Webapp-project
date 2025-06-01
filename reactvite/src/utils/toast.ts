import React, { JSX } from 'react';
import { Slide, toast, ToastOptions } from 'react-toastify';

const BASE_OPTS: ToastOptions = {
  position: 'top-center',
  autoClose: 2000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  icon: false,
  transition: Slide,
  style: {
    backgroundColor: 'var(--color-cards)',
    color: 'var(--color-text)',
  },
};

export function toastSuccess(message: string | JSX.Element) {
  toast.success(
    React.createElement(
      'span',
      { style: { display: 'flex', alignItems: 'center', gap: '0.5rem' } },
      React.createElement('span', { style: { fontSize: '1.25rem' } }, '✅'),
      message
    ),
    BASE_OPTS
  );
}

export function toastError(message: string | JSX.Element) {
  toast.error(
    React.createElement(
      'span',
      { style: { display: 'flex', alignItems: 'center', gap: '0.5rem' } },
      React.createElement('span', { style: { fontSize: '1.25rem' } }, '❌'),
      message
    ),
    BASE_OPTS
  );
}