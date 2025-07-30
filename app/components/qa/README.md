# Q&A Components

This directory contains components for the Question & Answer feature, allowing parents to ask questions to their children and record responses.

## 📁 Component Overview

### 🎯 **QuestionTypeModal** (`QuestionTypeModal.tsx`)
**First Modal in the Flow** - Allows users to choose between system questions and custom questions.

**Features:**
- Clean, simple interface with two options
- System Question: Use pre-written questions from the system
- Custom Question: Write your own question
- Cancel button to close the modal

**Props:**
```typescript
interface QuestionTypeModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectSystem: () => void;
  onSelectCustom: () => void;
}
```

### 📝 **CustomQuestionModal** (`CustomQuestionModal.tsx`)
**Modal for Custom Questions** - Form for creating custom questions and answers.

**Features:**
- Question input with character limit (500 characters)
- Answer input with character limit (2000 characters)
- Optional image attachment
- Save and Cancel buttons
- Form validation

**Props:**
```typescript
interface CustomQuestionModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (question: string, answer: string, attachment?: string) => void;
}
```

### 🎯 **SystemQuestionModal** (`SystemQuestionModal.tsx`)
**Modal for System Questions** - Form for selecting system questions and providing answers.

**Features:**
- Scrollable list of system questions
- Single selection (only one question can be selected at a time)
- Selected question display
- Answer input with character limit (2000 characters)
- Optional image attachment
- Save and Cancel buttons
- Form validation

**Props:**
```typescript
interface SystemQuestionModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (question: Prompt, answer: string, attachment?: string) => void;
  systemQuestions: Prompt[];
}
```

### ❓ **QAContent** (`QAContent.tsx`)
Main component that manages the Q&A flow and displays question-answer cards.

**Features:**
- Three-step modal flow (QuestionTypeModal → CustomQuestionModal/SystemQuestionModal)
- Displays existing Q&A cards
- Load more functionality
- Error handling and loading states

### 🎴 **QuestionAnswerCard** (`QuestionAnswerCard.tsx`)
Displays individual question-answer pairs with media support.

### ➕ **AddResponseModal** (`AddResponseModal.tsx`)
Modal for adding responses to existing prompts.

### ✏️ **EditResponseModal** (`EditResponseModal.tsx`)
Modal for editing existing responses.

### 📋 **PromptItem** (`PromptItem.tsx`)
Displays individual prompt items in lists.

### 💬 **ResponseItem** (`ResponseItem.tsx`)
Displays individual response items.

## 🔄 Three-Step Modal Flow

The new implementation uses a three-step modal flow:

1. **QuestionTypeModal** - User chooses question type
   - System Question: Use pre-written questions
   - Custom Question: Write your own question

2. **CustomQuestionModal** (if custom selected)
   - Write your own question
   - Write your answer
   - Optional image attachment
   - Save and Cancel buttons

3. **SystemQuestionModal** (if system selected)
   - Scrollable list of system questions
   - Single selection with radio button behavior
   - Write your answer
   - Optional image attachment
   - Save and Cancel buttons

## 🎨 Design Features

### Custom Question Modal
- **Question Input**: Text area for writing custom questions (500 char limit)
- **Answer Input**: Text area for writing answers (2000 char limit)
- **Attachment**: Optional image picker with preview
- **Validation**: Both question and answer required to save

### System Question Modal
- **Question List**: Scrollable list with single selection
- **Selection Behavior**: Only one question can be selected at a time
- **Visual Feedback**: Selected questions are highlighted with blue border and background
- **Question Display**: Selected question is shown in a highlighted box
- **Answer Input**: Text area for writing answers (2000 char limit)
- **Attachment**: Optional image picker with preview
- **Validation**: Question selection and answer required to save

## 🚀 Usage Example

```typescript
import { QuestionTypeModal, CustomQuestionModal, SystemQuestionModal } from '../components/qa';

// In your component
const [showQuestionTypeModal, setShowQuestionTypeModal] = useState(false);
const [showCustomQuestionModal, setShowCustomQuestionModal] = useState(false);
const [showSystemQuestionModal, setShowSystemQuestionModal] = useState(false);

const handleAskChild = () => {
  setShowQuestionTypeModal(true);
};

const handleQuestionTypeSelect = (type: 'system' | 'custom') => {
  setShowQuestionTypeModal(false);
  if (type === 'system') {
    setShowSystemQuestionModal(true);
  } else {
    setShowCustomQuestionModal(true);
  }
};

const handleCustomQuestionSave = (question: string, answer: string, attachment?: string) => {
  // Handle custom question save
  setShowCustomQuestionModal(false);
};

const handleSystemQuestionSave = (question: Prompt, answer: string, attachment?: string) => {
  // Handle system question save
  setShowSystemQuestionModal(false);
};
```

## 🔧 Key Improvements

1. **Separate Modals**: Each question type has its own dedicated modal
2. **Better UX**: Clear separation of concerns and focused interfaces
3. **Single Selection**: System questions use radio button behavior
4. **Form Validation**: Proper validation for all required fields
5. **Character Limits**: Clear character limits with counters
6. **Attachment Support**: Optional image attachments for both types
7. **Responsive Design**: Scrollable content and proper modal sizing 