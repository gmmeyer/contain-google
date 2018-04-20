describe("Contain", () => {
  let webExtension, background, googleContainer;

  beforeEach(async () => {
    webExtension = await loadWebExtension();
    background = webExtension.background;
    googleContainer = webExtension.googleContainer;
  });

  describe("Incoming requests to Google Domains outside of Google Container", () => {
    const responses = {};
    beforeEach(async () => {
      await background.browser.tabs._create({
        url: "https://www.google.com"
      }, {
        responses
      });
    });

    it("should be reopened in Google Container", async () => {
      expect(background.browser.tabs.create).to.have.been.calledWithMatch({
        url: "https://www.google.com",
        cookieStoreId: googleContainer.cookieStoreId
      });
    });

    it("should be canceled", async () => {
      const [promise] = responses.webRequest.onBeforeRequest;
      const result = await promise;
      expect(result.cancel).to.be.true;
    });
  });

  describe("Incoming requests to Non-Google Domains inside Google Container", () => {
    const responses = {};
    beforeEach(async () => {
      await background.browser.tabs._create({
        url: "https://example.com",
        cookieStoreId: googleContainer.cookieStoreId
      }, {
        responses
      });
    });

    it("should be reopened in Default Container", async () => {
      expect(background.browser.tabs.create).to.have.been.calledWithMatch({
        url: "https://example.com",
        cookieStoreId: "firefox-default"
      });
    });

    it("should be canceled", async () => {
      const [promise] = responses.webRequest.onBeforeRequest;
      const result = await promise;
      expect(result.cancel).to.be.true;
    });
  });


  describe("Incoming requests that don't start with http", () => {
    const responses = {};
    beforeEach(async () => {
      await background.browser.tabs._create({
        url: "ftp://www.google.com"
      }, {
        responses
      });
    });

    it("should be ignored", async () => {
      expect(background.browser.tabs.create).to.not.have.been.called;
      const [promise] = responses.webRequest.onBeforeRequest;
      const result = await promise;
      expect(result).to.be.undefined;
    });
  });

  describe("Incoming requests that belong to an incognito tab", () => {
    const responses = {};
    beforeEach(async () => {
      await background.browser.tabs._create({
        url: "https://www.google.com",
        incognito: true
      }, {
        responses
      });
    });

    it("should be ignored", async () => {
      expect(background.browser.tabs.create).to.not.have.been.called;
      const [promise] = responses.webRequest.onBeforeRequest;
      const result = await promise;
      expect(result).to.be.undefined;
    });
  });


  describe("Incoming requests that don't belong to a tab", () => {
    const responses = {};
    beforeEach(async () => {
      await background.browser.tabs._create({
        url: "https://www.google.com",
        id: -1
      }, {
        responses
      });
    });

    it("should be ignored", async () => {
      expect(background.browser.tabs.create).to.not.have.been.called;
      const [promise] = responses.webRequest.onBeforeRequest;
      const result = await promise;
      expect(result).to.be.undefined;
    });
  });
});