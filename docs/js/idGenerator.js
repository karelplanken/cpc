// This generates an ID for the report to enable removal of the report DOM element via remove button.
// Note that this is an IIFE and uses a closure to store the current value :-)
let compIDgenerator = (function counter() {
    let i = 0;
    return function () {
        let j = 'compound-' + i;
        i++;
        return j;
    }
})();