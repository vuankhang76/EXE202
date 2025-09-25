import { useLoading } from '@/contexts/LoadingContext';
import { FullPageLoadingSpinner } from '@/components/ui/LoadingSpinner';

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
