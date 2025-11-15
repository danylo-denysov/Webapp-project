import React from 'react';
import './MentionText.css';

interface MentionTextProps {
  content: string;
}

export const MentionText: React.FC<MentionTextProps> = ({ content }) => {
  // Parse text and highlight @mentions
  const renderContent = () => {
    const mentionRegex = /@(\w+)/g;
    const parts: (string | React.ReactElement)[] = [];
    let lastIndex = 0;
    let match;

    while ((match = mentionRegex.exec(content)) !== null) {
      // Add text before mention
      if (match.index > lastIndex) {
        parts.push(content.slice(lastIndex, match.index));
      }

      // Add mention with styling
      parts.push(
        <span key={match.index} className="mention-highlight">
          @{match[1]}
        </span>
      );

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < content.length) {
      parts.push(content.slice(lastIndex));
    }

    return parts.length > 0 ? parts : content;
  };

  return <div className="mention-text">{renderContent()}</div>;
};
