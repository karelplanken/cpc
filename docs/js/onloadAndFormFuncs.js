// This script takes care of registering the event handlers and does some DOM manipulation. 
// It also takes the user input data from the form and passes it to the controller scipt
// after which it clears the form(s).
// Here each form (file or manual input) is checked before it is "submitted". Custom form 
// validation is applied to check for CAS RN, H and P code validity (regexes). Validation of 
// CASRNs happens through checkCasValidity() and for H and P codes through checkHphraseValidity() 
// and checkPphraseValidity() respectively, the latter function look up the values in stmts.js. 
// Since no backend scripts are run, validation can only be done client-side.
window.addEventListener('load', () => {
    // Add Bootstrap tooltips to all relevant elements in body.
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    tooltipTriggerList.map((tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl, { trigger: 'hover', container: 'body' }));

    // Register event listeners and handlers to the radio buttons for selecting file or manual input.
    const fileInputRadio = document.getElementById('fileInputRadio');

    fileInputRadio.addEventListener('click', (event) => {
        toggleForms(event);
    });

    const manualInputRadio = document.getElementById('manualInputRadio');

    manualInputRadio.addEventListener('click', (event) => {
        toggleForms(event);
        cleanUpManInputFields();
    });

    // Toggles between file and manual input: show the selected input form and reset and hide the other form.
    function toggleForms(event) {
        if (event.target.id === 'manualInputRadio' && event.target.value === 'on') {
            document.getElementById('manualInputFields').hidden = false;
            document.getElementById('fileInputFields').hidden = true;
            document.getElementById('fileInputFields').reset();
            document.getElementById('fileInputFields').classList.remove('was-validated');
        }
        else if (event.target.id === 'fileInputRadio' && event.target.value === 'on') {
            document.getElementById('fileInputFields').hidden = false;
            document.getElementById('manualInputFields').hidden = true;

            cleanUpManInputFields();
        }
    }

    document.getElementById('inputPDF').addEventListener('input', (event) => {
        document.getElementById('fileInputFields').classList.remove('was-validated');
        event.target.nextElementSibling.nextElementSibling.nextElementSibling.innerHTML = '';
    });

    // Call arrayToStringOptions() to populate the datalists with H and P codes using 
    // arguments: <datalist id>, <object containing the codes>.
    arrayToStringOptions('hDatalistOptions', Object.keys(stmts.hStmtObj));
    arrayToStringOptions('pDatalistOptions', Object.keys(stmts.pStmtObj));

    // Populate the data lists so that user gets a suggestion and can select a H or P code.
    function arrayToStringOptions(id, phraseArray) {
        let dataListOptions = document.getElementById(id);
        let resultArray = [];
        for (let i = 0; i < phraseArray.length; i++) {
            resultArray[i] = '<option value="' + phraseArray[i] + '"/>';
        }
        dataListOptions.innerHTML = resultArray.join('');
    }

    // Register event listeners to the add and remove input field buttons (IIFE).
    (function setEventListenersForAddRemBtns() {
        const addBtnsArr = [
            ['casPlusBtn', 'manCasInput', 'casMinusBtn'],
            ['hPlusBtn', 'manHphraseInput', 'hMinusBtn'],
            ['pPlusBtn', 'manPphraseInput', 'pMinusBtn'],
        ];

        const removeBtnsArr = [
            ['casMinusBtn', 'manCasInput'],
            ['hMinusBtn', 'manHphraseInput'],
            ['pMinusBtn', 'manPphraseInput'],

        ];

        // Add event handlers to the add buttons.
        for (let i = 0; i < addBtnsArr.length; i++) {
            document.getElementById(addBtnsArr[i][0]).addEventListener('click', (event) => {
                let inputDiv = document.getElementById(addBtnsArr[i][1]);
                let clonedInputElement = inputDiv.firstElementChild.cloneNode(true);
                clonedInputElement.querySelector('input').value = '';
                if (addBtnsArr[i][0] === 'casPlusBtn') {
                    addCasChecker(clonedInputElement.querySelector('input'));
                }
                if (addBtnsArr[i][0] === 'hPlusBtn') {
                    checkHphraseValidity(clonedInputElement.querySelector('input'));
                }
                if (addBtnsArr[i][0] === 'pPlusBtn') {
                    checkPphraseValidity(clonedInputElement.querySelector('input'));
                }
                inputDiv.appendChild(clonedInputElement);
                if (inputDiv.childElementCount === 2) {
                    document.getElementById(addBtnsArr[i][2]).hidden = false;
                }
            });
        }

        // Add event handlers to the remove buttons.
        for (let i = 0; i < removeBtnsArr.length; i++) {
            document.getElementById(removeBtnsArr[i][0]).addEventListener('click', (event) => {
                let inputDiv = document.getElementById(removeBtnsArr[i][1]);
                inputDiv.lastElementChild.remove();
                if (inputDiv.childElementCount === 1) {
                    event.target.hidden = true;
                }
            });
        }
    })();

    // Add event listener to label of file input to make it act as button for submission.
    document.getElementById('checkSDSpdf').addEventListener('click', async () => {

        const inputPDF = document.getElementById('inputPDF');
        const fileInputFields = document.getElementById('fileInputFields');
        const invalidFeedback = fileInputFields.querySelector('.invalid-feedback');
        const inputElement = fileInputFields.querySelector('input');

        // Check if there's a file in file input.
        if (inputPDF.value === '') {
            invalidFeedback.innerHTML = 'Selecteer een bestand&hellip;';
            inputElement.setCustomValidity('No file selected');
        }

        // Check if the file is really a pdf.
        if (inputPDF.files.length > 0 && inputPDF.files[0].type !== 'application/pdf') {
            invalidFeedback.innerHTML = 'Dit is geen pdf&hellip;';
            inputElement.setCustomValidity('Not a PDF');
        }

        // Check if there's text in the pdf.
        if (inputPDF.files.length > 0 && inputPDF.files[0].type === 'application/pdf') {

            let pdfTxt = await (readPdfArrBufferToBytes(inputPDF.files[0]).then(value => getPdfText(value)));

            if (pdfTxt === '') {
                invalidFeedback.innerHTML = 'Geen tekst in pdf&hellip;';
                inputElement.setCustomValidity('No txt in PDF');
            }
            else {
                pdfInputValues.setProps(inputPDF.files[0].name, pdfTxt)
            }
        }

        fileInputFields.requestSubmit();
    });

    // Add event listener to button of manual input form to and check validity.
    document.getElementById('submitManualSearch').addEventListener('click', () => {
        const manCasInput = document.getElementById('manCasInput');
        const manHphraseInput = document.getElementById('manHphraseInput');

        // If the there's no invalid input check if either CASRN or H code is entered, if not then require either input.
        if (manCasInput.querySelector('input').value === '' && manHphraseInput.querySelector('input').value === '') {

            manCasInput.querySelector('.invalid-feedback').innerHTML = 'Verplicht als H zin leeg is&hellip;';
            manCasInput.querySelector('input').setCustomValidity('Empty CAS number');

            manHphraseInput.querySelector('.invalid-feedback').innerHTML = 'Verplicht als CASRN leeg is&hellip;';
            manHphraseInput.querySelector('input').setCustomValidity('Empty H phrase');
        }
        else {
            getManualInputValues();
            cleanUpManInputFields();
        }


    });

    // Add event listeners and handlers to to first CASRN input.
    addCasChecker(document.getElementById('manCasInput').querySelector('input'));

    // Add event handler to H phrase input to check.
    checkHphraseValidity(document.getElementById('manHphraseInput').querySelector('input'));

    // Add event handler to P phrase input to check.
    checkPphraseValidity(document.getElementById('manPphraseInput').querySelector('input'));

    // Validate the form, remove empty fields and eventually start the processing of input (IIFE).
    (function () {
        'use strict'

        // Fetch all the forms we want to apply custom Bootstrap validation styles to.
        var forms = document.querySelectorAll('.needs-validation')

        // Loop over them and prevent submission.
        Array.prototype.slice.call(forms)
            .forEach(function (form) {
                form.addEventListener('submit', (event) => {

                    // if invalid input abort submission
                    if (!form.checkValidity()) {
                        event.preventDefault();
                        event.stopPropagation();
                    }

                    // If input exists and is correct then start processing the input.
                    else {
                        // Prevent the form from being submitte, user input values are
                        // handled by passing them to the controller.
                        event.preventDefault();

                        // File input.
                        if (form.id === 'fileInputFields') {
                            // Pass to controller.js.
                            processFileInput(pdfInputValues.getProps());
                        }

                        // Manual input.
                        else if (form.id === 'manualInputFields') {
                            // Pass to controller.js.
                            createReportAndPutInDOM(manInputValues.getProps());
                        }

                        // Reset the form.
                        form.reset();
                        form.classList.remove('was-validated');
                        document.getElementById('manualInputRadio').checked = false;
                        document.getElementById('fileInputRadio').checked = false;
                        document.getElementById('manualInputFields').hidden = true;
                        document.getElementById('fileInputFields').hidden = true;
                        return;
                    }

                    form.classList.add('was-validated')
                }, false)
            });
    })();
});

