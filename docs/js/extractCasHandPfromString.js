// Extract CASRNs, H, and P codes from string that is derived from the SDS PDF.
let searchCasHandP = (function () {
    // Private properties and functions.

    // Regexes. Note that the regexes are fairly strict to prevent a date to be interpreted as a CASRN
    // or that non registered H and P codes are found.
    const _casRegexp = '([0-9]{2,8}-[0-9]{2}-[0-9]{1})(?!\\d)';
    const _hRegexp = '((?<!EU)(H[2-4]{1}\\d{2}\\s*\\+\\s*){0,3}(H[2-4]{1}\\d{2}))';
    const _pRegexp = '((P[1-5]{1}\\d{2}\\s*\\+\\s*){0,3}(P[1-5]{1}\\d{2}[AB]?))';

    // Array that holds the regex patterns.
    const _regexArray = [_casRegexp, _hRegexp, _pRegexp];

    // This function is called from pdfInput and takes a regex pattern and text to search in.
    function _searchRegexInText(pattern, text) {
        const regexp = RegExp(pattern, 'g');
        let resultArray = Array.from(text.matchAll(regexp), m => m[0].replaceAll(/\s/g, ''));
        if (resultArray.length === 0) {
            return [false];
        }
        else {
            return [...new Set(resultArray)].sort((a, b) => {
                x = parseInt(a.replaceAll(/H|P/g, '').replaceAll(/\+|-/g, ''));
                y = parseInt(b.replaceAll(/H|P/g, '').replaceAll(/\+|-/g, ''));
                return x - y;
            });
        }
    }

    // Check if CASRN is valid, returns bool.
    function _checkCasValidity(casrn) {
        casrn = casrn.replaceAll('-', '');
        casDigitArrRev = casrn.split('').reverse();

        let checkSumCas = 0;

        for (let i = 1; i < casDigitArrRev.length; i++) {
            checkSumCas += i * parseInt(casDigitArrRev[i]);
        }

        return (checkSumCas % 10 === parseInt(casDigitArrRev[0]));
    }

    // Public function, the array containing results is returned.
    return {
        pdfInput: function (pdf) {
            let searchResult = [];
            searchResult.push(pdf[0]);
            for (let i = 0; i < 3; i++) {
                searchResult.push(_searchRegexInText(_regexArray[i], pdf[1]));
            }

            // Check validity of CASRN(s).
            let validCasrns = [];
            for (let i = 0; i < searchResult[1].length; i++) {
                if (_checkCasValidity(searchResult[1][i])) {
                    validCasrns.push(searchResult[1][i]);
                }
                else {
                    continue;
                }
            }
            // Assign valid CASRN(s) or set to false in case no valid CASRNs have been found.
            searchResult[1] = (validCasrns.length === 0) ? false : validCasrns;
            
            // Check validity of H code(s).
            let validH = [];
            for (let i = 0; i < searchResult[2].length; i++) {
                if (Object.keys(stmts.hStmtObj).indexOf(searchResult[2][i]) !== -1) {
                    validH.push(searchResult[2][i]);
                }
                else {
                    continue;
                }
            }
            // Assign valid H code(s) or set to false in case no valid H code(s) have been found.
            searchResult[2] = (validH.length === 0) ? false : validH;

            // Check validity of P code(s).
            let validP = [];
            for (let i = 0; i < searchResult[3].length; i++) {
                if (Object.keys(stmts.pStmtObj).indexOf(searchResult[3][i]) !== -1) {
                    validP.push(searchResult[3][i]);
                }
                else {
                    continue;
                }
            }
            // Assign valid P code(s) or set to false in case no valid P code(s) have been found.
            searchResult[3] = (validP.length === 0) ? false : validP;

            return searchResult;
        },
    };
})(); 