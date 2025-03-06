import React, { ReactNode } from "react";
import {
  within,
  waitFor,
  fireEvent,
  configure,
  RenderResult,
} from "@testing-library/react";
import MessageEnum, {
  getName,
} from "../../../framework/src/Messages/MessageEnum";
import { IBlock } from "../../../framework/src/IBlock";
import { Message } from "../../../framework/src/Message";
import { runEngine } from "../../../framework/src/RunEngine";
import { BlockComponent } from "../../../framework/src/BlockComponent";
import RestApiClientBlock from "../../../framework/src/Blocks/RestApiClientBlock";

const globalConfig = require("../../../framework/src/config");
const baseURLOrderManagement = globalConfig.baseURL;

configure({ testIdAttribute: "data-test-id" });

export async function onGetSelectOptionsValues(
  screen: RenderResult,
  fieldName: string,
  selectedValue: string = "",
  expectMinOptions: number = 1
) {
  const node = await screen.findByTestId(fieldName);
  const button = node.querySelector('[role="button"]');

  button && fireEvent.mouseDown(button);

  const popover = await screen.findByRole("presentation");
  const listbox = await within(popover).findByRole("listbox");
  const options = await within(listbox).findAllByRole("option");
  const optionValues = options.map((li) => li.getAttribute("data-value"));

  waitFor(() => expect(options.length).toBeGreaterThan(expectMinOptions - 1));

  const isSelected = optionValues.indexOf(selectedValue) !== -1;
  isSelected && fireEvent.click(options[optionValues.indexOf(selectedValue)]);

  button && fireEvent.mouseDown(button);

  return options.map((li) => li.getAttribute("data-value"));
}

// Mock api helper
interface Props {
  children: ReactNode;
}
interface State {}
interface SS {}

export interface IRequest extends RequestInit {
  url: string;
  bodyType?: "none" | "form" | "json"; // Optional property
}

const initializeMockResponses = (
  getMockedResponses: (request: IRequest) => any
) => {
  // Ensure `Response` is defined in the test environment
  if (typeof globalThis.Response === "undefined") {
    globalThis.Response = class {
      json() {
        return Promise.resolve({});
      }
      blob() {
        return Promise.resolve(
          new Blob(["%PDF-1.4\n%âãÏÓ\n..."], { type: "application/pdf" }) // Fake PDF content
        )
      }
    } as any;
  }

  window.fetch = async (
    urlForOrderManagement: RequestInfo | URL,
    data?: RequestInit
  ) => {
    const urlString = String(urlForOrderManagement).replace(
      baseURLOrderManagement,
      ""
    );

    let bodyTypeOrderManagement: "none" | "form" | "json" = "none";
    if (data?.body) {
      bodyTypeOrderManagement = data.body instanceof FormData ? "form" : "json";
    }

    const request: IRequest = {
      url: urlString,
      bodyType: bodyTypeOrderManagement,
      ...data,
    };

    // Get the mocked response
    const mockedResponseOrderManagement = getMockedResponses(request) ?? {
      status: 200,
      message: "Mock response not configured for the request",
    };

    return Promise.resolve({
      json: async () => mockedResponseOrderManagement,
      blob: async () =>
        new Blob(
          [new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34])], // "%PDF-1.4"
          { type: "application/pdf" }
        ),
    }) as unknown as Response;
  };
};


export class MockAPIHelperBlock extends BlockComponent<Props, State, SS> {
  constructor(props: Props) {
    super(props);
    this.subScribedMessages = [getName(MessageEnum.RestAPIRequestMessage)];
    runEngine.attachBuildingBlock(this as IBlock, this.subScribedMessages);
    this.receive = this.receive.bind(this);
  }

  receive(from: string, message: Message) {
    let apiServerBlock = RestApiClientBlock.getInstance();
    apiServerBlock.receive(from, message);
  }

  render(): React.ReactNode {
    return this.props.children;
  }
}

export default initializeMockResponses;
