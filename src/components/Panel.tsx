
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import DownloadIcon from '@mui/icons-material/Download';
import MenuIcon from '@mui/icons-material/Menu';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import CropIcon from '@mui/icons-material/Crop';
import { Tooltip } from '@mui/material';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import { styled, useTheme } from '@mui/material/styles';
import React, { useEffect, useMemo, useState } from 'react';
import FiltersSection from './Filters';

import type {
  DataStateShape
} from '../types';
import { order } from '../types';
import MultiSelect from './CustomMultiSelect';
import ListComponent from './ListComponent';
import SearchBox from './SearchBox';
import CustomSlider from './Slider';
import SimpleSelection from './SimpleSelection';
import MultipurposeSlider from './opcatiySlider';
import ReplayIcon from '@mui/icons-material/Replay';
import MapIcon from '@mui/icons-material/Map'; // If you want to add a toggle button
import { ORDER_INDEX } from '../const';
const orderArray = ['alphabetically', 'cluster', 'sum', 'variance']
// interface order{
//     row:string;
//     col:string;
//     rowCat:string[];
//     sortByRowCat:boolean;
//     colCat:string[];
//     sortByColCat:boolean;
// }
interface CropBox {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}
export default function PersistentDrawerLeft({
  parentContainerRef,
  setIsDrawerOpen,
  setOpacityValue,
  setPvalThreshold,
  setOrder,
  categories,
  resultCategories,
  order,
  Legend,
  panelWidth,
  ID,
  dataState,
  setState,
  setResultCategory,
  setSearchTerm,
  downloadHeatmap,
  downloadMatrix,
  setCropping,
  setFilteredIdxDict,
  cropBox,
  isMinimapEnabled,
  setIsMinimapEnabled,
  filters,
  setFilters,
  onRenderHeatmap,
  notifyClusteringStarted,
  notifySortStarted,
  setRowClusterValue,
  setColClusterValue,
  chatContent
}: {
  parentContainerRef: HTMLDivElement;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setOpacityValue: React.Dispatch<React.SetStateAction<number>>;
  setPvalThreshold?: React.Dispatch<React.SetStateAction<number>>;
  setOrder: React.Dispatch<React.SetStateAction<any>>;
  categories: { row: {}; col: {}; };
  resultCategories?: string[];
  order: order;
  Legend: React.ReactElement;
  panelWidth: number;
  ID: string;
  dataState: DataStateShape | null;
  setState?: React.Dispatch<React.SetStateAction<string>>;
  setResultCategory?: React.Dispatch<React.SetStateAction<string>>;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  downloadHeatmap: any;
  downloadMatrix: any;
  setCropping: any;
  setFilteredIdxDict: any;
  cropBox: CropBox | null;
  isMinimapEnabled: boolean;
  setIsMinimapEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  filters: { row: any[], col: any[] };
  setFilters: React.Dispatch<React.SetStateAction<{ row: any[], col: any[] }>>;
  onRenderHeatmap: (currentFilters: any) => void; // ✅ Requires filters parameter
  notifyClusteringStarted: any;
  notifySortStarted: any;
  setRowClusterValue: React.Dispatch<React.SetStateAction<number>>;
  setColClusterValue: React.Dispatch<React.SetStateAction<number>>;
  chatContent?: (onCommandRun: () => void) => React.ReactNode;
}) {
  const [isDrawerOpen, setDrawerOpen] = useState(true);
  const [isAIExpanded, setIsAIExpanded] = useState(false);
  const aiPanelRef = React.useRef<HTMLDivElement>(null);
  const theme = useTheme();
  // const [selectedRowIndex, setSelectedRowIndex] = useState(0)
  const [selectedRowIndex, setSelectedRowIndex] = useState(ORDER_INDEX[order["row"]]);
  const [selectedColIndex, setSelectedColIndex] = useState(ORDER_INDEX[order["col"]]);



  const rowlabels = useMemo(
    () => {
      if (dataState) {
        return dataState.rowLabels?.map((ele: { text: string }) => ele.text)
      }
      else {
        return null
      }
    }, [dataState?.rowLabels]);

  const drawerWidth = panelWidth;
  const colCategorynames = Object.keys(categories.col);
  const rowCategorynames = Object.keys(categories.row);


  // const handleRowItemClick = (index: number) => {
  //   console.log('rowitemclick')
  //   setSelectedRowIndex(index);
  //   setOrder((prevOrder:any) => ({ ...prevOrder, row: orderArray[index], sortByRowCat:""}));
  // };

  // const handleColItemClick = (index: number) => {
  //   setSelectedColIndex(index);
  //   setOrder((prevOrder:any) => ({ ...prevOrder, col: orderArray[index], sortByColCat:""}));
  // };
  const handleRowItemClick = (index: number) => {
    const actionType = orderArray[index];
    if (actionType === 'cluster') {
      notifyClusteringStarted();
    } else {
      notifySortStarted(actionType, 'rows');
    }

    // 2. ✅ Then, set the order to begin the work (your existing logic)
    setSelectedRowIndex(index);
    setOrder((prevOrder: any) => ({
      ...prevOrder,
      row: actionType,
      sortByRowCat: "",
      sortColsByRowName: null  // Clear gene-based column sorting when changing row sort
    }));
  };

  const handleColItemClick = (index: number) => {
    const actionType = orderArray[index];

    if (actionType === 'cluster') {
      notifyClusteringStarted();
    } else {
      notifySortStarted(actionType, 'columns');
    }

    // 2. ✅ Then, set the order to begin the work (your existing logic)
    setSelectedColIndex(index);
    setOrder((prevOrder: any) => ({ ...prevOrder, col: actionType, sortByColCat: "", sortColsByRowName: null }));
  };

  useEffect(() => {
    const parentContainer = parentContainerRef;
    const drawer = document.querySelector('.MuiDrawer-paper');
    if (parentContainer && drawer instanceof HTMLElement) {
      const parentContainerHeight = parentContainer.offsetHeight;
      drawer.style.height = `${parentContainerHeight}px`;
    }
  }, [parentContainerRef]);

  // AI Assistant: collapse when clicking outside
  useEffect(() => {
    if (!isAIExpanded) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        aiPanelRef.current &&
        !aiPanelRef.current.contains(event.target as Node)
      ) {
        setIsAIExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isAIExpanded]);

  const DrawerHeader = styled('div')(({ }) => ({
    display: 'flex',
    alignItems: 'center',
    paddingTop: '2px', // Adjust the top padding to control the height
    paddingBottom: '2px',
    justifyContent: 'flex-end',
  }));

  const handleDrawerOpen = () => {
    setDrawerOpen(true);
    setIsDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
    setIsDrawerOpen(false);
  };
  return (
    <div style={{ width: drawerWidth, height: '100%', margin: '0px' }}>
      <IconButton
        color="inherit"
        aria-label="open drawer"
        onClick={handleDrawerOpen}
        edge="start"
        sx={{
          position: 'absolute',
          top: 1,
          left: 2,
          zIndex: 1000, // Add this line to set the z-index of the IconButton
          mr: 0, ...(isDrawerOpen && { display: 'none' })
        }}
      >
        <MenuIcon />
      </IconButton>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            top: 1,
            left: 2,
            position: 'absolute',
          },
          position: 'relative',
          height: '100%',
          maxHeight: '100vh',
          zIndex: 1
        }}
        variant="persistent"
        anchor="left"
        open={isDrawerOpen}
      >
        <DrawerHeader>
          <Tooltip
            title="Take snapshot"
            slotProps={{
              popper: {
                modifiers: [
                  {
                    name: 'offset',
                    options: {
                      offset: [0, -14],
                    },
                  },
                ],
              },
            }}>
            <IconButton onClick={downloadHeatmap}>
              <PhotoCameraIcon />
            </IconButton>

          </Tooltip>
          <Tooltip
            title="Download Matrix"
            slotProps={{
              popper: {
                modifiers: [
                  {
                    name: 'offset',
                    options: {
                      offset: [0, -14],
                    },
                  },
                ],
              },
            }}>
            <IconButton onClick={downloadMatrix}>
              <DownloadIcon />
            </IconButton>

          </Tooltip>
          {
            cropBox ?
              <IconButton onClick={setFilteredIdxDict} >
                <ReplayIcon />
              </IconButton> :
              <Tooltip
                title="Crop Mode"
                slotProps={{
                  popper: {
                    modifiers: [
                      {
                        name: 'offset',
                        options: {
                          offset: [0, -14],
                        },
                      },
                    ],
                  },
                }}>
                <IconButton onClick={setCropping} >
                  <CropIcon />
                </IconButton>

              </Tooltip>
          }
          {/* ✅ NEW: Toggle Minimap Button */}
          <Tooltip
            title="Toggle Minimap"
            slotProps={{
              popper: {
                modifiers: [
                  {
                    name: 'offset',
                    options: {
                      offset: [0, -14],
                    },
                  },
                ],
              },
            }}
          >
            <IconButton onClick={() => setIsMinimapEnabled(!isMinimapEnabled)}>
              <MapIcon color={isMinimapEnabled ? "primary" : "action"} />
            </IconButton>
          </Tooltip>

          <IconButton onClick={handleDrawerClose}>
            {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <div
          style={{
            marginLeft: '10px',
            marginRight: '10px',
            display: 'flex',
            flexDirection: 'row',
            gap: '16px',
            alignItems: 'flex-start'
          }}
        >
          <div
            style={{
              width: '50%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-start'
            }}
          >
            <h3
              style={{
                margin: '0',
                padding: '0',
                fontSize: '14px',
                fontWeight: 'normal',
                fontFamily: 'Arial, sans-serif'
              }}
            >
              Row Order
            </h3>

            <ListComponent
              selectedIndex={ORDER_INDEX[order["row"]]}
              handleItemClick={handleRowItemClick}
            />
          </div>

          <div
            style={{
              width: '50%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-start'
            }}
          >
            <h3
              style={{
                margin: '0',
                padding: '0',
                fontSize: '14px',
                fontWeight: 'normal',
                fontFamily: 'Arial, sans-serif'
              }}
            >
              Column Order
            </h3>

            <ListComponent
              selectedIndex={ORDER_INDEX[order["col"]]}
              handleItemClick={handleColItemClick}
            />
          </div>
        </div>
        {/* Cluster depth controls */}
        {(order.row === 'cluster' || order.col === 'cluster') && (
          <div
            style={{
              marginLeft: '10px',
              marginRight: '10px',
              marginTop: '8px',
              marginBottom: '8px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}
          >

            {order.row === 'cluster' && (
              <div>
                <div
                  style={{
                    fontSize: '12px',
                    fontFamily: 'Arial, sans-serif',
                    marginBottom: '2px'
                  }}
                >
                  Row Cluster Depth
                </div>

                <CustomSlider
                  setClusterValue={setRowClusterValue}
                />
              </div>
            )}

            {order.col === 'cluster' && (
              <div>
                <div
                  style={{
                    fontSize: '12px',
                    fontFamily: 'Arial, sans-serif',
                    marginBottom: '2px'
                  }}
                >
                  Column Cluster Depth
                </div>

                <CustomSlider
                  setClusterValue={setColClusterValue}
                />
              </div>
            )}

          </div>
        )}
        {rowlabels && <SearchBox elements={rowlabels} setSearchTerm={setSearchTerm} />}
        <div style={{ marginLeft: '10px', marginRight: '10px', marginTop: '5px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
          <h3 style={{
            margin: '0', padding: '0', marginTop: '0', marginBottom: '0px', fontSize: '14px', fontWeight: 'normal', fontFamily: 'Arial, sans-serif'
          }}>
            Opacity Slider
          </h3>
          <MultipurposeSlider direction='horizontal' setOpacityValue={setOpacityValue} minVal={0.5} maxVal={3} step={0.25} initialVal={1} />
          {/* <MultipurposeSlider direction='horizontal' setOpacityValue={setOpacityValue} minVal={0} maxVal={1} step={0.05} initialVal={0.05} calculateSteps={true}/> */}
        </div>

        {['olinkHeatmap', 'cytofHeatmap', 'serologyHeatmap', 'rnaseqHeatmap'].includes(ID) && setPvalThreshold &&
          <div style={{ marginLeft: '10px', marginRight: '10px', marginTop: '10px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
            <h3 style={{
              margin: '0', padding: '0', marginTop: '0', marginBottom: '2px', fontSize: '14px', fontWeight: 'normal', fontFamily: 'Arial, sans-serif'
            }}>
              P-value Slider
            </h3>
            <MultipurposeSlider direction='horizontal' setOpacityValue={setPvalThreshold} minVal={0} maxVal={1} step={0.05} initialVal={0.05} calculateSteps={true} />
          </div>
        }

        <div style={{ marginLeft: '10px', marginRight: '10px', marginTop: '10px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
          <h3 style={{
            margin: '0', padding: '0', marginTop: '0', marginBottom: '0px', fontSize: '14px', fontWeight: 'normal', fontFamily: 'Arial, sans-serif'
          }}>
            Matrix Values
          </h3>
        </div>
        <div style={{ marginLeft: '10px', marginRight: '10px', marginTop: '0px', marginBottom: '5px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
          {Legend}
        </div>

        {/* 🆕 ADD FILTERS SECTION HERE */}
        <FiltersSection
          filters={filters}
          setFilters={setFilters}
          onRenderHeatmap={onRenderHeatmap}
        />

        {colCategorynames.length > 0 &&
          <div style={{ marginLeft: '10px', marginRight: '10px', marginTop: '10px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
            <MultiSelect elements={colCategorynames} order={order} setOrder={setOrder} axis='col' />
          </div>}

        {rowCategorynames.length > 0 &&
          <div style={{ marginLeft: '10px', marginRight: '10px', marginTop: '10px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
            <MultiSelect elements={rowCategorynames} order={order} setOrder={setOrder} axis='row' />
          </div>}

        {chatContent && (
          <div
            ref={aiPanelRef}
            onClick={isAIExpanded ? undefined : () => setIsAIExpanded(true)}
            style={
              isAIExpanded
                ? {
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  zIndex: 1500,
                  backgroundColor: '#ffffff',
                  boxSizing: 'border-box',
                  padding: '16px 10px',
                  overflowY: 'auto',
                  overflowX: 'hidden',
                }
                : {
                  marginLeft: '10px',
                  marginRight: '10px',
                  marginTop: '0px',
                  paddingTop: '0px',
                  // borderTop: '1px solid #e0e0e0',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-start',
                  cursor: 'pointer',
                }
            }
          >
            <h3
              style={{
                margin: '0',
                marginBottom: isAIExpanded ? '6px' : '6px',
                padding: '0',
                fontSize: isAIExpanded ? '16px' : '14px',
                fontWeight: isAIExpanded ? 600 : 'normal',
                fontFamily: 'Arial, sans-serif',
              }}
            >
            </h3>

            {chatContent(() => setIsAIExpanded(false))}
          </div>
        )}

        {/* previous line */}
        {/* {ID==='olinkPatientHeatmap' && setState &&
        <div style={{ marginLeft: '10px', marginRight: '10px',marginTop:'30px',display: 'flex', flexDirection: 'column', justifyContent: 'flex-start'}}>
            <SimpleSelection elements={['Zscore','Raw']} setState={setState} initialValue='Zscore' labelName='Value Scale'/>
        </div>} */}

        {['olinkPatientHeatmap', 'cytofPatientHeatmap', 'serologyPatientHeatmap', 'rnaseqPatientHeatmap'].includes(ID) && setState &&
          <div style={{ marginLeft: '10px', marginRight: '10px', marginTop: '30px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
            <SimpleSelection elements={['Zscore', 'Raw']} setState={setState} initialValue='Zscore' labelName='Value Scale' />
          </div>}


        {['olinkHeatmap', 'cytofHeatmap', 'serologyHeatmap', 'rnaseqHeatmap'].includes(ID) && setResultCategory && resultCategories &&
          <div style={{ marginLeft: '10px', marginRight: '10px', marginTop: '50px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
            <SimpleSelection elements={resultCategories} setState={setResultCategory} initialValue={resultCategories[0]} labelName='Result Type' />
          </div>}
        {['olinkHeatmap', 'cytofHeatmap', 'serologyHeatmap', 'rnaseqHeatmap'].includes(ID) && setState &&
          <div style={{ marginLeft: '10px', marginRight: '10px', marginTop: '30px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
            <SimpleSelection elements={['logFC', 'nLogP']} setState={setState} initialValue='logFC' labelName='Value Type' />
          </div>
        }
        {/* <div style={{ marginLeft: '10px', marginRight: '10px',marginTop:'30px',display: 'flex', flexDirection: 'column', justifyContent: 'flex-start'}}>
            <SimpleSelection elements={['logFC','nLogP']} setState={setState} initialValue='logFC' labelName='Distance Type'/>
        </div> */}
      </Drawer>
    </div>
    // </div> 
  );
}