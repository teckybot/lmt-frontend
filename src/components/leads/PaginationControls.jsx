import React from "react";
import { Pagination, Select } from "antd";

const PaginationControls = ({ currentPage, setCurrentPage, rowsPerPage, setRowsPerPage, totalItems }) => {
  return (
    <div className="flex flex-wrap items-center justify-between mb-4 mt-4 gap-3">
      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <span className="md:ml-8">Cards per page:</span>
        <Select
          value={rowsPerPage}
          onChange={(value) => {
            setRowsPerPage(value);
            setCurrentPage(1);
          }}
          options={[9, 18, 27].map((size) => ({ value: size, label: size }))}
          style={{ width: 80 }}
        />
      </div>

      <div className="flex justify-end flex-1">
        <Pagination
          current={currentPage}
          total={totalItems}
          pageSize={rowsPerPage}
          onChange={(page) => setCurrentPage(page)}
          showSizeChanger={false}
          responsive
        />
      </div>
    </div>
  );
};

export default PaginationControls;