import { render } from "@testing-library/react-native";
import React from "react";
import { Provider } from "react-redux";
import Intro from "../app/index";
import { store } from "../app/redux/store";

test("renders correctly", () => {
  const { getByText } = render(
    <Provider store={store}>
      <Intro />
    </Provider>
  );
  expect(getByText("Growing Together")).toBeTruthy();
  expect(getByText("Create Account")).toBeTruthy();
});
