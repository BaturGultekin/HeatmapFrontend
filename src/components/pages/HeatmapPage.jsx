// components/pages/HeatmapPage.jsx
import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import HeatmapWrapper from "../../HeatmapWrapper"; // Adjust path as needed
import { Box, Button, Typography, CircularProgress } from "@mui/material";
import "./HeatmapPage.css"; // Create this file for styling
import { cleanupSession } from "../../backendApi/heatmapData"

function HeatmapPage() {
  const [searchParams] = useSearchParams();
  const [fileData, setFileData] = useState(null);
  const [fileId, setFileId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [isFileProcessed, setIsFileProcessed] = useState(false);

  useEffect(() => {
    console.log("🔥 HeatmapWrapper Mounted");

    return () => {
      console.log("🗑️ HeatmapWrapper Unmounted");
    };
  }, []);


  useEffect(() => {
    // Get the file key from URL
    const fileKey = searchParams.get('fileKey');

    if (!fileKey) {
      setError("No file key provided. Please upload a file from the home page.");
      setLoading(false);
      return;
    }

    // Get the file from IndexedDB
    const request = indexedDB.open("HeatmapDB", 1);

    request.onerror = function (event) {
      console.error("Error opening IndexedDB:", event);
      setError("Failed to retrieve the file. Please try again.");
      setLoading(false);
    };

    request.onsuccess = function (event) {
      const db = event.target.result;
      const transaction = db.transaction(["files"], "readonly");
      const store = transaction.objectStore("files");

      const getRequest = store.get(fileKey);

      getRequest.onerror = function (event) {
        console.error("Error retrieving file:", event);
        setError("Failed to retrieve the file. Please try again.");
        setLoading(false);
      };

      getRequest.onsuccess = function (event) {
        const file = event.target.result;

        if (!file) {
          setError("File not found. The session may have expired.");
          setLoading(false);
          return;
        }

        // Extract the file ID (filename without extension)
        const fileName = file.name;
        const id = fileName.replace(/\.[^/.]+$/, "");

        setFileId(id);
        setFileData(file); // Store the actual File object
        setLoading(false);

        // Set page title
        document.title = `Heatmap - ${id}`;
      };
    };
  }, [searchParams]);

  return (
    <div className="heatmap-page">
      <Box
        sx={{
          height: "38px",
          minHeight: "38px",
          boxSizing: "border-box",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0 14px",
          borderBottom: "2px solid #1E90FF",
          backgroundColor: "#f8f8f8",
          flexShrink: 0,
        }}
      >
        <Typography
          variant="body2"
          sx={{
            fontSize: "13px",
            lineHeight: 1,
          }}
        >
          <strong>Filename:</strong>{" "}
          <span
            style={{
              color: "#1E90FF",
              fontWeight: 600
            }}
          >
            {fileId || "Loading..."}
          </span>
        </Typography>
        <Button
          variant="outlined"
          onClick={() => {
            if (sessionId) {
              // ✅ Call your backend cleanup API
              cleanupSession(sessionId).finally(() => {
                window.close(); // ✅ Close after cleanup (regardless of success or failure)
              });
            } else {
              window.close(); // ✅ If no session, just close
            }
          }}
          sx={{
            minWidth: "64px",
            height: "26px",
            padding: "1px 10px",
            color: "#1E90FF",
            borderColor: "#1E90FF",
            fontWeight: 600,
            fontSize: "12px",
            textTransform: "none",

            '&:hover': {
              backgroundColor: 'rgba(30, 144, 255, 0.08)',
              borderColor: '#1E90FF',
            }
          }}
        >
          Close
        </Button>

      </Box>

      {loading ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            height: "calc(100% - 38px)",
            gap: "20px",
          }}
        >
          <CircularProgress />
          <Typography>Loading heatmap data...</Typography>
        </Box>
      ) : error ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            height: "calc(100% - 38px)",
            gap: "20px",
            padding: "20px",
            textAlign: "center",
          }}
        >
          <Typography color="error" variant="h6">{error}</Typography>
          <Typography>
            Please try uploading your file again or close this tab and return to the main page.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => window.close()}
          >
            Close Tab
          </Button>
        </Box>
      ) : (
        <Box
          sx={{
            height: "calc(100% - 38px)",
            width: "100%",
            overflow: "scroll",
            position: "relative",
            display: "flex",              // ✅ Add this
            flexDirection: "column"       // ✅ Add this
            // border:"5px solid black"
          }}
        >
          <HeatmapWrapper
            data={fileData}
            id={fileId}
            fileSelectedFlag={!isFileProcessed}  // Only trigger processing if not yet processed
            homepage={false}
            onSessionReady={(sessionId) => {
              setSessionId(sessionId);
              setIsFileProcessed(true);  // Mark file as processed to avoid remounts
            }}
          />
        </Box>
      )}
    </div>
  );
}

export default HeatmapPage;