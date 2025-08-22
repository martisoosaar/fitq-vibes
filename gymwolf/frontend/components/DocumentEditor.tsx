'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Link as LinkIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Heading1,
  Heading2,
  Heading3,
  Type,
} from 'lucide-react';

interface DocumentEditorProps {
  content: string;
  onChange: (content: string) => void;
}

export default function DocumentEditor({ content, onChange }: DocumentEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4],
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 hover:text-blue-700 underline',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    immediatelyRender: false,
  });

  if (!editor) {
    return null;
  }

  const addLink = () => {
    const url = window.prompt('Enter URL:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  return (
    <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="bg-gray-50 dark:bg-gray-700 border-b border-gray-300 dark:border-gray-600 p-2">
        <div className="flex flex-wrap gap-1">
          {/* Text format buttons */}
          <div className="flex gap-1 pr-2 border-r border-gray-300 dark:border-gray-600">
            <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${
                editor.isActive('bold') ? 'bg-gray-200 dark:bg-gray-600' : ''
              }`}
              title="Bold"
            >
              <Bold className="h-4 w-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${
                editor.isActive('italic') ? 'bg-gray-200 dark:bg-gray-600' : ''
              }`}
              title="Italic"
            >
              <Italic className="h-4 w-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${
                editor.isActive('underline') ? 'bg-gray-200 dark:bg-gray-600' : ''
              }`}
              title="Underline"
            >
              <UnderlineIcon className="h-4 w-4" />
            </button>
          </div>

          {/* Heading buttons */}
          <div className="flex gap-1 pr-2 border-r border-gray-300 dark:border-gray-600">
            <button
              onClick={() => editor.chain().focus().setParagraph().run()}
              className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${
                editor.isActive('paragraph') ? 'bg-gray-200 dark:bg-gray-600' : ''
              }`}
              title="Paragraph"
            >
              <Type className="h-4 w-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${
                editor.isActive('heading', { level: 1 }) ? 'bg-gray-200 dark:bg-gray-600' : ''
              }`}
              title="Heading 1"
            >
              <Heading1 className="h-4 w-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${
                editor.isActive('heading', { level: 2 }) ? 'bg-gray-200 dark:bg-gray-600' : ''
              }`}
              title="Heading 2"
            >
              <Heading2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${
                editor.isActive('heading', { level: 3 }) ? 'bg-gray-200 dark:bg-gray-600' : ''
              }`}
              title="Heading 3"
            >
              <Heading3 className="h-4 w-4" />
            </button>
          </div>

          {/* List buttons */}
          <div className="flex gap-1 pr-2 border-r border-gray-300 dark:border-gray-600">
            <button
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${
                editor.isActive('bulletList') ? 'bg-gray-200 dark:bg-gray-600' : ''
              }`}
              title="Bullet List"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${
                editor.isActive('orderedList') ? 'bg-gray-200 dark:bg-gray-600' : ''
              }`}
              title="Ordered List"
            >
              <ListOrdered className="h-4 w-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${
                editor.isActive('blockquote') ? 'bg-gray-200 dark:bg-gray-600' : ''
              }`}
              title="Quote"
            >
              <Quote className="h-4 w-4" />
            </button>
          </div>

          {/* Alignment buttons */}
          <div className="flex gap-1 pr-2 border-r border-gray-300 dark:border-gray-600">
            <button
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
              className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${
                editor.isActive({ textAlign: 'left' }) ? 'bg-gray-200 dark:bg-gray-600' : ''
              }`}
              title="Align Left"
            >
              <AlignLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().setTextAlign('center').run()}
              className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${
                editor.isActive({ textAlign: 'center' }) ? 'bg-gray-200 dark:bg-gray-600' : ''
              }`}
              title="Align Center"
            >
              <AlignCenter className="h-4 w-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
              className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${
                editor.isActive({ textAlign: 'right' }) ? 'bg-gray-200 dark:bg-gray-600' : ''
              }`}
              title="Align Right"
            >
              <AlignRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().setTextAlign('justify').run()}
              className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${
                editor.isActive({ textAlign: 'justify' }) ? 'bg-gray-200 dark:bg-gray-600' : ''
              }`}
              title="Justify"
            >
              <AlignJustify className="h-4 w-4" />
            </button>
          </div>

          {/* Other buttons */}
          <div className="flex gap-1 pr-2 border-r border-gray-300 dark:border-gray-600">
            <button
              onClick={addLink}
              className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${
                editor.isActive('link') ? 'bg-gray-200 dark:bg-gray-600' : ''
              }`}
              title="Add Link"
            >
              <LinkIcon className="h-4 w-4" />
            </button>
          </div>

          {/* Undo/Redo */}
          <div className="flex gap-1">
            <button
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Undo"
            >
              <Undo className="h-4 w-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Redo"
            >
              <Redo className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Editor content */}
      <div className="p-4 min-h-[400px] bg-white dark:bg-gray-800">
        <EditorContent 
          editor={editor} 
          className="prose prose-lg dark:prose-invert max-w-none focus:outline-none"
        />
      </div>
    </div>
  );
}