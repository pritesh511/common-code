// test-setup.js
import { configure } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import initializeMockResponse from "../../blocks/utilities/src/testHelper";

configure({ adapter: new Adapter() });

jest.mock("react-native/Libraries/Utilities/Platform", () => ({
  OS: "macos",
  select: () => null,
}));

jest.mock('js-cookie', () => ({
  get: jest.fn(),
  set: jest.fn(),
  remove: jest.fn(),
}));

jest.mock("@react-native-google-signin/google-signin", () => ({
  GoogleSignin: {
    configure: jest.fn(),
  },
  statusCodes: "",
}));

jest.mock("react-native-fbsdk", () => ({
  LoginManager: {
    logInWithPermissions: jest
      .fn()
      .mockImplementation(() => Promise.resolve("")),
  },
  AccessToken: {
    getCurrentAccessToken: jest
      .fn()
      .mockImplementation(() =>
        Promise.resolve({ accessToken: "access-token-string" })
      ),
  },
}));

function getMockFunction(request) {
  const { url, headers } = request;
  const token = headers.token;
  switch (url) {
    case "//bx_block_login/logins":
      if(token === "authToken2") {
        return {
          error: "You are not autherised to perform this acess"
        }
      }
      return {
        meta: {
          token: "abcd token",
          id: 123
        },
      };
  }
}

initializeMockResponse(getMockFunction);
