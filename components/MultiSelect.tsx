'use client';

import { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown, X } from 'lucide-react';

interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectProps {
  label: string;
  options: MultiSelectOption[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  badgeColor?: 'orange' | 'blue' | 'purple' | 'green';
}

export default function MultiSelect({
  label,
  options,
  selectedValues,
  onChange,
  placeholder = 'Select...',
  badgeColor = 'orange',
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const badgeColors = {
    orange: 'bg-orange-100 text-orange-800 hover:bg-orange-200',
    blue: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
    purple: 'bg-purple-100 text-purple-800 hover:bg-purple-200',
    green: 'bg-green-100 text-green-800 hover:bg-green-200',
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const toggleOption = (value: string) => {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter(v => v !== value));
    } else {
      onChange([...selectedValues, value]);
    }
  };

  const selectAll = () => {
    onChange(options.map(opt => opt.value));
  };

  const clearAll = () => {
    onChange([]);
  };

  const removeValue = (value: string) => {
    onChange(selectedValues.filter(v => v !== value));
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {selectedValues.length > 0 && `(${selectedValues.length})`}
      </label>

      {/* Dropdown Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 text-left border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white hover:bg-gray-50 transition-colors flex items-center justify-between"
      >
        <span className="text-sm text-gray-700 truncate">
          {selectedValues.length === 0
            ? placeholder
            : `${selectedValues.length} selected`}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-64 overflow-hidden">
          {/* Header with Select All / Clear All */}
          {options.length > 0 && (
            <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 bg-gray-50">
              <button
                type="button"
                onClick={selectAll}
                className="text-xs text-orange-600 hover:text-orange-700 font-medium"
              >
                Select All
              </button>
              <button
                type="button"
                onClick={clearAll}
                className="text-xs text-gray-600 hover:text-gray-700 font-medium"
              >
                Clear All
              </button>
            </div>
          )}

          {/* Options List */}
          <div className="overflow-y-auto max-h-48">
            {options.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500 italic">
                No options available
              </div>
            ) : (
              options.map((option) => {
                const isSelected = selectedValues.includes(option.value);
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => toggleOption(option.value)}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors flex items-center gap-2 ${
                      isSelected ? 'bg-orange-50' : ''
                    }`}
                  >
                    <div
                      className={`w-4 h-4 border rounded flex items-center justify-center flex-shrink-0 ${
                        isSelected
                          ? 'bg-orange-500 border-orange-500'
                          : 'border-gray-300'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span className="text-gray-900">{option.label}</span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Selected Items as Badges */}
      {selectedValues.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {selectedValues.map((value) => {
            const option = options.find(opt => opt.value === value);
            if (!option) return null;
            return (
              <span
                key={value}
                className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${badgeColors[badgeColor]}`}
              >
                {option.label}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeValue(value);
                  }}
                  className="hover:opacity-70"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}

