import React from "react";
import { jest } from "@jest/globals";
import { defineFeature, loadFeature } from "jest-cucumber";
import {
  render,
  cleanup,
  configure,
  RenderResult,
  fireEvent,
  within,
  waitFor,
} from "@testing-library/react";
import "@testing-library/jest-dom";
import * as helpers from "framework/src/Helpers";
import AiQueryHubFilesTab from "../../src/AiQueryHubFilesTab.web";
import {
  MockAPIHelperBlock,
  onGetSelectOptionsValues,
} from "../../../utilities/src/testHelper";
import * as utils from "framework/src/Utilities";

const mockFile = (type: string, size: number): File => {
  const fileName =
    (Math.random() * 1000).toString().replace(".", "") + type.toLowerCase();
  const file = new File([""], fileName);
  Object.defineProperty(file, "size", { value: size });
  return file;
};

const screenProps = {
  id: "AiQueryHubFilesTab",
  navigation: {
    navigate: jest.fn(),
    getParam: jest.fn().mockImplementation(() => "129"),
  },
};

configure({ testIdAttribute: "data-test-id" });

const feature = loadFeature(
  "./__tests__/features/AiQueryHubFilesTab-scenario.web.feature"
);

defineFeature(feature, (test) => {
  let screen: RenderResult;

  beforeEach(() => {
    jest.resetModules();
    jest.doMock("react-native", () => ({ Platform: { OS: "web" } }));
    jest.spyOn(helpers, "getOS").mockImplementation(() => "web");

    jest.spyOn(utils, "getStorageData").mockImplementation((key, _) => {
      switch (key) {
        case "authToken":
          return Promise.resolve("authToken");
        default:
          return Promise.resolve();
      }
    });

    Object.defineProperty(URL, "createObjectURL", {
      writable: true,
      value: jest.fn(),
    });

    jest.setTimeout(300000);

    window.localStorage.setItem("authToken", "authToken");
  });

  afterEach(() => {
    cleanup();
  });

  test("User navigates to AiQueryHubFilesTab", ({ given, then }) => {
    given("I am a User loading AiQueryHubFilesTab", async () => {
      screen = render(
        <MockAPIHelperBlock>
          <AiQueryHubFilesTab {...screenProps} />
        </MockAPIHelperBlock>
      );
    });
    then("I can see page is loaded", async () => {
      const node = await screen.findByText("newtest.pdf");
      expect(node).toBeDefined();
    });
  });

  test("User navigates to AiQueryHubFilesTab and can not load data", ({ given, then }) => {
    given("I am a User loading AiQueryHubFilesTab", async () => {
      window.localStorage.setItem("authToken", "authToken2");
      jest.spyOn(utils, "getStorageData").mockImplementation((key, _) => {
        switch (key) {
          case "authToken":
            return Promise.resolve("authToken2");
          default:
            return Promise.resolve();
        }
      });
      screen = render(
        <MockAPIHelperBlock>
          <AiQueryHubFilesTab {...screenProps} />
        </MockAPIHelperBlock>
      );
    });
    then("I can see page is loaded withot data", async () => {
      const node = await screen.findByText("No Data found");
      expect(node).toBeDefined();
    });
  });

  test("User navigates to AiQueryHubFilesTab and getting empty data", ({ given, then }) => {
    given("I am a User loading AiQueryHubFilesTab", async () => {
      window.localStorage.setItem("authToken", "authToken3");
      jest.spyOn(utils, "getStorageData").mockImplementation((key, _) => {
        switch (key) {
          case "authToken":
            return Promise.resolve("authToken3");
          default:
            return Promise.resolve();
        }
      });
      screen = render(
        <MockAPIHelperBlock>
          <AiQueryHubFilesTab {...screenProps} />
        </MockAPIHelperBlock>
      );
    });
    then("I can see page is loaded withot data", async () => {
      await new Promise((r) => setTimeout(r, 500));
      const node = await screen.findByText("No Data found");
      expect(node).toBeDefined();
    });
  });

  test("User navigates to AiQueryHubFilesTab and change the pagination", ({ given, when, then }) => {
    given("I am a User loading AiQueryHubFilesTab", async () => {
      screen = render(
        <MockAPIHelperBlock>
          <AiQueryHubFilesTab {...screenProps} />
        </MockAPIHelperBlock>
      );
    });
    then("I can see page is loaded data", async () => {
      const node = await screen.findByText("newtest.pdf");
      expect(node).toBeDefined();
    });
    when("I am change to next page", async () => {
      const node = await screen.findByLabelText("Go to next page");
      fireEvent.click(node);
    });
    then("I can see next page data is loaded", async () => {
      const node = await screen.findByText("nextpage.pdf");
      expect(node).toBeDefined();
    });
    when("I am change to prev page", async () => {
      const node = await screen.findByLabelText("page 1");
      fireEvent.click(node);
    });
    then("I can see prev page data is loaded", async () => {
      const node = await screen.findByText("newtest.pdf");
      expect(node).toBeDefined();
    });
  });

  test("User can upload a new file with default option", ({
    given,
    then,
    when,
  }) => {
    given("I am a User loading AiQueryHubFilesTab", async () => {
      screen = render(
        <MockAPIHelperBlock>
          <AiQueryHubFilesTab {...screenProps} />
        </MockAPIHelperBlock>
      );
    });
    then("I can see page is loaded", async () => {
      const node = await screen.findByText("newtest.pdf");
      expect(node).toBeDefined();
    });
    when("I am click on browse", async () => {
      const node = await screen.findByTestId("browse-link");
      fireEvent.click(node);
    });
    then("I can see the upload file modal", async () => {
      const node = await screen.findByText("Upload files");
      expect(node).toBeDefined();
    });
    when("I am select file and continue with default option", async () => {
      const mockFile = new File(["pritesh"], "pritesh.pdf", {
        type: "text/pdf",
      });

      const uploadFileDialog = await screen.findByTestId("dialog-wrapper");
      const dropdzone = await within(uploadFileDialog).findByTestId(
        "file-dropzone"
      );
      fireEvent.drop(dropdzone, {
        dataTransfer: { files: [mockFile], types: ["Files"] },
      });

      // click on continue
      const continueBtn = await within(uploadFileDialog).findByTestId(
        "continueButton"
      );
      fireEvent.click(continueBtn);
    });
    then("I can see the file is uploded successfully", async () => {
      const node = await screen.findByText("File uploaded successfully.");
      expect(node).toBeDefined();
    });
  });

  test("User can upload a new file with AI option", ({ given, then, when }) => {
    given("I am a User loading AiQueryHubFilesTab", async () => {
      screen = render(
        <MockAPIHelperBlock>
          <AiQueryHubFilesTab {...screenProps} />
        </MockAPIHelperBlock>
      );
    });
    then("I can see page is loaded", async () => {
      const node = await screen.findByText("newtest.pdf");
      expect(node).toBeDefined();
    });
    when("I am click on browse", async () => {
      const node = await screen.findByTestId("browse-link");
      fireEvent.click(node);
    });
    then("I can see the upload file modal", async () => {
      const node = await screen.findByText("Upload files");
      expect(node).toBeDefined();
    });
    when("I am select file and continue with default option", async () => {
      const uploadFileDialog = await screen.findByTestId("dialog-wrapper");
      const dropdzone = await within(uploadFileDialog).findByTestId(
        "file-dropzone"
      );
      fireEvent.drop(dropdzone, {
        dataTransfer: {
          files: [mockFile("PDF", 2 * 1024 * 1024)],
          types: ["Files"],
        },
      });

      // select file action type
      await onGetSelectOptionsValues(
        screen,
        "renderDropdownPurpose",
        "AI_PROCESSING"
      );

      // click on continue
      await waitFor(async () => {
        const continueBtn = await within(uploadFileDialog).findByTestId(
          "continueButton"
        );
        fireEvent.click(continueBtn);
      });
    });
    then("I can see the file preview popup", async () => {
      const node = await screen.findByTestId("preview-dialog-wrapper");
      expect(node).toBeDefined();
    });
    when("I am select action and click on continue button", async () => {
      const fieldNameId = await screen.findByTestId("multi-select-param");
      if (fieldNameId) {
        fieldNameId.focus();
        fireEvent.keyDown(fieldNameId, { key: "ArrowDown" });
        const searchInput = (await fieldNameId.querySelector(
          "input"
        )) as HTMLInputElement;
        fireEvent.change(searchInput, { target: { value: "property_info" } });
        let node = await screen.findByText("property_info");
        fireEvent.click(node);
      }

      const continueButton = await screen.findByTestId("buttonPhase1");
      fireEvent.click(continueButton);
    });
    then("I can see the next step", async () => {
      const node = await screen.findByText("Processing 1 file");
      expect(node).toBeDefined();
    });
    when("I am filling step 2 form", async () => {
      const nameField = await screen.findByPlaceholderText("Final file name");
      fireEvent.change(nameField, { target: { value: "newabcdfilename" } });

      await onGetSelectOptionsValues(screen, "renderDropdown", "Table");

      const textField = await screen.findByPlaceholderText(
        "Please describe information you wish to collect from uploaded files"
      );
      fireEvent.change(textField, { target: { value: "newabcdfilename" } });

      let continueButton = await screen.findByTestId("buttonPhase2");
      fireEvent.click(continueButton);

      await onGetSelectOptionsValues(screen, "renderDropdownFormat", "pdf");

      continueButton = await screen.findByTestId("buttonPhase2");
      fireEvent.click(continueButton);
    });
  });

  test("User can upload a new file with AI option and see file preview dialogue", ({ given, then, when }) => {
    given("I am a User loading AiQueryHubFilesTab", async () => {
      screen = render(
        <MockAPIHelperBlock>
          <AiQueryHubFilesTab {...screenProps} />
        </MockAPIHelperBlock>
      );
    });
    then("I can see page is loaded", async () => {
      const pdfFile = await screen.findByText("newtest.pdf");
      expect(pdfFile).toBeDefined();
    });
    when("I am click on browse", async () => {
      const browseLink = await screen.findByTestId("browse-link");
      fireEvent.click(browseLink);
    });
    then("I can see the upload file modal", async () => {
      const node = await screen.findByText("Upload files");
      expect(node).toBeDefined();
    });
    when("I am select file and continue with default option", async () => {
      const uploadFileDialogWrapper = await screen.findByTestId("dialog-wrapper");
      const dropdzone = await within(uploadFileDialogWrapper).findByTestId(
        "file-dropzone"
      );
      fireEvent.drop(dropdzone, {
        dataTransfer: {
          files: [mockFile("PDF", 2 * 1024 * 1024)],
          types: ["Files"],
        },
      });

      // select file action type
      await onGetSelectOptionsValues(
        screen,
        "renderDropdownPurpose",
        "AI_PROCESSING"
      );

      // click on continue
      await waitFor(async () => {
        const continueBtn = await within(uploadFileDialogWrapper).findByTestId(
          "continueButton"
        );
        fireEvent.click(continueBtn);
      });
    });
    then("I can see the file preview popup", async () => {
      const node = await screen.findByTestId("preview-dialog-wrapper");
      expect(node).toBeDefined();
    });
    then("I can close file preview dialogue the next step", async () => {
      const dialog = await screen.findByTestId("preview-dialog-wrapper");
      const cancelButton = await within(dialog).findByTestId("cancelUpload");
      fireEvent.click(cancelButton); 
      expect(dialog).toBeInTheDocument();

      const confirmationDialog = await screen.findByTestId("confirmation-dialogue");
      const okButton = await within(confirmationDialog).findByTestId("okButton");
      fireEvent.click(okButton); 
    });
  });

  test("User can delete file", ({ given, then, when }) => {
    given("I am a User loading AiQueryHubFilesTab", async () => {
      screen = render(
        <MockAPIHelperBlock>
          <AiQueryHubFilesTab {...screenProps} />
        </MockAPIHelperBlock>
      );
    });
    then("I can see page is loaded", async () => {
      const node = await screen.findByText("newtest.pdf");
      expect(node).toBeDefined();
    });
    when("I am click on more menu button", async () => {
      const more_menu_btn = await screen.findByTestId("more-menu-button-554");
      fireEvent.click(more_menu_btn);
    });
    then("File action menu will open", async () => {
      const actionMenu = await screen.findByTestId("action-menu");
      expect(actionMenu).toBeDefined();
    });
    when("I am select delete file menu", async () => {
      const replaceFileMenu = await screen.findByTestId("delete-file-menu");
      fireEvent.click(replaceFileMenu);
    });
    then("I can see the delete file dialog will open", async () => {
      console.log("screen::", document.body.innerHTML);
      const deleteFileDialog = await screen.findByText(
        "Are you sure you want to delete?"
      );
      expect(deleteFileDialog).toBeDefined();
    });
    when("I am click on delete button", async () => {
      const node = await screen.findByTestId("confirmDeleteBtn");
      fireEvent.click(node);
    });
    then("I can see the file is deleted", async () => {
      const node = await screen.findByText("File deleted successfully.");
      expect(node).toBeDefined();
    });
  });

  test("User can view file", ({ given, then, when }) => {
    given("I am a User loading AiQueryHubFilesTab", async () => {
      screen = render(
        <MockAPIHelperBlock>
          <AiQueryHubFilesTab {...screenProps} />
        </MockAPIHelperBlock>
      );
    });
    then("I can see page is loaded", async () => {
      const node = await screen.findByText("newtest.pdf");
      expect(node).toBeDefined();
    });
    when("I am click on more menu button", async () => {
      const more_menu_btn = await screen.findByTestId("more-menu-button-554");
      fireEvent.click(more_menu_btn);
    });
    then("File action menu will open", async () => {
      const actionMenu = await screen.findByTestId("action-menu");
      expect(actionMenu).toBeDefined();
    });
    when("I am select delete file menu", async () => {
      const viewFileMenu = await screen.findByTestId("view-file-menu");
      fireEvent.click(viewFileMenu);
    });
    then("I can see the view file dialog will open", async () => {
      const node = await screen.findByText("newtest.pdf");
      expect(node).toBeDefined();
    });
  });

  test("User can replace file", ({ given, then, when }) => {
    cleanup();
    given("I am a User loading AiQueryHubFilesTab", async () => {
      screen = render(
        <MockAPIHelperBlock>
          <AiQueryHubFilesTab {...screenProps} />
        </MockAPIHelperBlock>
      );
    });
    then("I can see page is loaded", async () => {
      const node = await screen.findByText("newtest.pdf");
      expect(node).toBeDefined();
    });
    when("I am click on more menu button", async () => {
      const more_menu_btn = await screen.findByTestId("more-menu-button-554");
      fireEvent.click(more_menu_btn);
    });
    then("File action menu will open", async () => {
      const actionMenu = await screen.findByTestId("action-menu");
      expect(actionMenu).toBeDefined();
    });
    when("I am select replace file menu", async () => {
      const replaceFileMenu = await screen.findByTestId("replace-file-menu");
      fireEvent.click(replaceFileMenu);
    });
    then("I can see the replace file dialog will open", async () => {
      const replaceFileDialog = await screen.findByTestId(
        "replace-file-dialog"
      );
      const replaceText = await within(replaceFileDialog).findByText(
        "Replace file"
      );
      expect(replaceText).toBeDefined();
    });
    when("I drag or browse file and select action type", async () => {
      // select or drop file
      const mockVideo = new File(["pritesh"], "pritesh.mp4", {
        type: "video/mp4",
      });

      const replaceFileDialog = await screen.findByTestId(
        "replace-file-dialog"
      );
      const dropdzone = await within(replaceFileDialog).findByTestId(
        "dropzone"
      );
      fireEvent.drop(dropdzone, {
        dataTransfer: { files: [mockVideo], types: ["Files"] },
      });

      // select file action type
      await onGetSelectOptionsValues(
        screen,
        "select-action-type",
        "NO_ACTION"
      );

      // click on continue button
      const continueButton = await within(replaceFileDialog).findByTestId(
        "replace-dialog-submit-btn"
      );
      fireEvent.click(continueButton);
    });
    then("I can see file replaced successfully", async () => {
      await new Promise((r) => setTimeout(r, 500));
      const node = await screen.findByText("File has been replaced successfully");
      expect(node).toBeDefined();
    });
  });

  test("User can get error while replacing file", ({ given, then, when }) => {
    cleanup();
    given("I am a User loading AiQueryHubFilesTab", async () => {
      screen = render(
        <MockAPIHelperBlock>
          <AiQueryHubFilesTab {...screenProps} />
        </MockAPIHelperBlock>
      );
    });
    then("I can see page is loaded", async () => {
      const node = await screen.findByText("newtest.pdf");
      expect(node).toBeDefined();
    });
    when("I am click on more menu button", async () => {
      const more_menu_btn = await screen.findByTestId("more-menu-button-554");
      fireEvent.click(more_menu_btn);
    });
    then("File action menu will open", async () => {
      const actionMenu = await screen.findByTestId("action-menu");
      expect(actionMenu).toBeDefined();
    });
    when("I am select replace file menu", async () => {
      const replaceFileMenu = await screen.findByTestId("replace-file-menu");
      fireEvent.click(replaceFileMenu);
    });
    then("I can see the replace file dialog will open", async () => {
      const replaceFileDialog = await screen.findByTestId(
        "replace-file-dialog"
      );
      const replaceText = await within(replaceFileDialog).findByText(
        "Replace file"
      );
      expect(replaceText).toBeDefined();
    });
    when("I drag or browse file and select action type", async () => {
      // select or drop file
      const mockVideo = new File(["pritesh"], "pritesh.mp4", {
        type: "video/mp4",
      });

      const replaceFileDialog = await screen.findByTestId(
        "replace-file-dialog"
      );
      const dropdzone = await within(replaceFileDialog).findByTestId(
        "dropzone"
      );
      fireEvent.drop(dropdzone, {
        dataTransfer: { files: [mockVideo], types: ["Files"] },
      });

      // select file action type
      await onGetSelectOptionsValues(
        screen,
        "select-action-type",
        "NO_ACTION"
      );

      // click on continue button
      window.localStorage.setItem("authToken", "authToken2");
      jest.spyOn(utils, "getStorageData").mockImplementation((key, _) => {
        switch (key) {
          case "authToken":
            return Promise.resolve("authToken2");
          default:
            return Promise.resolve();
        }
      });

      const continueButton = await within(replaceFileDialog).findByTestId(
        "replace-dialog-submit-btn"
      );
      fireEvent.click(continueButton);
    });
    then("I can see error", async () => {
      await new Promise((r) => setTimeout(r, 500));
      const node = await screen.findByText("Unfortunately this file cannot be replaced");
      expect(node).toBeDefined();

      const closeBtn = await screen.findByTestId("commonDialogSubmitBtn");
      fireEvent.click(closeBtn);
    });
  });
});
