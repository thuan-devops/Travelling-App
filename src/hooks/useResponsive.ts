import { useWindowDimensions } from 'react-native';

export interface ResponsiveInfo {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isWide: boolean;
  gridColumns: number;
  contentMaxWidth: number | '100%';
  horizontalPadding: number;
}

export function useResponsive(): ResponsiveInfo {
  const { width, height } = useWindowDimensions();

  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;
  const isDesktop = width >= 1024;
  const isWide = width >= 1280;

  // Số lượng cột lưới hiển thị chỗ nghỉ
  const gridColumns = isWide ? 4 : isDesktop ? 3 : isTablet ? 2 : 1;

  // Giới hạn chiều rộng nội dung tối đa trên Desktop/Tablet để căn giữa thanh lịch
  const contentMaxWidth = isWide ? 1320 : isDesktop ? 1160 : isTablet ? 840 : '100%';

  // Khoảng đệm 2 bên cạnh màn hình
  const horizontalPadding = isDesktop ? 32 : isTablet ? 24 : 16;

  return {
    width,
    height,
    isMobile,
    isTablet,
    isDesktop,
    isWide,
    gridColumns,
    contentMaxWidth,
    horizontalPadding,
  };
}

/**
 * Đảm bảo các hàng cuối trong FlatList đa cột không bị giãn to bất thường
 * Tự động bù thêm các thẻ rỗng giữ chỗ để tất cả các cột luôn có kích thước cố định bằng nhau
 */
export function formatGridData<T extends { id: string }>(
  dataList: T[],
  numCols: number
): (T | { id: string; empty: true })[] {
  if (numCols <= 1 || !dataList || dataList.length === 0) return dataList;
  const remainder = dataList.length % numCols;
  if (remainder === 0) return dataList;

  const blankCount = numCols - remainder;
  const result: (T | { id: string; empty: true })[] = [...dataList];
  for (let i = 0; i < blankCount; i++) {
    result.push({ id: `__blank_placeholder_${i}`, empty: true });
  }
  return result;
}
