// This controller receives the pre-processed input value arrays, assembles a report and puts it into the DOM.

// This function is called from onloadAndFormFuncs.js upon successfully submitting the file 
// input form that takes a pdf. onloadAndFormFuncs.js passes an argument of 
// array: [<pdf filename>, <pdf text as a string>] to here:
const processFileInput = (resultArray) => {
    // Here the function searchCasHandP.pdfInput() in extractCasHandPfromTxt.js
    // is called to retrieve the CASRN(s), H codes, and P codes from pdf txt. It 
    // returns a multi-dimensional array: [<pdf filename>, [<CASRNs>], [<H codes>], [<P codes>]]
    const casHandPArray = searchCasHandP.pdfInput(resultArray);
    // Pass the multi-dimensional array to the function that is defined below.
    createReportAndPutInDOM(casHandPArray);
    return;
}

// From here onwards both file and manual inputted values follow the same route.

// createReportAndPutInDOM takes an array. 
const createReportAndPutInDOM = (inputValuesArray) => {
    // Create the compound object: CASRNs, H, and P codes are checked using checkAllowanceAndgetVerdict.js.
    const compound = new Compound(inputValuesArray);
    const compoundObject = compound.retrieve;

    // Construct a report as an assembly of html elements using createReport.js which in turn uses 
    // idGenerator.js that takes care of the div id for the report so that it can later be removed 
    // by the user pushing the 'remove' button.
    const compDomElement = new CompoundReport(compoundObject);

    // Place the report into the DOM.
    const divCompounds = document.getElementById('divCompounds');
    divCompounds.appendChild(compDomElement.report);
} 