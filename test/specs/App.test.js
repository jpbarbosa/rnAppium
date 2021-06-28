const {expect} = require('chai');

describe('Running a sample test', () => {
  beforeEach(() => {
    $('~app-root').waitForDisplayed(11000, false);
  });

  it('Text is correct', () => {
    const text = $('~text').getText();
    console.log({text});
    expect(text).to.equal('This is a sample project.');
  });
});
