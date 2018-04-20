describe("Container", () => {
  let webExtension, background;

  describe("Add-on initializes", () => {
    describe("No Container with name Google exists", () => {
      beforeEach(async () => {
        webExtension = await loadWebExtension();
        background = webExtension.background;
      });

      it("should create a new Google Container", () => {
        expect(background.browser.contextualIdentities.create).to.have.been.calledWithMatch({
          name: "Google"
        });
      });
    });

    describe("Container with name Google already exists", () => {
      beforeEach(async () => {
        webExtension = await loadWebExtension({
          async beforeParse(window) {
            await window.browser.contextualIdentities._create({
              name: "Google"
            });
          }
        });
        background = webExtension.background;
      });

      it("should not create a new Container", () => {
        expect(background.browser.contextualIdentities.create).to.not.have.been.called;
      });
    });
  });
});
