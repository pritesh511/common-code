import { ReactNode } from "react";
import { Message } from "../../../framework/src/Message";
import MessageEnum, {
  getName,
} from "../../../framework/src/Messages/MessageEnum";
import { getStorageData, removeStorageData } from "../../../framework/src/Utilities";

export const makeApiMessage = async ({
  url = "",
  headers = {},
  method = "GET",
  body = null,
  isHeader = false,
}: {
  body?: any;
  url: string;
  headers?: any;
  method: string;
  isHeader?: boolean;
}) => {
  const requestMessage = new Message(
    getName(MessageEnum.RestAPIRequestMessage)
  );

  const header = {
    "Content-Type": "application/json",
    token: await getStorageData("authToken"),
    ...headers,
  };

  const headreWithoutContentType = {
    token: await getStorageData("authToken"),
    ...headers,
  };

  requestMessage.addData(
    getName(MessageEnum.RestAPIResponceEndPointMessage),
    url
  );

  requestMessage.addData(
    getName(MessageEnum.RestAPIRequestHeaderMessage),
    JSON.stringify(!isHeader ? header : headreWithoutContentType)
  );

  requestMessage.addData(
    getName(MessageEnum.RestAPIRequestMethodMessage),
    method
  );

  body &&
    requestMessage.addData(
      getName(MessageEnum.RestAPIRequestBodyMessage),
      body
    );

  return requestMessage;
};

export const getFileExtension = (fileName: string) => {
  const listName = fileName.split(".");
  const extension = listName[listName.length - 1];
  return extension;
};

export const byteConverter = (size: number) => {
  const units = ["bytes", "KB", "MB", "GB"];
  let countIndex = 0;
  while (size >= 1024 && ++countIndex) {
    size = size / 1024;
  }

  return (
    size.toFixed(size < 10 && countIndex > 0 ? 1 : 0) + " " + units[countIndex]
  );
};

export const renderBaseonCondition = (
  condition: boolean,
  trueValue: ReactNode,
  falseValue: ReactNode
) => {
  return condition ? trueValue : falseValue;
};

export const renderBaseonStringCondition = (
  condition: boolean,
  trueValue: string,
  falseValue: string
) => {
  return condition ? trueValue : falseValue;
};

export const getPaginationIndex = (
  perPage: number,
  currentPage: number,
  totalResults: number,
  key: "start" | "end"
) => {
  const startIndex = (currentPage - 1) * perPage + 1;
  const endIndex = Math.min(currentPage * perPage, totalResults);

  if (key === "start") {
    return startIndex;
  } else {
    return endIndex;
  }
};

export const navigateToScreen = (screen: string, props: any, data?: any) => {
  const message: Message = new Message(getName(MessageEnum.NavigationMessage));
  message.addData(getName(MessageEnum.NavigationTargetMessage), screen);
  message.addData(getName(MessageEnum.NavigationPropsMessage), props);
  const raiseMessage: Message = new Message(
    getName(MessageEnum.NavigationPayLoadMessage)
  );
  raiseMessage.addData(getName(MessageEnum.NavigationPayLoadMessage), data);
  message.addData(getName(MessageEnum.NavigationRaiseMessage), raiseMessage);
  return message;
};


export const navigateToHomeAsTokenExpire = (props: any) => {
  removeStorageData("authToken");
  removeStorageData("account_id");
  navigateToScreen("EmailAccountLoginBlock", props)
}

export const handleDownloadFile = async (url: string, filePreviewName: string) => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = blobUrl;
    link.setAttribute("download", filePreviewName);
    document.body.appendChild(link);
    link.click();
   
    window.URL.revokeObjectURL(blobUrl);
    document.body.removeChild(link);
  } catch (error) {
    console.error("Error downloading the file:", error);
  }
};

export function commonDebounce<T extends (...args: any[]) => void>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => func(...args), delay);
  };
}
