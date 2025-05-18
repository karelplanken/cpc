// This class uses the library files to do all the checks on user inputted data. 
// The constructor inside this class defines the object properties that are in 
// turn derived from it's methods. The methods do all the hard work in terms of 
// checking if CASRN(s) appear in the SZW (forbidden CASRNs list) or in the list 
// of tolerated CASRNs (i.e. category 2).
// For each H and P code the phrases are looked up and for H code the name of the 
// GHS pictgram is retrieved. A final verdict on whether a substance is not is also given.
class Compound {
    // "Setter".
    constructor(array) {
        this.input = array[0];
        this.casrns = (array[1].length === 1 && array[1][0] === false) ? [false] : this.constructCasitems(array[1]);
        this.hPhrases = (array[2].length === 1 && array[2][0] === false) ? [false] : this.constructPhrases(array[2], stmts.hStmtObj, true);
        this.pPhrases = (array[3].length === 1 && array[3][0] === false) ? [false] : this.constructPhrases(array[3], stmts.pStmtObj, false);
        this.allowed = this.checkCompoundAllowance(this.casrns, this.hPhrases);
    }

    // Getter.
    get retrieve() {
        return this.assembleCompound();
    }

    // Method.
    assembleCompound() {
        return [this.input, this.casrns, this.hPhrases, this.pPhrases, this.allowed];
    }

    // Private methods that do the hard work! I think the method names are self-explanatory.
    constructCasitems(array) {
        let resultArrayOfObjects = [];
        let i = 0;
        do {
            if (!array[i]) {
                resultArrayOfObjects.push({
                    'casrn': '-',
                    'text': 'Geen CASRN gevonden',
                    'allowed': '-',
                    'category': '-',
                    // 1 stuks
                });
            }
            else if (toleratedSZWcasrnsArray.indexOf(array[i]) !== -1) {
                resultArrayOfObjects.push({
                    'casrn': `${array[i]}`,
                    'text': 'CASRN komt voor in SZW lijst maar is niet verboden want Cat. 2 stof.<br />' +
                        '<strong>Let op:</strong> Blootstelling moet geregistreerd worden!',
                    'allowed': true,
                    'category': 2,
                    // 64-17-5
                });
            }
            else if (szwCasArray.indexOf(array[i]) !== -1 && toleratedSZWcasrnsArray.indexOf(array[i]) == -1) {
                resultArrayOfObjects.push({
                    'casrn': `${array[i]}`,
                    'text': 'Verboden op basis van CASRN want komt voor in de SZW lijst.',
                    'allowed': false,
                    'category': 0,
                    // 97-56-3
                });
            }
            else if (toleratedHcasrnsArray.indexOf(array[i]) !== -1) {
                resultArrayOfObjects.push({
                    'casrn': `${array[i]}`,
                    'text': 'CASRN heeft verboden H code maar is gedoogd want Cat. 2 stof.',
                    'allowed': true,
                    'category': 2,
                    // 7758-99-8
                });
            }
            else {
                resultArrayOfObjects.push({
                    'casrn': `${array[i]}`,
                    'text': 'Niet verboden op basis van CASRN want komt niet voor in de SZW lijst.',
                    'allowed': true,
                    'category': 3,
                    // 50-01-1
                });
            }
            i++;
        } while (i < array.length)
        return resultArrayOfObjects;
    }

    constructPhrases(array, phraseArrayOfObj, checkH) {
        let resultArrayOfObjects = [];
        let objKeys = Object.keys(phraseArrayOfObj);

        for (let i = 0; i < array.length; i++) {
            let tempObj = {};
            if (objKeys.indexOf(array[i]) !== -1) {
                tempObj[Object.keys(phraseArrayOfObj)[objKeys.indexOf(array[i])]] = Object.entries(phraseArrayOfObj)[objKeys.indexOf(array[i])][1];
                if (checkH) {
                    if (forbiddenHcodesArray.indexOf(array[i]) !== -1) {
                        tempObj['allowed'] = false;
                    }
                    else {
                        tempObj['allowed'] = true;
                    }
                }
                resultArrayOfObjects.push(tempObj);
            }
            else {
                if (checkH) {
                    tempObj['-'] = {
                        'appliesTo': 'None',
                        'phrase': 'Geen H code gevonden.',
                        'picto': ['none'],
                    };
                    tempObj['allowed'] = '-';
                }
                if (!checkH) {
                    tempObj['-'] = 'Geen P code gevonden.';
                }
                resultArrayOfObjects.push(tempObj);
            }
        }

        if (!array) {
            let tempObj = {};
            if (checkH) {
                tempObj['-'] = {
                    'appliesTo': 'None',
                    'phrase': 'Geen H code gevonden.',
                    'picto': ['none'],
                };
                tempObj['allowed'] = '-';
            }
            else if (!checkH) {
                tempObj['-'] = 'Geen P code gevonden.';
            }
            resultArrayOfObjects.push(tempObj);
        }

        return resultArrayOfObjects;
    }

    checkCompoundAllowance(casArray, hArray) {
        let verdictText = '';
        let forbiddenItem = false;
        let exception = true;

        let collectedCasCategories = [];
        for (let i = 0; i < casArray.length; i++) {
            collectedCasCategories.push(casArray[i]['category']);
        }

        if (collectedCasCategories.indexOf(0) !== -1) {
            forbiddenItem = true;
            exception = false;
            if (casArray.length > 1) {
                verdictText = 'Dit mengsel is verboden op basis van één of meerdere CASRN(s).';
            }
            else {
                verdictText = 'Deze stof is verboden op basis van CASRN.';
            }
        }

        let collectedHCategories = [];
        for (let i = 0; i < hArray.length; i++) {
            collectedHCategories.push(hArray[i]['allowed']);
        }

        if (!forbiddenItem && collectedCasCategories.indexOf(0) === -1 && collectedCasCategories.indexOf(2) === -1) {
            if (collectedHCategories.indexOf(false) !== -1) {
                forbiddenItem = true;
                if (casArray.length > 1) {
                    verdictText = 'Dit mengsel is verboden op basis van één/meerdere H code(s).';
                }
                else if (casArray.length === 1 && casArray[0] !== false) {
                    verdictText = 'Deze stof is verboden op basis van één/meerdere H code(s).';
                }
                else {
                    verdictText = 'Deze stof of dit mengsel is verboden op basis van één/meerdere H code(s).';
                }

            }
        }
        else if (!forbiddenItem && collectedCasCategories.indexOf(0) === -1 && collectedCasCategories.indexOf(2) !== -1) {
            forbiddenItem = false;
            exception = true;
        }

        if (!forbiddenItem && exception && casArray.length > 1) {
            verdictText = 'Dit mengsel is niet verboden.';
        }
        else if (!forbiddenItem && exception && casArray.length === 1 && casArray[0]['casrn'] !== '-') {
            verdictText = 'Deze stof is niet verboden.';
        }
        else if (!forbiddenItem && exception && casArray.length === 1) {
            verdictText = 'Deze stof of dit mengsel is niet verboden.';
        }

        return { 'verdictMessage': verdictText, 'allowed': !forbiddenItem, };
    }
};