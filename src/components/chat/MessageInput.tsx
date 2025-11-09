import type { FormEvent } from 'react';
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Send, Paperclip, X } from 'lucide-react';
import { toast } from 'sonner';

interface MessageInputProps {
  onSend: (content: string, file?: File) => Promise<void>;
  disabled?: boolean;
}

export default function MessageInput({ onSend, disabled }: MessageInputProps) {
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!content.trim() && !file) {
      toast.error('Vui lòng nhập nội dung hoặc đính kèm file');
      return;
    }

    setSending(true);
    try {
      await onSend(content.trim(), file || undefined);
      setContent('');
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      toast.error(error.message || 'Không thể gửi tin nhắn');
    } finally {
      setSending(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Check file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error('File không được vượt quá 10MB');
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t bg-white p-4">
      {file && (
        <div className="flex items-center gap-2 mb-2 p-2 bg-gray-100 rounded-lg">
          <Paperclip className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-700 flex-1 truncate">{file.name}</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setFile(null);
              if (fileInputRef.current) {
                fileInputRef.current.value = '';
              }
            }}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      <div className="flex gap-2">
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileSelect}
          accept="image/*,.pdf,.doc,.docx"
        />
        
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || sending}
        >
          <Paperclip className="w-5 h-5" />
        </Button>

        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Nhập tin nhắn... (Enter để gửi, Shift+Enter để xuống dòng)"
          className="flex-1 min-h-[44px] max-h-[120px] resize-none"
          disabled={disabled || sending}
        />

        <Button type="submit" size="icon" disabled={disabled || sending || (!content.trim() && !file)}>
          <Send className="w-5 h-5" />
        </Button>
      </div>
    </form>
  );
}


