import React, { useState, useEffect } from 'react';

import {
  Box,
  Typography,
  Chip,
  Button,
  Divider,
  Stack,
  IconButton,
  Tooltip
} from '@mui/material';

import ClearAllIcon from '@mui/icons-material/ClearAll';
import RefreshIcon from '@mui/icons-material/Refresh';
import FilterListIcon from '@mui/icons-material/FilterList';


interface Filter {
  type: string;
  field?: string;
  value?: any;
  top_n?: number;
}

interface FiltersState {
  row: Filter[];
  col: Filter[];
}

interface FiltersSectionProps {
  filters: FiltersState;
  setFilters: React.Dispatch<React.SetStateAction<FiltersState>>;
  onRenderHeatmap: (currentFilters: FiltersState) => void;
}


const CONTROL_COLORS = {
  text: '#777777',
  primary: '#1976d2',
  primaryHover: '#1565c0',
  hover: '#E3F2FD',
  border: '#d0d0d0',
  background: '#FFFFFF',
};


const FiltersSection: React.FC<FiltersSectionProps> = ({
  filters,
  setFilters,
  onRenderHeatmap
}) => {

  const [pendingFilters, setPendingFilters] =
    useState<FiltersState>(filters);

  const [hasChanges, setHasChanges] = useState(false);


  // Update pending filters when original filters change
  useEffect(() => {
    setPendingFilters(filters);
    setHasChanges(false);
  }, [filters]);


  // Check for changes
  useEffect(() => {
    const filtersChanged =
      JSON.stringify(filters) !== JSON.stringify(pendingFilters);

    setHasChanges(filtersChanged);
  }, [filters, pendingFilters]);


  // Format filter display text
  const formatFilterText = (filter: Filter): string => {
    switch (filter.type) {
      case 'sample_filter':
        return `${filter.field}: ${filter.value}`;

      case 'variance':
        return `Top ${filter.top_n} most variant`;

      case 'expression':
        return `Top ${filter.top_n} most expressed`;

      case 'pvalue':
        return `P-value < ${filter.value}`;

      default:
        return `${filter.type}: ${filter.value || filter.top_n || 'Applied'
          }`;
    }
  };


  // Remove one filter
  const removeFilter = (
    axis: 'row' | 'col',
    index: number
  ) => {
    setPendingFilters(prev => ({
      ...prev,
      [axis]: prev[axis].filter((_, i) => i !== index)
    }));
  };


  // Clear filters for one axis
  const clearAxisFilters = (
    axis: 'row' | 'col'
  ) => {
    setPendingFilters(prev => ({
      ...prev,
      [axis]: []
    }));
  };


  // Clear all filters
  const clearAllFilters = () => {
    setPendingFilters({
      row: [],
      col: []
    });
  };


  // Apply changes
  const applyChanges = () => {
    setFilters(pendingFilters);
    onRenderHeatmap(pendingFilters);
    setHasChanges(false);
  };


  // Cancel pending changes
  const cancelChanges = () => {
    setPendingFilters(filters);
    setHasChanges(false);
  };


  const totalFilters =
    pendingFilters.row.length +
    pendingFilters.col.length;


  /*
   * Shared chip styling
   */
  const filterChipStyle = {
    height: '20px',
    fontSize: '10px',
    fontFamily: 'Arial, sans-serif',
    fontWeight: 500,

    backgroundColor: CONTROL_COLORS.hover,
    color: CONTROL_COLORS.primary,

    border: '1px solid #BBDEFB',

    '&:hover': {
      backgroundColor: '#BBDEFB',
    },

    '& .MuiChip-label': {
      px: '5px',
      whiteSpace: 'nowrap',
    },

    '& .MuiChip-deleteIcon': {
      fontSize: '14px',
      margin: '0 3px 0 -2px',
      color: CONTROL_COLORS.primary,
    },

    '& .MuiChip-deleteIcon:hover': {
      color: CONTROL_COLORS.primaryHover,
    },
  };


  /*
   * EMPTY FILTER STATE
   */
  if (totalFilters === 0 && !hasChanges) {
    return (
      <Box
        sx={{
          mx: '10px',
          mt: '28px',

          border: `1px solid ${CONTROL_COLORS.border}`,
          borderRadius: '4px',

          padding: '4px',

          backgroundColor: CONTROL_COLORS.background,

          transition:
            'border-color 150ms ease',

          '&:hover': {
            borderColor: '#64B5F6',
          },

          // Title + icon turn blue when hovering
          // anywhere over the entire panel
          '&:hover .filters-title': {
            color: CONTROL_COLORS.primary,
          },
        }}
      >

        <Typography
          className="filters-title"
          variant="h6"
          sx={{
            fontSize: '13px',
            fontWeight: 'normal',
            fontFamily: 'Arial, sans-serif',

            mb: 0.25,

            display: 'flex',
            alignItems: 'center',
            gap: 0.75,

            color: CONTROL_COLORS.text,

            transition: 'color 150ms ease',
          }}
        >
          <FilterListIcon
            sx={{
              fontSize: '18px',
              color: 'inherit',
            }}
          />

          Filters
        </Typography>


        <Typography
          variant="body2"
          sx={{
            fontSize: '12px',
            fontFamily: 'Arial, sans-serif',
            color: CONTROL_COLORS.border
          }}
        >
          Use AI assistant to add filters
        </Typography>

      </Box>
    );
  }


  /*
   * ACTIVE FILTER STATE
   */
  return (
    <Box
      sx={{
        mx: '10px',
        mt: '25px',

        border: `1px solid ${CONTROL_COLORS.border}`,
        borderRadius: '4px',

        padding: '5px',

        backgroundColor: CONTROL_COLORS.background,

        transition:
          'border-color 150ms ease',

        '&:hover': {
          borderColor: '#64B5F6',
        },

        // Title + icon become blue when hovering
        // anywhere on the panel
        '&:hover .filters-title': {
          color: CONTROL_COLORS.primary,
        },
      }}
    >

      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 0.5,
        }}
      >

        <Typography
          className="filters-title"
          variant="h6"
          sx={{
            fontSize: '13px',
            fontWeight: 'normal',
            fontFamily: 'Arial, sans-serif',

            display: 'flex',
            alignItems: 'center',
            gap: 0.75,

            color: CONTROL_COLORS.text,

            transition: 'color 150ms ease',
          }}
        >
          <FilterListIcon
            sx={{
              fontSize: '18px',
              color: 'inherit',
            }}
          />

          Filters ({totalFilters})
        </Typography>


        {totalFilters > 0 && (
          <Tooltip title="Clear all filters">

            <IconButton
              size="small"
              onClick={clearAllFilters}
              sx={{
                p: 0.5,

                color: CONTROL_COLORS.text,

                '&:hover': {
                  color: CONTROL_COLORS.primary,
                  backgroundColor:
                    CONTROL_COLORS.hover,
                },
              }}
            >
              <ClearAllIcon
                sx={{
                  fontSize: '18px',
                }}
              />
            </IconButton>

          </Tooltip>
        )}

      </Box>


      {/* Row Filters */}
      {pendingFilters.row.length > 0 && (

        <Box
          sx={{
            mb: 0.5,
          }}
        >

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',

              mb: 0.4,
            }}
          >

            <Typography
              variant="subtitle2"
              sx={{
                fontSize: '11px',
                fontWeight: 'normal',
                fontFamily: 'Arial, sans-serif',

                color: CONTROL_COLORS.text,
              }}
            >
              Row Filters ({pendingFilters.row.length})
            </Typography>


            <Button
              size="small"
              variant="text"
              onClick={() =>
                clearAxisFilters('row')
              }
              sx={{
                fontSize: '10px',
                fontFamily: 'Arial, sans-serif',

                minWidth: 'auto',

                px: 0.5,
                py: 0.25,

                textTransform: 'none',

                color: CONTROL_COLORS.text,

                '&:hover': {
                  color: CONTROL_COLORS.primary,
                  backgroundColor:
                    CONTROL_COLORS.hover,
                },
              }}
            >
              Clear
            </Button>

          </Box>


          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',

              gap: '2px',

              alignItems: 'flex-start',
            }}
          >

            {pendingFilters.row.map(
              (filter, index) => (

                <Chip
                  key={index}
                  label={formatFilterText(filter)}
                  size="small"

                  onDelete={() =>
                    removeFilter('row', index)
                  }

                  sx={filterChipStyle}
                />

              )
            )}

          </Box>

        </Box>
      )}


      {/* Column Filters */}
      {pendingFilters.col.length > 0 && (

        <Box
          sx={{
            mb: 0,
          }}
        >

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',

              mb: 0.4,
            }}
          >

            <Typography
              variant="subtitle2"
              sx={{
                fontSize: '11px',
                fontWeight: 'normal',
                fontFamily: 'Arial, sans-serif',

                color: CONTROL_COLORS.text,
              }}
            >
              Column Filters ({pendingFilters.col.length})
            </Typography>


            <Button
              size="small"
              variant="text"
              onClick={() =>
                clearAxisFilters('col')
              }
              sx={{
                fontSize: '10px',
                fontFamily: 'Arial, sans-serif',

                minWidth: 'auto',

                px: 0.5,
                py: 0.25,

                textTransform: 'none',

                color: CONTROL_COLORS.text,

                '&:hover': {
                  color: CONTROL_COLORS.primary,
                  backgroundColor:
                    CONTROL_COLORS.hover,
                },
              }}
            >
              Clear
            </Button>

          </Box>


          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',

              gap: '2px',

              alignItems: 'flex-start',
            }}
          >

            {pendingFilters.col.map(
              (filter, index) => (

                <Chip
                  key={index}
                  label={formatFilterText(filter)}
                  size="small"

                  onDelete={() =>
                    removeFilter('col', index)
                  }

                  sx={filterChipStyle}
                />

              )
            )}

          </Box>

        </Box>
      )}


      {/* Action Buttons */}
      {hasChanges && (
        <>

          <Divider
            sx={{
              my: 0.75,
            }}
          />


          <Stack
            direction="row"
            spacing={0.75}
            sx={{
              mt: 0.75,
            }}
          >

            <Button
              variant="contained"
              size="small"

              startIcon={
                <RefreshIcon
                  sx={{
                    fontSize: '16px !important',
                  }}
                />
              }

              onClick={applyChanges}

              sx={{
                fontSize: '11px',
                fontFamily: 'Arial, sans-serif',
                fontWeight: 500,

                textTransform: 'none',

                backgroundColor:
                  CONTROL_COLORS.primary,

                boxShadow: 'none',

                '&:hover': {
                  backgroundColor:
                    CONTROL_COLORS.primaryHover,

                  boxShadow: 'none',
                },
              }}
            >
              Render Heatmap
            </Button>


            <Button
              variant="outlined"
              size="small"

              onClick={cancelChanges}

              sx={{
                fontSize: '11px',
                fontFamily: 'Arial, sans-serif',
                fontWeight: 500,

                textTransform: 'none',

                borderColor:
                  CONTROL_COLORS.border,

                color:
                  CONTROL_COLORS.text,

                '&:hover': {
                  borderColor:
                    CONTROL_COLORS.primary,

                  color:
                    CONTROL_COLORS.primary,

                  backgroundColor:
                    CONTROL_COLORS.hover,
                },
              }}
            >
              Cancel
            </Button>

          </Stack>

        </>
      )}

    </Box>
  );
};


export default FiltersSection;