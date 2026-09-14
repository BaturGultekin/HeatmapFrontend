// ListComponent.tsx
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import React from 'react';
import Divider from '@mui/material/Divider';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { styled } from '@mui/material/styles';


const StyledListItemButton = styled(ListItemButton)(({ theme }) => ({
  backgroundColor: '#FFFFFF',

  '&:hover': {
    backgroundColor: '#F5F5F5',
  },

  '&.Mui-selected': {
    backgroundColor: theme.palette.primary.main,
  },

  '&.Mui-selected:hover': {
    backgroundColor: theme.palette.primary.dark,
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
        borderRadius: '5px',
        ml: 0,
        mr: 0,
        pt: 0,
        pb: 0,
        border: '0.5px solid black',
        overflow: 'hidden'
      }}
    >
      {['A-z', 'Cluster', 'Sum', 'Variance'].map((text, idx) => (
        <React.Fragment key={text}>

          <ListItem disablePadding>

            <StyledListItemButton
              sx={{ height: 30 }}
              selected={selectedIndex === idx}
              onClick={() => handleItemClick(idx)}
            >

              <ListItemText
                primary={text}
                primaryTypographyProps={{
                  style: {
                    fontSize: '14px',
                    fontWeight: 'bold',
                    fontFamily: 'Arial, sans-serif',
                    textAlign: 'center',

                    // White text when selected,
                    // dark text when not selected
                    color:
                      selectedIndex === idx
                        ? '#FFFFFF'
                        : '#333333',
                  },
                }}
              />

            </StyledListItemButton>

          </ListItem>

          {idx !== 3 && <Divider />}

        </React.Fragment>
      ))}
    </List>
  );
};


export default ListComponent;
