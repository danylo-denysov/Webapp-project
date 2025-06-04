import React from 'react';
import './Header.css';

interface HeaderProps {
  left?: React.ReactNode;

  right?: React.ReactNode;

  /** If true, render the horizontal divider below the header (default: true). */
  divider?: boolean;
}

export default function Header({
  left,
  right,
  divider = true,
}: HeaderProps) {
  return (
    <>
      <div className="common-header">
        {left && <div className="header-left">{left}</div>}
        <div className="header-spacer" />
        {right && <div className="header-right">{right}</div>}
      </div>
      {divider && <div className="common-divider" />}
    </>
  );
}
