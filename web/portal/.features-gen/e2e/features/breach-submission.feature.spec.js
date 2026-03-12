// Generated from: e2e\features\breach-submission.feature
import { test } from "playwright-bdd";

test.describe('ISO-Standardized Risk Breach Submission', () => {

  test('Successfully submit an ISO 45001 Financial Loss breach', async ({ Given, When, Then, And, page }) => { 
    await Given('I am logged in as "site-user-01"', null, { page }); 
    await When('I navigate to the "New Breach Submission" page', null, { page }); 
    await And('I enter a unique Reference ID for the "Financial Loss" report', null, { page }); 
    await And('I fill in the metrics for a "LTIFR (Lost Time Injury Rate)" of "60000" (ISO 31000 Scale)', null, { page }); 
    await And('I submit the ISO-standardized report', null, { page }); 
    await Then('the breach should appear in the "Risk Registry" with status "AI Assessment Ready"', null, { page }); 
  });

});

// == technical section ==

test.use({
  $test: [({}, use) => use(test), { scope: 'test', box: true }],
  $uri: [({}, use) => use('e2e\\features\\breach-submission.feature'), { scope: 'test', box: true }],
  $bddFileData: [({}, use) => use(bddFileData), { scope: "test", box: true }],
});

const bddFileData = [ // bdd-data-start
  {"pwTestLine":6,"pickleLine":6,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am logged in as \"site-user-01\"","stepMatchArguments":[{"group":{"start":18,"value":"\"site-user-01\"","children":[{"start":19,"value":"site-user-01","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":8,"gherkinStepLine":8,"keywordType":"Action","textWithKeyword":"When I navigate to the \"New Breach Submission\" page","stepMatchArguments":[{"group":{"start":18,"value":"\"New Breach Submission\"","children":[{"start":19,"value":"New Breach Submission","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":9,"gherkinStepLine":9,"keywordType":"Action","textWithKeyword":"And I enter a unique Reference ID for the \"Financial Loss\" report","stepMatchArguments":[{"group":{"start":38,"value":"\"Financial Loss\"","children":[{"start":39,"value":"Financial Loss","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":10,"gherkinStepLine":10,"keywordType":"Action","textWithKeyword":"And I fill in the metrics for a \"LTIFR (Lost Time Injury Rate)\" of \"60000\" (ISO 31000 Scale)","stepMatchArguments":[{"group":{"start":28,"value":"\"LTIFR (Lost Time Injury Rate)\"","children":[{"start":29,"value":"LTIFR (Lost Time Injury Rate)","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"},{"group":{"start":63,"value":"\"60000\"","children":[{"start":64,"value":"60000","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":11,"gherkinStepLine":11,"keywordType":"Action","textWithKeyword":"And I submit the ISO-standardized report","stepMatchArguments":[]},{"pwStepLine":12,"gherkinStepLine":12,"keywordType":"Outcome","textWithKeyword":"Then the breach should appear in the \"Risk Registry\" with status \"AI Assessment Ready\"","stepMatchArguments":[{"group":{"start":32,"value":"\"Risk Registry\"","children":[{"start":33,"value":"Risk Registry","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"},{"group":{"start":60,"value":"\"AI Assessment Ready\"","children":[{"start":61,"value":"AI Assessment Ready","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]}]},
]; // bdd-data-end