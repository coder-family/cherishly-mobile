# Q&A Components

This directory contains all components related to the Questions & Answers functionality in the child profile.

## Components Overview

### 🎯 **QAContent** (`QAContent.tsx`)
The main component that displays the Q&A interface with answered question and answer cards.

**Features:**
- Displays only answered questions in card format
- Shows media attachments (images, videos, audio)
- "Ask Child" button with modal selection
- Infinite scrolling with pagination
- Loading states and error handling

**Props:**
```typescript
interface QAContentProps {
  childId: string;
}
```

### 🃏 **QuestionAnswerCard** (`QuestionAnswerCard.tsx`)
A card component that displays a question and its answer with media support.

**Features:**
- Clean card design with question and answer sections
- Media preview (images, videos, audio)
- Status indicators (answered)
- Category tags
- Feedback display
- Edit response button

**Props:**
```typescript
interface QuestionAnswerCardProps {
  prompt: Prompt;
  response: PromptResponse; // Always present since only answered questions are shown
  onPress?: () => void;
  onAddResponse?: () => void;
  showAddButton?: boolean;
}
```

### ❓ **AskChildModal** (`AskChildModal.tsx`)
A modal that allows users to choose how to ask their child a question.

**Features:**
- Two options: "System Question" or "Your Question"
- Clean selection interface
- Continue button (disabled until selection)

**Props:**
```typescript
interface AskChildModalProps {
  visible: boolean;
  onClose: () => void;
  onSystemQuestion: () => void;
  onCustomQuestion: () => void;
}
```

### ✍️ **CustomQuestionModal** (`CustomQuestionModal.tsx`)
A modal for users to write their own custom questions.

**Features:**
- Text input for question content
- Optional category field
- Form validation
- Submit functionality

**Props:**
```typescript
interface CustomQuestionModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (question: string) => void;
}
```

### ➕ **AddResponseModal** (`AddResponseModal.tsx`)
A modal for adding responses to questions with media support.

**Features:**
- Text input for response
- Media upload (images, videos, audio)
- Form validation
- Submit functionality

**Props:**
```typescript
interface AddResponseModalProps {
  visible: boolean;
  prompt: Prompt;
  childId: string;
  onClose: () => void;
  onSuccess: () => void;
}
```

### 📝 **PromptItem** (`PromptItem.tsx`)
Legacy component for displaying individual prompts (used in other parts of the app).

### 💬 **ResponseItem** (`ResponseItem.tsx`)
Legacy component for displaying individual responses (used in other parts of the app).

## Usage

### Basic Implementation
```tsx
import { QAContent } from '../components/qa';

function ChildProfileScreen({ childId }) {
  return (
    <QAContent childId={childId} />
  );
}
```

### Using Individual Components
```tsx
import { QuestionAnswerCard, AskChildModal } from '../components/qa';

function CustomQAScreen() {
  const [showAskModal, setShowAskModal] = useState(false);
  
  return (
    <View>
      <QuestionAnswerCard
        prompt={prompt}
        response={response}
        onPress={() => console.log('Card pressed')}
        onAddResponse={() => console.log('Add response')}
      />
      
      <AskChildModal
        visible={showAskModal}
        onClose={() => setShowAskModal(false)}
        onSystemQuestion={() => console.log('System question')}
        onCustomQuestion={() => console.log('Custom question')}
      />
    </View>
  );
}
```

## Data Flow

1. **QAContent** loads prompts and responses from Redux store
2. **QuestionAnswerCard** displays each prompt-response pair
3. **AskChildModal** allows users to choose question type
4. **CustomQuestionModal** lets users write custom questions
5. **AddResponseModal** enables adding responses with media

## Media Support

The Q&A interface supports various media types:

- **Images**: Displayed as preview thumbnails
- **Videos**: Show video icon with play indicator
- **Audio**: Displayed with audio icon
- **Multiple Files**: Shows count indicator (+N)

## Styling

All components use consistent styling with:
- Card-based design
- Rounded corners
- Shadow effects
- Color-coded status indicators
- Responsive layout

## State Management

The Q&A components integrate with Redux for:
- Loading prompts and responses
- Managing loading states
- Error handling
- Pagination

## Future Enhancements

- [ ] System question templates
- [ ] Question categories and filtering
- [ ] Response analytics
- [ ] Voice recording support
- [ ] Question scheduling
- [ ] Response sharing 