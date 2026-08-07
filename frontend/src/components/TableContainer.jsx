import React from 'react';

const TableContainer = ({ children, className = "" }) => {
  return (
    <div className={`overflow-hidden rounded-2xl bg-card shadow-[0_0_0_1px_var(--color-hairline)] ${className}`}>
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
};

export default TableContainer;
