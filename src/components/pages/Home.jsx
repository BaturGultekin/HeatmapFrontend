// components/pages/Home.jsx
import React, { useState } from "react";
import "./Home.css";
import HeatmapWrapper from "../../HeatmapWrapper"; // Adjust path as needed
import { Box, Button, Typography } from "@mui/material";
import defaultData from "../../data/top_250.json";
import sinaiLogo from './Mount_Sinai_hospital_logo.png';


function Home() {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    event.target.value = '';

    setIsProcessing(true);
    console.log("Selected file:", file);

    // Store the file in IndexedDB
    const request = indexedDB.open("HeatmapDB", 1);

    request.onupgradeneeded = function (event) {
      const db = event.target.result;
      // Create an object store if it doesn't exist
      if (!db.objectStoreNames.contains("files")) {
        db.createObjectStore("files");
      }
    };

    request.onsuccess = function (event) {
      const db = event.target.result;
      const transaction = db.transaction(["files"], "readwrite");
      const store = transaction.objectStore("files");

      // Generate a unique key for the file
      const fileKey = `file_${Date.now()}`;

      // Store the actual File object
      const storeRequest = store.put(file, fileKey);

      storeRequest.onsuccess = function () {
        // Open a new tab with a reference to the file
        // window.open(`/heatmap?fileKey=${encodeURIComponent(fileKey)}`, '_blank');
        window.open(`heatmap?fileKey=${encodeURIComponent(fileKey)}`, '_blank');
        // window.open(`/clusterchirp-test/heatmap?fileKey=${encodeURIComponent(fileKey)}`, '_blank');

        setIsProcessing(false);
      };

      storeRequest.onerror = function (error) {
        console.error("Error storing file:", error);
        alert("Failed to prepare the file for visualization. Please try again.");
        setIsProcessing(false);
      };
    };

    request.onerror = function (error) {
      console.error("Error opening IndexedDB:", error);
      alert("Failed to prepare the file for visualization. Please try again.");
      setIsProcessing(false);
    };
  };

  // Handler for showing sample data in a new tab
  const handleShowSampleData = () => {
    // Open a new tab with sample data page
    // window.open('/sample-data', '_blank');
    window.open('sample-data', '_blank');
    // window.open('/clusterchirp-test/sample-data', '_blank');


  };

  const homepageSidebarContent = (
    <Box
      sx={{
        padding: "8px 10px 6px",
        borderBottom: "1px solid #e0e0e0",
      }}
    >
      <input
        type="file"
        accept=".csv, .tsv, .xlsx, .json"
        onChange={handleFileChange}
        style={{ display: "none" }}
        id="file-upload"
        disabled={isProcessing}
      />

      <Box
        sx={{
          display: "flex",
          gap: "6px",
          width: "100%",
        }}
      >
        <label
          htmlFor="file-upload"
          style={{
            flex: 1,
            display: "block",
          }}
        >
          <Button
            variant="contained"
            component="span"
            fullWidth
            disabled={isProcessing}
            sx={{
              height: "30px",
              minWidth: 0,
              padding: "2px 6px",
              fontSize: "11px",
              fontWeight: 600,
              textTransform: "none",
              whiteSpace: "nowrap",
            }}
          >
            {isProcessing ? "Processing..." : "Upload Data"}
          </Button>
        </label>

        <Button
          variant="outlined"
          onClick={handleShowSampleData}
          sx={{
            flex: 1,
            height: "30px",
            minWidth: 0,
            padding: "2px 6px",
            fontSize: "11px",
            fontWeight: 600,
            textTransform: "none",
            whiteSpace: "nowrap",
          }}
        >
          Data Format
        </Button>
      </Box>

      <Typography
        sx={{
          textAlign: "center",
          fontSize: "9.5px",
          lineHeight: 1.2,
          color: "#777",
          fontStyle: "italic",
          marginTop: "5px",
        }}
      >
        ClusterChirp is freely available for all users.
        <br />
        No registration required.
      </Typography>
    </Box>
  );

  // defaultData = null

  // Your existing JSX for the Home component
  return (
    <>
      <div className="wrapper">
        <div className="extraSpace">
          {/* <div className="circle-container">
            <h3 className="circleText">
              <span className="circleText-cluster">Cluster</span>
              <span className="circleText-chirp">Chirp</span>
            </h3>
            <img src="clusterChirp_icon.svg" alt="Logo1" className="giflogo" />
          </div> */}
        </div>

        <div className="home">
          {/* Introduction Text */}
          <Typography
            sx={{
              textAlign: "center",
              margin: 0,
              padding: "8px 16px 6px",
              width: "100%",
              boxSizing: "border-box",
              lineHeight: "1.1",
              fontWeight: 'light',
              fontSize: '17.5px'
            }}
          >
            <strong>Welcome to ClusterChirp! </strong>
            Upload your data for on-the-fly clustering to uncover patterns and trends.
            Interact directly with the visualizations, explore your data using built-in AI Assistant!
            {/* <strong>Welcome to ClusterChirp!</strong>  Upload your data to perform on-the fly clustering and uncover patterns, trends, and anomalies. Interact directly with visualizations or explore using our built-in AI chatbot. Powerful analytics, intuitive interface. */}
          </Typography>
          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              width: "100%",
              position: "relative",
              display: "flex",
              flexDirection: "column",
              overflow: "auto",
              "&": {
                // ✅ Force scrollbar using CSS custom properties
                "--webkit-scrollbar-width": "12px",
                scrollbarWidth: "12px",
                overflowY: "scroll !important",
              },
              "&::-webkit-scrollbar": {
                width: "12px !important",
                backgroundColor: "#e1e1e1 !important",
                position: "relative !important",
                zIndex: "9999 !important",
              },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "#888 !important",
                borderRadius: "8px !important",
                minHeight: "40px !important",
              },
            }}
          >
            <HeatmapWrapper
              data={defaultData}
              id="defaultheatmap"
              fileSelectedFlag={false}
              homepage={true}
              sidebarTopContent={homepageSidebarContent}
            />
          </Box>
        </div>

        <div className="extraSpace">
        </div>
      </div>
    </>
  );
}

export default Home;