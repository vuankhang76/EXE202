import { useState, useEffect } from 'react';
import { Check, ChevronsUpDown, User, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/Command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/Popover';
import userService from '@/services/userService';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface OwnerSelectorProps {
  tenantId: number;
  currentOwnerId?: number | null;
  currentOwnerName?: string | null;
  onOwnerChange?: (ownerId: number | null) => void;
  disabled?: boolean;
}

interface UserOption {
  userId: number;
  fullName: string;
  email?: string;
  role: string;
}

export default function OwnerSelector({
  tenantId,
  currentOwnerId,
  currentOwnerName,
  onOwnerChange,
  disabled = false
}: OwnerSelectorProps) {
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(currentOwnerId || null);
  const [selectedName, setSelectedName] = useState<string>(currentOwnerName || '');
  const [users, setUsers] = useState<UserOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Load users when tenantId changes
  useEffect(() => {
    if (tenantId) {
      loadUsers();
    }
  }, [tenantId]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await userService.getUsersByTenant(tenantId, 1, 100);
      if (response.success && response.data) {
        // Filter only users with Role = 'Tenant'
        const tenantUsers = response.data.data.filter((u: any) => u.role === 'Tenant');
        setUsers(tenantUsers.map((u: any) => ({
          userId: u.userId,
          fullName: u.fullName,
          email: u.email,
          role: u.role
        })));
      }
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (userId: number, fullName: string) => {
    setSelectedId(userId);
    setSelectedName(fullName);
    setOpen(false);
    onOwnerChange?.(userId);
  };

  const handleClear = () => {
    setSelectedId(null);
    setSelectedName('');
    onOwnerChange?.(null);
  };

  const filteredUsers = users.filter(user =>
    user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex items-center gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={disabled || loading}
          >
            {selectedId ? (
              <span className="flex items-center gap-2">
                <User className="h-4 w-4" />
                {selectedName}
              </span>
            ) : (
              <span className="text-muted-foreground">Chọn chủ sở hữu...</span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0">
          <Command>
            <CommandInput
              placeholder="Tìm kiếm người dùng..."
              value={searchTerm}
              onValueChange={setSearchTerm}
            />
            <CommandList>
              <CommandEmpty>
                {loading ? 'Đang tải...' : 'Không tìm thấy người dùng'}
              </CommandEmpty>
              <CommandGroup>
                {filteredUsers.map((user) => (
                  <CommandItem
                    key={user.userId}
                    value={user.fullName}
                    onSelect={() => handleSelect(user.userId, user.fullName)}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        selectedId === user.userId ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    <div className="flex flex-col">
                      <span className="font-medium">{user.fullName}</span>
                      {user.email && (
                        <span className="text-xs text-muted-foreground">{user.email}</span>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedId && !disabled && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="h-10 px-3"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

