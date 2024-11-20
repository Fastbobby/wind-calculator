import React from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface SearchBarProps {
  onSearch: (address: string) => void;
  isLoading?: boolean;
}

export function SearchBar({ onSearch, isLoading }: SearchBarProps) {
  const [address, setAddress] = React.useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(address);
  };

  return (
    <form onSubmit={handleSearch} className="flex gap-2">
      <Input
        type="text"
        placeholder="Enter address..."
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        className="flex-1"
      />
      <Button 
        type="submit"
        disabled={isLoading}
        className="flex items-center gap-2"
      >
        <Search className="h-4 w-4" />
        Search
      </Button>
    </form>
  );
}