// Register event listeners and handlers to first CASRN input.
function addCasChecker(casInputElement) {
    casInputElement.addEventListener('input', (event) => {
        // I'm not sure if this is right?:
        // document.getElementById('manHphraseInput').querySelector('input').setCustomValidity('');
        if (!checkCasValidity(casInputElement.value)) {
            event.target.nextElementSibling.nextElementSibling.innerHTML = 'Onjuist CASRN&hellip;';
            casInputElement.setCustomValidity('Invalid CAS number');
        }
        else {
            event.target.setCustomValidity('');
        }
    }); 
}

// Check if a valid CASRN is entered, used in the above event handler call back function.
function checkCasValidity(casrn) {
    // Since this field is not required it can be left empty.
    if (casrn === '') {
        return true;
    }
    casrn = casrn.replaceAll('-', '');
    casDigitArrRev = casrn.split('').reverse();

    let checkSumCas = 0;

    for (let i = 1; i < casDigitArrRev.length; i++) {
        checkSumCas += i * parseInt(casDigitArrRev[i]);
    }

    return (checkSumCas % 10 === parseInt(casDigitArrRev[0]));
}

// Adds event handler to H phrase input to check validity.
function checkHphraseValidity(hInputElement) {
    hInputElement.addEventListener('input', (event) => {
        // I'm not sure if this is right?:
        // document.getElementById('manCasInput').querySelector('input').setCustomValidity('');
        if (Object.keys(stmts.hStmtObj).indexOf(hInputElement.value) === -1) {
            event.target.nextElementSibling.nextElementSibling.nextElementSibling.innerHTML = 'Onjuiste H code&hellip;';
            event.target.setCustomValidity('Invalid H code');
        }
        else {
            event.target.setCustomValidity('');
        }
    });
}

