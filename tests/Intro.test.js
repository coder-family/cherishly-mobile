import { render } from "@testing-library/react-native";
import { Intro } from "app/(tabs)";
import React from "react";


test("renders correctly", () => {
  const { getByText } = render(<Intro />);
  expect(getByText("Growing Together")).toBeTruthy();
  expect(getByText("Get Started")).toBeTruthy();
});
