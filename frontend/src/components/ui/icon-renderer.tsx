import { PenTool, BookOpen, Paperclip, Folder, Link as LinkIcon, Scissors, Printer, Archive } from 'lucide-react';
import React from 'react';

const iconMap: Record<string, React.ElementType> = {
  PenTool,
  BookOpen,
  Paperclip,
  Folder,
  Link: LinkIcon,
  Scissors,
  Printer,
  Archive,
};

export function IconRenderer({ name, className }: { name: string; className?: string }) {
  const IconComponent = iconMap[name];
  if (!IconComponent) {
    return <span className={className}>{name}</span>; // Fallback to text/emoji if not mapped
  }
  return <IconComponent className={className} />;
}