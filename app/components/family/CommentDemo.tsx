// import React from 'react';
// import { StyleSheet, Text, View } from 'react-native';
// import CommentSystem from './CommentSystem';

// interface CommentDemoProps {
//   targetType: 'PromptResponse' | 'Memory' | 'HealthRecord' | 'GrowthRecord' | 'Comment';
//   targetId: string;
//   title?: string;
// }

// const CommentDemo: React.FC<CommentDemoProps> = ({ 
//   targetType, 
//   targetId, 
//   title = 'Bình luận' 
// }) => {
//   const handleCommentAdded = (comment: any) => {
//     console.log('Comment added:', comment);
//   };

//   const handleCommentDeleted = (commentId: string) => {
//     console.log('Comment deleted:', commentId);
//   };

//   const handleCommentEdited = (comment: any) => {
//     console.log('Comment edited:', comment);
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>{title}</Text>
//       <CommentSystem
//         targetType={targetType}
//         targetId={targetId}
//         onCommentAdded={handleCommentAdded}
//         onCommentDeleted={handleCommentDeleted}
//         onCommentEdited={handleCommentEdited}
//       />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   title: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     padding: 16,
//     backgroundColor: '#f8f9fa',
//     borderBottomWidth: 1,
//     borderBottomColor: '#e9ecef',
//   },
// });

// export default CommentDemo; 