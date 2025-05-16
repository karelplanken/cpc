// The CompoundReport class accepts a compound object, which is an instance of the Compound 
// class defined in checkAllowanceAndgetVerdict.js. All property values are converted to html 
// elements that are eventually appended to a div that is returned to the caller of 
// CompoundReport.report.
class CompoundReport {
    constructor(chemObj) {
        // Generate id for div that holds the report in the DOM.
        this.id = compIDgenerator();
        // This is filename or input method manual.
        this.container = this.constrRepContainer(chemObj[0]);

        // Check if compound has CASRNs.
        if (!(chemObj[1].length === 1 && chemObj[1][0] === false)) {
            // This is CASRNs.
            this.casrns = this.constrRepCasrns(chemObj[1]);
        }

        if (!(chemObj[2].length === 1 && chemObj[2][0] === false)) {
            // This is H phrases.
            this.hPhrases = this.constrRepHs(chemObj[2]);

        }

        if (!(chemObj[3].length === 1 && chemObj[3][0] === false)) {
            // This is P phrases.
            this.pPhrases = this.constrRepPs(chemObj[3]);

        }

        // This is whether substance is allowed or not.
        this.verdict = this.constrVerdict(chemObj[4]);
        // This is to remove the DOM compound element.
        this.remove = this.constrRemBtn(this.id);
    }

    // Deliver the report to the caller.
    get report() {
        return this.assembleReport();
    }

    // All below functions are self-explanatory, they all generate html elements, set attributes an whatnot.
    // Just plain Vanilla JS...
    assembleReport() {

        let domCompReport = this.container

        for (let i = 2; i < Object.entries(this).length; i++) {
            domCompReport.appendChild(Object.entries(this)[i][1]);
        }

        return domCompReport;
    }

    createDomElement(element, elementClass, txtContent = null) {
        let domElement = document.createElement(element);
        domElement.className = elementClass;

        if (txtContent) {
            domElement.innerHTML = txtContent;
        }

        return domElement;
    }

    constrRepContainer(inputMethod) {
        let compDomElement = this.createDomElement('div', 'border shadow-lg bg-white p-3 rounded-3 mb-3');
        compDomElement.setAttribute('id', this.id);
        let inputRow = this.createDomElement('div', 'col-12 px-0 mb-3');
        let fluidDiv = this.createDomElement('div', 'container-fluid', `<strong>Invoer:</strong> ${inputMethod} (${pubDate})`);
        inputRow.appendChild(fluidDiv);
        compDomElement.appendChild(inputRow);

        return compDomElement;
    }

    constrRepCasrns(casArray) {
        let divCasrns = this.createDomElement('div', `border border-${this.getAllowanceOrCategoryColor(casArray, 'category')} rounded-3 mb-3`);

        let divCasrnsTitle = this.createDomElement('div', 'row row-cols-12 m-1');

        let divCasrnsHeader = this.createDomElement('div', 'container-fluid', 'Cas nummer(s):');

        divCasrns.appendChild(divCasrnsTitle);

        divCasrnsTitle.appendChild(divCasrnsHeader);

        for (let i = 0; i < casArray.length; i++) {
            let casContainer = this.createDomElement('div', `row row-cols-12 text-${this.getCasrnColor(casArray[i])} m-1`);
            let divCas = this.createDomElement('div', 'col-12 col-sm-3 text-sm-end', casArray[i]['casrn']);
            let divCasTxt = this.createDomElement('div', 'col-12 col-sm-9', casArray[i]['text']);
            casContainer.appendChild(divCas);
            casContainer.appendChild(divCasTxt);
            divCasrns.appendChild(casContainer);
        }

        return divCasrns;
    }

