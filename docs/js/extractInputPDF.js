// Loaded via <script> tag, create shortcut to access pdf.js exports.
let pdfjsLib = window['pdfjs-dist/build/pdf'];
// The workerSrc property shall be specified.
// pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://mozilla.github.io/pdf.js/build/pdf.worker.js';
pdfjsLib.GlobalWorkerOptions.workerSrc = 'js/pdf.worker.js';

// Read file as array buffer and return bytes.
const readPdfArrBufferToBytes = (inputFile) => {
    const temporaryFileReader = new FileReader();

    temporaryFileReader.readAsArrayBuffer(inputFile);

    return new Promise(async (resolve, reject) => {
        temporaryFileReader.onerror = () => {
            temporaryFileReader.abort();
            reject(new DOMException("Problem parsing input file."));
        };

        temporaryFileReader.onload = () => {
            resolve(temporaryFileReader.result);
        };
        var arrayBuffer = temporaryFileReader.result;
        var bytes = new Uint8Array(arrayBuffer);
        return bytes;
    });
};

// Extract pdf text from bytes, returns text as a string.
async function getPdfText(data) {
    let doc = await pdfjsLib.getDocument({ data }).promise;
    let pageTexts = Array.from({ length: doc.numPages }, async (v, i) => {
        return (await (await doc.getPage(i + 1)).getTextContent()).items.map(token => {
            // To avoid messing up the regex search for CASRNs in extractCasHandPfromString.js adding spaces
            // on certain positions is necessary.
            if (token.str.length === 0 || token.str.match('^([0-9]{2,8}-[0-9]{2}-[0-9]{1})$')) token.str += " ";
            return token.str;
        }
        ).join('');
    });
    return (await Promise.all(pageTexts)).join('');
}