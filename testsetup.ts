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

est.mock('url', () => ({
    createObjectURL: jest.fn(),
  }));
  global.localStorage = {
    length: 0,
    clear: jest.fn(),
    getItem: jest.fn(),
    key: jest.fn(),
    removeItem: jest.fn(),
    setItem: jest.fn()
}
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn()
};
global.localStorage = localStorageMock;
function FormDataMock() {
  this.append = jest.fn();
}

jest.mock('../../framework/src/Utilities.ts', () => ({
  getStorageData: jest.fn().mockImplementation((key) => {
      if (key === 'loginData') {
        return Promise.resolve('bgklgkl');
      }
      return Promise.resolve(null);
    }),
    setStorageData: jest.fn(),
    removeStorageData: jest.fn(),
  }));

jest.mock("../../framework/src/StorageProvider", () => {
    return {
        get: jest.fn()
            .mockImplementation((storage) => {
                return storage === "token" ? Promise.resolve(JSON.stringify(
                  {"serialized_data":{"data":{"id":626,"type":"email_account"},"meta":{"token":"eyJhbGciOiJIUzUxMiJ9.eyJpZCI6NjI2LCJleHAiOjE3MzAxMjMxODUsInRva2VuX3R5cGUiOiJsb2dpbiJ9.SZKFzgebr8p36oIxYZkMFFjvmEQ5PNTX4vfLKAm3TjY2u6q1u88GWiQehjcYVPw5fcgaCkhJTmPxo0qaPc62YQ","refresh_token":"eyJhbGciOiJIUzUxMiJ9.eyJpZCI6NjI2LCJleHAiOjE3NjE1NzI3ODUsInRva2VuX3R5cGUiOiJyZWZyZXNoIn0.iNtOCO3B3eQngrV9DeTBHJU4iRWzbsHEqvr-X_5q5cwRsmJjF8xuivAOfSJdTBLY__rrpaGe3FofEEav1SDm7w"}},"id":626,"full_name":"lawyer oned","email":"lawadmin1@gmail.com","first_name":"lawyer","last_name":"oned","user_role":"lawfirm_admin"}
                )) : storage === "token"
            }),
        remove: jest.fn(),
    };
})

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
