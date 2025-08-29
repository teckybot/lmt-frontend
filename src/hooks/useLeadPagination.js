import { useState, useMemo } from "react";

const useLeadPagination = (filteredLeads) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(9); // 9 cards per page (3 rows of 3)

  const paginatedLeads = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredLeads.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredLeads, currentPage, rowsPerPage]);

  return {
    currentPage,
    setCurrentPage,
    rowsPerPage,
    setRowsPerPage,
    paginatedLeads,
  };
};

export default useLeadPagination;