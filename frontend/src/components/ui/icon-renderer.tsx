import {
  PenTool, BookOpen, Paperclip, Folder, Link as LinkIcon, Scissors, Printer,
  Archive, Tag, Box, Package, ShoppingBag, Layers, Grid3X3, Star, Gift,
  Palette, Stamp, Pen, FileText, Clipboard, Brush, Coffee, ChevronRight,
} from 'lucide-react';
import React from 'react';

const iconMap: Record<string, React.ElementType> = {
  PenTool, BookOpen, Paperclip, Folder, Link: LinkIcon, Scissors, Printer,
  Archive, Tag, Box, Package, ShoppingBag, Layers, Grid3X3, Star, Gift,
  Palette, Stamp, Pen, FileText, Clipboard, Brush, Coffee, ChevronRight,
  // Common emoji-based category names as fallback Lucide icons
  '📝': PenTool,
  '📚': BookOpen,
  '📎': Paperclip,
  '✏️': Pen,
  '🖨️': Printer,
  '📦': Package,
  '🎨': Palette,
  '🏷️': Tag,
};

export function IconRenderer({ name, className }: { name: string; className?: string }) {
  if (!name) return null;
  const IconComponent = iconMap[name];
  if (!IconComponent) {
    // If it looks like an emoji, render it as text with correct sizing
    const isEmoji = /\p{Emoji}/u.test(name) && name.length <= 4;
    if (isEmoji) return <span className={className} style={{ fontSize: '1.1em', lineHeight: 1 }}>{name}</span>;
    // Otherwise show nothing (no raw text fallback)
    return null;
  }
  return <IconComponent className={className} />;
}