import SearchIcon from '@mui/icons-material/Search';
import { Autocomplete } from '@mui/material';
import TextField from '@mui/material/TextField';
import React, { useEffect, useState, useRef } from 'react';

type SearchBoxProps = {
  elements: string[];
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
};

const CONTROL_COLORS = {
  text: '#777777',
  primary: '#1976d2',
  primaryHover: '#1565c0',
  hover: '#E3F2FD',
  border: '#d0d0d0',
  background: '#FFFFFF',
};

const SearchBox: React.FC<SearchBoxProps> = ({
  elements,
  setSearchTerm
}) => {
  const [searchText, setSearchText] = useState('');
  const [filteredOptions, setFilteredOptions] = useState<string[]>([]);

  const searchIconRef = useRef<SVGSVGElement>(null);

  // Update filtered options whenever searchText changes
  useEffect(() => {
    if (searchText.trim().length === 0) {
      setFilteredOptions([]);
      setSearchTerm('');
    } else {
      setFilteredOptions(
        elements?.filter((label: string) =>
          label.toLowerCase().startsWith(searchText.toLowerCase())
        )
      );
    }
  }, [searchText, elements, setSearchTerm]);

  // Trigger search
  const triggerSearch = () => {
    setSearchTerm(searchText);
  };

  // Enter key
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      triggerSearch();
    }
  };

  // Select autocomplete option
  const handleOptionSelect = (
    _event: any,
    value: string | null
  ) => {
    if (value) {
      setSearchText(value);
      setSearchTerm(value);
    }
  };

  return (
    <div
      style={{
        marginLeft: '10px',
        marginRight: '10px',
        marginTop: '5px'
      }}
    >
      <Autocomplete
        options={filteredOptions}
        getOptionLabel={(option: string) => option}
        inputValue={searchText}

        onInputChange={(_, value) => {
          setSearchText(value);
        }}

        onChange={handleOptionSelect}
        openOnFocus={false}
        filterOptions={(x) => x}

        ListboxProps={{
          style: {
            paddingTop: '2px',
            paddingBottom: '2px',
            maxHeight: '160px',
          },
        }}

        renderOption={(props, option) => (
          <li
            {...props}
            style={{
              ...props.style,
              minHeight: '26px',
              padding: '3px 8px',
              fontSize: '11px',
              lineHeight: '18px',
              fontFamily: 'Arial, sans-serif',
              color: 'black',
            }}
          >
            {option}
          </li>
        )}

        sx={{
          width: '100%',


          // Normal border
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: CONTROL_COLORS.border,
          },

          // Border on hover anywhere over control
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#64B5F6',
          },

          // Focused border
          '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: CONTROL_COLORS.primary,
          },

          // Input text
          '& .MuiInputBase-input': {
            color: CONTROL_COLORS.primary,
            fontFamily: 'Arial, sans-serif',
            fontSize: '13px',
            fontWeight: 'normal',
          },

          // Placeholder
          '& .MuiInputBase-input::placeholder': {
            color: CONTROL_COLORS.text,
            opacity: 1,
          },

          // Placeholder becomes blue when entire control is hovered
          '&:hover .MuiInputBase-input::placeholder': {
            color: CONTROL_COLORS.primary,
          },

          // Placeholder stays blue while focused
          '& .MuiOutlinedInput-root.Mui-focused .MuiInputBase-input::placeholder': {
            color: CONTROL_COLORS.primary,
          },

          // Search icon normal
          '& .MuiAutocomplete-popupIndicator': {
            transform: 'none',
            color: CONTROL_COLORS.text,
          },

          // Search icon turns blue when hovering anywhere
          '&:hover .MuiAutocomplete-popupIndicator': {
            color: CONTROL_COLORS.primary,
            backgroundColor: 'transparent',
          },

          // Search icon remains blue while active/focused
          '&.Mui-focused .MuiAutocomplete-popupIndicator': {
            color: CONTROL_COLORS.primary,
          },

          // Icon's own hover
          '& .MuiAutocomplete-popupIndicator:hover': {
            color: CONTROL_COLORS.primary,
            backgroundColor: CONTROL_COLORS.hover,
          },
        }}

        popupIcon={
          <SearchIcon
            ref={searchIconRef}
            onClick={(e) => {
              e.stopPropagation();
              triggerSearch();
            }}
            sx={{
              fontSize: '20px',
            }}
          />
        }

        renderInput={(params) => (
          <TextField
            {...params}

            InputProps={{
              ...params.InputProps,

              style: {
                fontSize: 13,
                fontWeight: 'normal',
                fontFamily: 'Arial, sans-serif',
              },

              endAdornment: (
                <React.Fragment>
                  {params.InputProps.endAdornment}
                </React.Fragment>
              ),
            }}

            placeholder="Search Genes..."
            variant="outlined"
            size="small"
            fullWidth
            onKeyDown={handleKeyDown}
          />
        )}
      />
    </div>
  );
};

export default SearchBox;