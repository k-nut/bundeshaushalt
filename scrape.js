const fetch = require("isomorphic-fetch");
const fs = require("fs");
const pRetry = require("p-retry");

const results = [];
const baseURL =
  "https://www.bundeshaushalt-info.de/rest/2017/soll/einnahmen/funktion/";

const makeRequest = id => {
  const suffix = id ? `${id}/` : "";
  return fetchRetry(`${baseURL}${suffix}`)
    .then(r => {
      console.log(r.url);
      return r.json();
    })
    .then(json => {
      const leafChildren = json.childs.filter(c => c.titleDetail);
      results.push(...leafChildren);
      const branchChildren = json.childs.filter(c => !c.titleDetail);
      return Promise.all(branchChildren.map(c => c.a).map(makeRequest));
    });
};

const fetchRetry = url => pRetry(() => fetch(url), { retries: 5 });

makeRequest().then(() => {
  const json = JSON.stringify(results);
  fs.writeFile("functions.json", json, "utf8", () => console.log("Done! 🎉"));
});
