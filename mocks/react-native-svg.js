import React from 'react';
import { View } from 'react-native';

// Mock all SVG components
export const Svg = ({ children, ...props }) => <View {...props}>{children}</View>;
export const Circle = (props) => <View {...props} />;
export const Ellipse = (props) => <View {...props} />;
export const G = ({ children, ...props }) => <View {...props}>{children}</View>;
export const Text = (props) => <View {...props} />;
export const TSpan = (props) => <View {...props} />;
export const TextPath = (props) => <View {...props} />;
export const Path = (props) => <View {...props} />;
export const Polygon = (props) => <View {...props} />;
export const Polyline = (props) => <View {...props} />;
export const Line = (props) => <View {...props} />;
export const Rect = (props) => <View {...props} />;
export const Use = (props) => <View {...props} />;
export const Image = (props) => <View {...props} />;
export const Symbol = ({ children, ...props }) => <View {...props}>{children}</View>;
export const Defs = ({ children, ...props }) => <View {...props}>{children}</View>;
export const LinearGradient = ({ children, ...props }) => <View {...props}>{children}</View>;
export const RadialGradient = ({ children, ...props }) => <View {...props}>{children}</View>;
export const Stop = (props) => <View {...props} />;
export const ClipPath = ({ children, ...props }) => <View {...props}>{children}</View>;
export const Pattern = ({ children, ...props }) => <View {...props}>{children}</View>;
export const Mask = ({ children, ...props }) => <View {...props}>{children}</View>;

export default Svg; 