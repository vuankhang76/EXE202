import { useLoading } from '@/contexts/LoadingContext';
import { FullPageLoadingSpinner } from '@/components/ui/LoadingSpinner';

/**
 * @deprecated This component is kept for backward compatibility but not recommended for use.
 * 
 * Global loading overlays block the entire UI and create poor UX by:
 * - Preventing user interaction
 * - Hiding content unnecessarily
 * - Creating jarring transitions
 * 
 * Instead, use:
 * - Skeleton components (TableSkeleton, DialogContentSkeleton, etc.)
 * - Component-level loading states
 * - Progressive loading patterns
 * 
 * See: src/docs/LoadingSystemGuide.md for best practices
 */
interface GlobalLoadingOverlayProps {
  showOnGlobalLoading?: boolean;
  loadingKey?: string;
  text?: string;
}

export function GlobalLoadingOverlay({ 
  showOnGlobalLoading = true, 
  loadingKey,
  text = 'Đang xử lý...'
}: GlobalLoadingOverlayProps) {
  const { isLoading, globalLoading } = useLoading();
  
  const shouldShow = loadingKey ? isLoading(loadingKey) : (showOnGlobalLoading && globalLoading);
  
  if (!shouldShow) {
    return null;
  }

  return <FullPageLoadingSpinner text={text} />;
}

export default GlobalLoadingOverlay;
