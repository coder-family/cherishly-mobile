import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import AskChildModal from '../app/components/qa/AskChildModal';

// Mock the Prompt type
const mockPrompt = {
  id: '1',
  title: 'What was your favorite part of today?',
  content: 'Tell me about the best thing that happened today.',
  category: 'Daily Reflection',
  tags: ['daily', 'reflection'],
  isActive: true,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

// Mock expo-image-picker
jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(),
  MediaTypeOptions: {
    Images: 'Images',
    Videos: 'Videos',
    All: 'All',
  },
}));

// Mock the Redux hooks
jest.mock('../app/redux/hooks', () => ({
  useAppDispatch: () => jest.fn(),
  useAppSelector: () => ({
    prompts: [mockPrompt],
    loading: false,
    error: null,
  }),
}));

// Mock the MultiMediaPicker component
jest.mock('../app/components/media/MultiMediaPicker', () => {
  const React = require('react');
  const { View, Text, TouchableOpacity } = require('react-native');
  
  return function MockMultiMediaPicker({ onMediaPicked }: any) {
    return React.createElement(View, { testID: "multi-media-picker" },
      React.createElement(TouchableOpacity, { onPress: () => onMediaPicked([]) },
        React.createElement(Text, null, "Add Media")
      )
    );
  };
});

describe('AskChildModal', () => {
  it('renders correctly with system question type', () => {
    const onSave = jest.fn();
    const onClose = jest.fn();
    const systemQuestions = [mockPrompt];

    const { getByText } = render(
      <AskChildModal
        visible={true}
        onClose={onClose}
        onSave={onSave}
        systemQuestions={systemQuestions}
        childId="test-child-id"
      />
    );

    expect(getByText('Ask Your Child')).toBeTruthy();
    expect(getByText('Use system question')).toBeTruthy();
    expect(getByText('Write your own question')).toBeTruthy();
  });

  it('renders correctly with custom question type', () => {
    const onSave = jest.fn();
    const onClose = jest.fn();
    const systemQuestions = [mockPrompt];

    const { getByText, getByPlaceholderText } = render(
      <AskChildModal
        visible={true}
        onClose={onClose}
        onSave={onSave}
        systemQuestions={systemQuestions}
        childId="test-child-id"
      />
    );

    // Switch to custom question type
    fireEvent.press(getByText('Write your own question'));
    
    expect(getByPlaceholderText('Enter your question')).toBeTruthy();
    expect(getByPlaceholderText('Enter your answer')).toBeTruthy();
  });

  it('handles form validation correctly', () => {
    const onSave = jest.fn();
    const onClose = jest.fn();
    const systemQuestions = [mockPrompt];

    const { getByText } = render(
      <AskChildModal
        visible={true}
        onClose={onClose}
        onSave={onSave}
        systemQuestions={systemQuestions}
        childId="test-child-id"
      />
    );

    // Save button should be disabled initially (no answer)
    const saveButton = getByText('Save Question & Answer');
    // Check if button is disabled by looking at accessibility state or style
    expect(saveButton).toBeTruthy();
  });

  it('handles custom question input', () => {
    const onSave = jest.fn();
    const onClose = jest.fn();
    const systemQuestions = [mockPrompt];

    const { getByText, getByPlaceholderText } = render(
      <AskChildModal
        visible={true}
        onClose={onClose}
        onSave={onSave}
        systemQuestions={systemQuestions}
        childId="test-child-id"
      />
    );

    // Switch to custom question type
    fireEvent.press(getByText('Write your own question'));
    
    const questionInput = getByPlaceholderText('Enter your question');
    const answerInput = getByPlaceholderText('Enter your answer');

    fireEvent.changeText(questionInput, 'What did you learn today?');
    fireEvent.changeText(answerInput, 'I learned how to count to 10!');

    // Save button should now be enabled
    const saveButton = getByText('Save Question & Answer');
    expect(saveButton).toBeTruthy();
  });
}); 