    constrRepHs(hArray) {
        let divHs = this.createDomElement('div', `border border-${this.getAllowanceOrCategoryColor(hArray, 'allowed')} rounded-3 mb-3`);

        let divHsTitle = this.createDomElement('div', 'row row-cols-12 m-1');

        let divHsHeader = this.createDomElement('div', 'container-fluid', 'H zin(nen):');

        divHs.appendChild(divHsTitle);

        divHsTitle.appendChild(divHsHeader);

        for (let i = 0; i < hArray.length; i++) {
            let hContainer = this.createDomElement('div', `row row-cols-12 text-${this.getHphraseColor(hArray[i].allowed)} m-1`);
            let divH = this.createDomElement('div', 'col-12 col-sm-3 text-sm-end my-auto', Object.keys(hArray[i])[0]);
            let divHtxt = this.createDomElement('div', 'col-10 col-sm-8 my-auto', hArray[i][Object.keys(hArray[i])[0]].phrase);

            let divImgCont = this.createDomElement('div', 'col-2 col-sm-1 my-auto');
            let arrayOfImgEl = [];
            for (let j = 0; j < hArray[i][Object.keys(hArray[i])[0]].picto.length; j++) {
                let imgEl = this.createDomElement('img', 'svg-icon');
                let src = hArray[i][Object.keys(hArray[i])[0]].picto[j];

                imgEl.src = `ghsPictograms/GHS-pictogram-${src}.svg`;
                imgEl.setAttribute('alt', src);

                arrayOfImgEl.push(imgEl);
            }

            for (let i = 0; i < arrayOfImgEl.length; i++) {
                divImgCont.appendChild(arrayOfImgEl[i]);
            }

            hContainer.appendChild(divH);
            hContainer.appendChild(divHtxt);
            hContainer.appendChild(divImgCont);
            divHs.appendChild(hContainer);
        }

        return divHs;
    }

    constrRepPs(pArray) {
        let divPs = this.createDomElement('div', `border border-dark rounded-3 mb-3`);

        let divPsTitle = this.createDomElement('div', 'row row-cols-12 m-1');

        let divPsHeader = this.createDomElement('div', 'container-fluid', 'P zin(nen):');

        divPs.appendChild(divPsTitle);

        divPsTitle.appendChild(divPsHeader);

        for (let i = 0; i < pArray.length; i++) {
            let pContainer = this.createDomElement('div', `row row-cols-12 m-1`);
            let divP = this.createDomElement('div', 'col-12 col-sm-3 text-sm-end my-auto', Object.keys(pArray[i])[0]);
            let divPtxt = this.createDomElement('div', 'col-10 col-sm-9 my-auto', pArray[i][Object.keys(pArray[i])[0]]);

            pContainer.appendChild(divP);
            pContainer.appendChild(divPtxt);
            divPs.appendChild(pContainer);
        }

        return divPs;
    }

    constrVerdict(verdict) {
        let color = verdict.allowed ? 'success' : 'danger';
        let divVerdCont = this.createDomElement('div', `border border-${color} text-${color} rounded-3`);
        let divVerd = this.createDomElement('div', 'row row-cols-12 m-1');
        let divVerdTitle = this.createDomElement('div', 'div class="col-12 col-sm-3 text-sm-end my-auto', 'Uitkomst:');
        let divVerdMessage = this.createDomElement('div', 'col-12 col-sm-9 my-auto', `${verdict.verdictMessage}`);

        divVerd.appendChild(divVerdTitle);
        divVerd.appendChild(divVerdMessage);
        divVerdCont.appendChild(divVerd);

        return divVerdCont;
    }

    constrRemBtn(id) {
        let divBtnCont = this.createDomElement('div', 'row row-cols-12 mt-3 text-end');
        let divBtn = this.createDomElement('div', 'col-12');
        let btn = this.createDomElement('button', 'rounded-3 btnhover d-print-none', 'Verwijder');

        btn.addEventListener('click', () => {
            document.getElementById(id).remove();
        }, { once: true });

        divBtnCont.appendChild(divBtn).appendChild(btn);

        return divBtnCont;
    }

    getAllowanceOrCategoryColor(itemArray, item) {
        let allowances = [];
        for (let i = 0; i < itemArray.length; i++) {
            allowances.push(itemArray[i][item]);
        }

        if (allowances.indexOf(0) !== -1 | allowances.indexOf(false) !== -1) {
            return 'danger';
        }
        else if (allowances.indexOf(2) !== -1) {
            return 'warning';
        }
        else if (allowances.indexOf('-') !== -1) {
            return 'dark';
        }
        else {
            return 'success';
        }
    }

    getHphraseColor(item) {
        if (item === true) {
            return 'success';
        }
        else if (item === false) {
            return 'danger';
        }
        else {
            return 'dark';
        }
    }

    getCasrnColor(casrn) {
        if (casrn['category'] === 0) {
            return 'danger';
        }
        else if (casrn['category'] === 2) {
            return 'warning';
        }
        else if (casrn['category'] === 3) {
            return 'success';
        }
        else if (casrn['category'] === '-') {
            return 'dark';
        }
    }
}