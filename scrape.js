require("isomorphic-fetch");
const fs = require('fs');

const results = [];
const baseURL = "https://www.bundeshaushalt-info.de/rest/2017/soll/einnahmen/funktion/";

const makeRequest = (id) => {
    const suffix = id ? `${id}/` : '';
    return fetch(`${baseURL}${suffix}`)
        .then(r => {
            console.log(r.url);
            return r.json();
        })
        .then(json => {
            const leafChildren = json.childs.filter(c => c.titleDetail);
            results.push(...leafChildren);
            const branchChildren = json.childs.filter(c => !c.titleDetail);
            return Promise.all(branchChildren.map(c => c.a).map(makeRequest));
        }).catch(e => {
            // TODO: Retry? This also crashes the Promise.all ... 🤔
            console.log(e);
        })
};

makeRequest().then(() => {
    const json = JSON.stringify(results);
    fs.writeFile('functions.json', json, 'utf8', () => console.log("Done! 🎉"));
});