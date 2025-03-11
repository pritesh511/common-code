// Customizable Area Start
import React from "react";
import AppLandingPageController, {
  Props,
  configJSON,
} from "./AppLandingPageController.web";
const Strings = configJSON.Strings.AppLandingPage;
// Customizable Area End

export class AppLandingPage extends AppLandingPageController {
  constructor(props: Props) {
    super(props);
    // Customizable Area Start
    // Customizable Area End
  }

  // Customizable Area Start
  // Customizable Area End

  render() {
    // Customizable Area Start
    // Customizable Area End

    // Customizable Area Start
    return <h1>{Strings.welcome}</h1>;
    // Customizable Area End
  }
}

// Customizable Area Start
// Customizable Area End