// Adds event handler to P phrase input to check validity.
function checkPphraseValidity(pInputElement) {
    pInputElement.addEventListener('input', (event) => {
        if (Object.keys(stmts.pStmtObj).indexOf(pInputElement.value) === -1) {
            event.target.nextElementSibling.nextElementSibling.nextElementSibling.innerHTML = 'Onjuiste P code&hellip;';
            event.target.setCustomValidity('Invalid P code');
        }
        else {
            event.target.setCustomValidity('');
        }
    });
}

// Clear the manual input form fields.
function cleanUpManInputFields() {
    const manInputDivAndBtn = { 'manCasInput': 'casMinusBtn', 'manHphraseInput': 'hMinusBtn', 'manPphraseInput': 'pMinusBtn' };

    for (let i = 0; i < Object.keys(manInputDivAndBtn).length; i++) {
        let inputDiv = document.getElementById(Object.keys(manInputDivAndBtn)[i]);
        let inputElements = inputDiv.querySelectorAll('div.col-12');

        let backupElement = inputDiv.firstElementChild.cloneNode(true);
        if (Object.keys(manInputDivAndBtn)[i] === 'manCasInput') {
            addCasChecker(backupElement.querySelector('input'));
        }
        if (Object.keys(manInputDivAndBtn)[i] === 'manHphraseInput') {
            checkHphraseValidity(backupElement.querySelector('input'));
        }
        if (Object.keys(manInputDivAndBtn)[i] === 'manPphraseInput') {
            checkPphraseValidity(backupElement.querySelector('input'));
        }

        let removedItems = 0;

        for (let i = 0; i < inputElements.length; i++) {
            if (inputElements[i].querySelector('input').value === '') {
                inputElements[i].remove();
                removedItems++;
            }
        }

        if (removedItems === inputElements.length) {
            inputDiv.appendChild(backupElement);
            document.getElementById(manInputDivAndBtn[Object.keys(manInputDivAndBtn)[i]]).hidden = true;
        }

        if (inputElements.length - removedItems === 1) {
            document.getElementById(manInputDivAndBtn[Object.keys(manInputDivAndBtn)[i]]).hidden = true;
        }
    }

    return;
}

// Retrieve the three input categories from the manual input form using the getInputValues function, 
// it sets the properties manualInputValues object (CASRN(s), H codes, and P codes).
function getManualInputValues() {
    manInputValues.setProps(
        getInputValues(document.getElementById('manCasInput').querySelectorAll('input')),
        getInputValues(document.getElementById('manHphraseInput').querySelectorAll('input')),
        getInputValues(document.getElementById('manPphraseInput').querySelectorAll('input')),
    );

    return;
}

// This function receives a nodelist of inputs and returns their values in an array.
function getInputValues(nodeList) {
    let resultArray = [];
    for (let i = 0; i < nodeList.length; i++) {
        if (nodeList[i].value === '') {
            resultArray.push(false);
        }
        else {
            resultArray.push(nodeList[i].value);
        }
    }
    return resultArray;
}

// Global object containing result of pdf file extraction.
const pdfInputValues = {
    pdfFileName: '',
    pdfTxt: '',

    setProps(pdfFileName, pdfTxt) {
        this.pdfFileName = pdfFileName;
        this.pdfTxt = pdfTxt;
    },

    getProps() {
        return [this.pdfFileName, this.pdfTxt];
    },
}

// Global object containing the manually inputted values set via getManualInputValues() function.
const manInputValues = {
    inputMethod: 'handmatig',
    inputCasrnArr: [],
    inputHsArr: [],
    inputPsArr: [],

    setProps(inputCasrnArr, inputHsArr, inputPsArr) {
        this.inputCasrnArr = inputCasrnArr;
        this.inputHsArr = inputHsArr;
        this.inputPsArr = inputPsArr;
    },

    getProps() {
        return [this.inputMethod, this.inputCasrnArr, this.inputHsArr, this.inputPsArr];
    },
}
