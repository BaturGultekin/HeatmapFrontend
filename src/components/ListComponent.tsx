// ListComponent.tsx
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import React from 'react';
import Divider from '@mui/material/Divider';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { styled } from '@mui/material/styles';


const StyledListItemButton = styled(ListItemButton)(({ theme }) => ({
  minHeight: '24px',
  height: '24px',
  paddingTop: 0,
  paddingBottom: 0,
  paddingLeft: '6px',
  paddingRight: '6px',

  backgroundColor: '#FFFFFF',

  transition:
    'background-color 0.16s ease, color 0.16s ease',

  '&:hover': {
    backgroundColor: '#E3F2FD',
  },

  '&.Mui-selected': {
    backgroundColor: theme.palette.primary.main,
  },

  '&.Mui-selected:hover': {
    backgroundColor: '#1565C0',
  },

  '&:active': {
    backgroundColor: '#BBDEFB',
  },

  '&.Mui-selected:active': {
    backgroundColor: '#1565C0',
  },

  '& .MuiTouchRipple-child': {
    backgroundColor: '#64B5F6',
  },
}));


interface ListComponentProps {
  selectedIndex: number;
  handleItemClick: (index: number) => void;
}


const ListComponent: React.FC<ListComponentProps> = ({
  selectedIndex,
  handleItemClick
}) => {

  return (
    <List
      sx={{
        backgroundColor: '#FFFFFF',

        border: '1px solid #d0d0d0',
        borderRadius: '6px',

        ml: 0,
        mr: 0,
        mt: 0,

        pt: 0,
        pb: 0,

        overflow: 'hidden'
      }}
    >
      {['A-z', 'Cluster', 'Sum', 'Variance'].map((text, idx) => (
        <React.Fragment key={text}>

          <ListItem disablePadding>

            <StyledListItemButton
              selected={selectedIndex === idx}
              onClick={() => handleItemClick(idx)}
            >

              <ListItemText
                primary={text}
                sx={{
                  margin: 0,
                }}
                primaryTypographyProps={{
                  style: {
                    fontSize: '13px',
                    lineHeight: '28px',
                    fontWeight: 600,
                    fontFamily: 'Arial, sans-serif',
                    textAlign: 'center',

                    color:
                      selectedIndex === idx
                        ? '#FFFFFF'
                        : '#1976d2',
                  },
                }}
              />

            </StyledListItemButton>

          </ListItem>

          {idx !== 3 && (
            <Divider
              sx={{
                borderColor: '#e0e0e0',
              }}
            />
          )}

        </React.Fragment>
      ))}
    </List>
  );
};


export default ListComponent;