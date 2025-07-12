import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  maxVisiblePages?: number;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  maxVisiblePages = 3,
}) => {
  if (totalPages <= 1) return null;

  const getVisiblePages = () => {
    const pages: (number | string)[] = [];

    if (totalPages <= 5) {
      // Show all pages if total is 5 or less
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 2) {
        // First page: << < 1 2 .. > >>
        pages.push(1, 2, '...');
      } else if (currentPage >= totalPages - 1) {
        // Last page: << < ... [lastpage-1] [lastpage] >> >
        pages.push('...', totalPages - 1, totalPages);
      } else {
        // Middle: << < ... [cur-1] [cur] [cur+1] ... >> >
        pages.push('...', currentPage - 1, currentPage, currentPage + 1, '...');
      }
    }

    return pages;
  };

  const visiblePages = getVisiblePages();

  const renderPageButton = (page: number | string, index: number) => {
    if (page === '...') {
      return (
        <View key={`ellipsis-${index}`} style={styles.ellipsis}>
          <Text style={styles.ellipsisText}>...</Text>
        </View>
      );
    }

    const pageNumber = page as number;
    const isActive = pageNumber === currentPage;

    return (
      <TouchableOpacity
        key={pageNumber}
        style={[styles.pageButton, isActive && styles.activePageButton]}
        onPress={() => onPageChange(pageNumber)}
        disabled={isActive}>
        <Text
          style={[
            styles.pageButtonText,
            isActive && styles.activePageButtonText,
          ]}>
          {pageNumber}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.paginationContainer}>
        {/* First page button */}
        <TouchableOpacity
          style={[styles.navButton, currentPage === 1 && styles.disabledButton]}
          onPress={() => onPageChange(1)}
          disabled={currentPage === 1}>
          <Text
            style={[
              styles.navButtonText,
              currentPage === 1 && styles.disabledButtonText,
            ]}>
            {'<<'}
          </Text>
        </TouchableOpacity>

        {/* Previous page button */}
        <TouchableOpacity
          style={[styles.navButton, currentPage === 1 && styles.disabledButton]}
          onPress={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}>
          <Text
            style={[
              styles.navButtonText,
              currentPage === 1 && styles.disabledButtonText,
            ]}>
            {'<'}
          </Text>
        </TouchableOpacity>

        {/* Page numbers */}
        {visiblePages.map((page, index) => renderPageButton(page, index))}

        {/* Next page button */}
        <TouchableOpacity
          style={[
            styles.navButton,
            currentPage === totalPages && styles.disabledButton,
          ]}
          onPress={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}>
          <Text
            style={[
              styles.navButtonText,
              currentPage === totalPages && styles.disabledButtonText,
            ]}>
            {'>'}
          </Text>
        </TouchableOpacity>

        {/* Last page button */}
        <TouchableOpacity
          style={[
            styles.navButton,
            currentPage === totalPages && styles.disabledButton,
          ]}
          onPress={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}>
          <Text
            style={[
              styles.navButtonText,
              currentPage === totalPages && styles.disabledButtonText,
            ]}>
            {'>>'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Pagination;

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e1e1e1',
  },
  paginationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    flexWrap: 'wrap',
  },
  navButton: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    marginHorizontal: 1,
    borderRadius: 6,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dee2e6',
    minWidth: 32,
    alignItems: 'center',
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
  },
  disabledButton: {
    backgroundColor: '#f8f9fa',
    borderColor: '#e9ecef',
  },
  disabledButtonText: {
    color: '#adb5bd',
  },
  pageButton: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    marginHorizontal: 1,
    borderRadius: 6,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dee2e6',
    minWidth: 32,
    alignItems: 'center',
  },
  pageButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#495057',
  },
  activePageButton: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  activePageButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  ellipsis: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    marginHorizontal: 2,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 36,
  },
  ellipsisText: {
    fontSize: 14,
    color: '#6c757d',
    fontWeight: '500',
  },
  infoContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#6c757d',
  },
});
