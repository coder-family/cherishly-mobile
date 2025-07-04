import { render } from "@testing-library/react-native";
import React from "react";
import Intro from "../app/index";


test("renders correctly", () => {
  const { getByText } = render(<Intro />);
  expect(getByText("Growing Together")).toBeTruthy();
  expect(getByText("Get Started")).toBeTruthy();
});
