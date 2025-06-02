// Attach event listener to the "Start Extraction" button once the DOM is fully loaded
document.addEventListener("DOMContentLoaded", function() {
  const startButton = document.getElementById("startButton");

  // Ensure that the button is found
  if (startButton) {
    startButton.addEventListener("click", startExtraction);
  }
});

// Function to handle file input and read the file as text
document.getElementById("fileInput").addEventListener("change", function(e) {
  const file = e.target.files[0];
  
  if (!file) {
    alert("Please select a file.");
    return;
  }

  const reader = new FileReader();

  reader.onerror = function() {
    alert("Error reading the file.");
  };

  reader.onload = function(event) {
    const xmlText = event.target.result;

    // Log the file content for debugging purposes
    console.log("File content loaded:", xmlText);

    // Check if it's an XML file by verifying the first part of the content
    if (!xmlText.startsWith('<?xml')) {
      alert("Please upload a valid XML file.");
      return;
    }

    window.xmlText = xmlText;
  };

  reader.readAsText(file);
});

// The startExtraction function that runs all steps
function startExtraction() {
  console.log("Start Extraction button clicked!"); // Debugging log

  if (!window.xmlText) {
    alert("Please upload a valid XML file first.");
    return;
  }

  // Step 1: Extract everything from the beginning of the file up to and including <part-list>
  const partListIndex = window.xmlText.indexOf("<part-list>");
  if (partListIndex === -1) {
    alert("<part-list> tag not found in the XML file.");
    return;
  }

  const partListEndIndex = partListIndex + "<part-list>".length;
  let extractedContent = window.xmlText.slice(0, partListEndIndex);

  // Step 2: Loop through all parts in the XML file
  let partStartIndex = 0;
  let partEndIndex = 0;
  let partCount = 0;

  while ((partStartIndex = window.xmlText.indexOf('<score-part id="P', partStartIndex)) !== -1) {
    // Find the end of the <score-part> section
    const scorePartEndIndex = window.xmlText.indexOf('</score-part>', partStartIndex) + '</score-part>'.length;
    const scorePartContent = window.xmlText.slice(partStartIndex, scorePartEndIndex);

    // Find the corresponding <part id="P"> section
    const partStartTagIndex = window.xmlText.indexOf('<part id="P', scorePartEndIndex);
    const partEndTagIndex = window.xmlText.indexOf('</part>', partStartTagIndex) + '</part>'.length;
    const partContent = window.xmlText.slice(partStartTagIndex, partEndTagIndex);

    // Append the extracted content for this part
    extractedContent += "\n" + scorePartContent + "\n" + partContent;

    // Move the starting point to the next part
    partStartIndex = partEndTagIndex;
    partCount++;
  }

  // Step 3: Append </score-partwise> at the end to close the XML document
  const finalXmlString = extractedContent + "\n</score-partwise>";

  // Display the final content (for debugging or preview)
  document.getElementById("output").textContent = finalXmlString;

  // Step 4: Automatically create the download link and trigger the download
  const blob = new Blob([finalXmlString], { type: "application/xml" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "final_extracted_all_parts.xml";
  link.click();
}
