export interface TextBlock {
  type: 'text';
  value: string;
}

export interface StepsBlock {
  type: 'steps';
  items: string[];
}

export interface CommandBlock {
  type: 'command';
  value: string;
  action?: string;
}

export interface NoteBlock {
  type: 'note';
  value: string;
  variant?: 'info' | 'warning';
}

export interface VideoBlock {
  type: 'video';
  src: string;
  title?: string;
}

export type ContentBlock = TextBlock | StepsBlock | CommandBlock | NoteBlock | VideoBlock;

export interface CookbookSection {
  heading: string;
  level: 2 | 3;
  content: ContentBlock[];
}

export function sectionId(heading: string, index: number): string {
  const slug = heading
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return `section-${slug}-${String(index)}`;
}
