import type { MessageDTO } from '@/types/conversation';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Download, FileText } from 'lucide-react';

interface MessageBubbleProps {
  message: MessageDTO;
  isOwn: boolean;
}

export default function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  const formatTime = (date?: string) => {
    if (!date) return '';
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale: vi });
  };

  const getSenderName = () => {
    return message.senderName || message.senderPatientName || message.senderUserName || 'Người dùng';
  };

  const getTimeStamp = () => {
    return message.sentAt || message.createdAt || '';
  };

  const getAttachmentUrl = () => {
    if (!message.attachmentUrl) return '';
    
    // If URL is already absolute (starts with http/https), return as is
    if (message.attachmentUrl.startsWith('http://') || message.attachmentUrl.startsWith('https://')) {
      return message.attachmentUrl;
    }
    
    // Otherwise, prepend backend URL
    const backendUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || '';
    return `${backendUrl}${message.attachmentUrl}`;
  };

  const renderAttachment = () => {
    if (!message.attachmentUrl) return null;

    const attachmentUrl = getAttachmentUrl();
    
    // Check if it's an image by URL or filename
    const isImage = 
      message.attachmentName?.match(/\.(jpg|jpeg|png|gif|webp)$/i) || 
      attachmentUrl.match(/\.(jpg|jpeg|png|gif|webp)(\?|$)/i) ||
      attachmentUrl.includes('image/upload'); // Cloudinary image URLs

    if (isImage) {
      return (
        <div className="mt-2">
          <img
            src={attachmentUrl}
            alt={message.attachmentName}
            className="max-w-xs rounded-lg cursor-pointer hover:opacity-90"
            onClick={() => window.open(attachmentUrl, '_blank')}
            onError={(e) => {
              // Fallback when image fails to load
              e.currentTarget.style.display = 'none';
              const parent = e.currentTarget.parentElement;
              if (parent && !parent.querySelector('.error-message')) {
                const errorDiv = document.createElement('div');
                errorDiv.className = 'error-message p-3 bg-gray-100 text-gray-600 rounded-lg text-sm flex items-center gap-2';
                errorDiv.innerHTML = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg><span>Hình ảnh (${message.attachmentName || 'file'})</span>`;
                parent.appendChild(errorDiv);
              }
            }}
          />
        </div>
      );
    }

    return (
      <a
        href={attachmentUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 flex items-center gap-2 p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
      >
        <FileText className="w-5 h-5" />
        <span className="text-sm truncate max-w-[200px]">{message.attachmentName}</span>
        <Download className="w-4 h-4 ml-auto" />
      </a>
    );
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-[70%]`}>
        {!isOwn && (
          <div className="text-xs text-gray-600 mb-1 px-1">{getSenderName()}</div>
        )}
        <div
          className={`rounded-2xl px-4 py-2 inline-block ${
            isOwn
              ? 'bg-blue-500 text-white rounded-br-sm'
              : 'bg-gray-200 text-gray-800 rounded-bl-sm'
          }`}
        >
          {message.content && <p className="whitespace-pre-wrap break-words">{message.content}</p>}
          {renderAttachment()}
        </div>
        <div className={`text-xs text-gray-500 mt-1 px-1`}>
          {formatTime(getTimeStamp())}
        </div>
      </div>
    </div>
  );
}

