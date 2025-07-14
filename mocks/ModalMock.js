// mocks/ModalMock.js
const React = require('react');
const { View } = require('react-native');

const ModalMock = React.forwardRef((props, ref) => {
  const { visible, children, testID, animationType, transparent, ...otherProps } = props;
  if (visible) {
    return (
      <View testID={testID || 'modal'} ref={ref} {...otherProps}>
        {children}
      </View>
    );
  }
  return null;
});

ModalMock.displayName = 'Modal';

module.exports = ModalMock;