import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { useEffect, useCallback } from 'react'
import { marked } from 'marked'
import TurndownService from 'turndown'
import {
    Bold,
    Italic,
    List,
    ListOrdered,
    Quote,
    Heading1,
    Heading2,
    Undo,
    Redo
} from 'lucide-react'

// Configure marked
marked.setOptions({
    breaks: true, // Convert \n to <br>
    gfm: true
})

// Configure turndown
const turndownService = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced'
})

interface RichTextEditorProps {
    content: string
    onChange: (content: string) => void
    onBlur?: () => void
    placeholder?: string
    editable?: boolean
}

export default function RichTextEditor({
    content,
    onChange,
    onBlur,
    placeholder = '請輸入內容...',
    editable = true
}: RichTextEditorProps) {
    // Helper to get raw text for comparison to avoid loops
    // But since we are converting formats, exact comparison is hard.
    // We'll trust the upstream to control updates or use a flag?
    // Actually, Tiptap handles `setContent` efficiently if DOM matches.

    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder,
            }),
        ],
        // Initial content needs to be parsed
        content: content ? marked.parse(content) : '',
        editable,
        immediatelyRender: false,
        onUpdate: ({ editor }) => {
            // Convert HTML back to Markdown for storage/AI
            const html = editor.getHTML()
            const markdown = turndownService.turndown(html)
            onChange(markdown)
        },
        onBlur: ({ editor }) => {
            onBlur?.()
        },
        editorProps: {
            attributes: {
                class: 'prose prose-invert max-w-none focus:outline-none min-h-[50vh] px-6 py-4 text-white/90 text-sm leading-relaxed',
            },
        },
    })

    // Sync content from outside (e.g. AI streaming or initial load)
    useEffect(() => {
        if (!editor || content === undefined) return

        // We need to check if the new content is effectively the same as current to avoid cursor jumps
        // But comparing Markdown (content) with Editor State (HTML) is tricky.
        // During AI streaming, `content` keeps growing.
        // We SHOULD update the editor.

        // Simple heuristic: If we are focused and typing, we might conflict.
        // But `useAI` separates "generating" state.
        // If we are generating, we definitely want to update.
        // If user is typing, `onChange` updates `content` prop.

        // Let's try to convert current editor HTML to MD and compare?
        const currentMarkdown = turndownService.turndown(editor.getHTML())

        if (content !== currentMarkdown) {
            // Only update if different.
            // async parse? explicit string cast for typescript
            const html = marked.parse(content || '')

            // Check if only appending (streaming optimization)?
            // Tiptap `setContent` replaces all.
            // To optimize streaming, we could check if `content` starts with `currentMarkdown`
            // and only insert the remainder.
            // But for now, let's stick to setContent for correctness.

            // Cast to string because marked.parse can return Promise in some versions,
            // but with default sync options it returns string.
            editor.commands.setContent(html as string)
        }
    }, [content, editor])

    if (!editor) {
        return null
    }

    return (
        <div className="flex flex-col h-full bg-slate-950/20">
            {/* Toolbar */}
            {editable && (
                <div className="flex items-center gap-1 px-4 py-2 border-b border-white/10 bg-white/5 overflow-x-auto">
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        isActive={editor.isActive('bold')}
                        icon={<Bold size={16} />}
                        title="Bold"
                    />
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        isActive={editor.isActive('italic')}
                        icon={<Italic size={16} />}
                        title="Italic"
                    />
                    <div className="w-px h-4 bg-white/10 mx-2" />
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                        isActive={editor.isActive('heading', { level: 1 })}
                        icon={<Heading1 size={16} />}
                        title="Heading 1"
                    />
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                        isActive={editor.isActive('heading', { level: 2 })}
                        icon={<Heading2 size={16} />}
                        title="Heading 2"
                    />
                    <div className="w-px h-4 bg-white/10 mx-2" />
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        isActive={editor.isActive('bulletList')}
                        icon={<List size={16} />}
                        title="Bullet List"
                    />
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        isActive={editor.isActive('orderedList')}
                        icon={<ListOrdered size={16} />}
                        title="Ordered List"
                    />
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleBlockquote().run()}
                        isActive={editor.isActive('blockquote')}
                        icon={<Quote size={16} />}
                        title="Quote"
                    />
                    <div className="flex-1" />
                    <ToolbarButton
                        onClick={() => editor.chain().focus().undo().run()}
                        disabled={!editor.can().chain().focus().undo().run()}
                        icon={<Undo size={16} />}
                        title="Undo"
                    />
                    <ToolbarButton
                        onClick={() => editor.chain().focus().redo().run()}
                        disabled={!editor.can().chain().focus().redo().run()}
                        icon={<Redo size={16} />}
                        title="Redo"
                    />
                </div>
            )}

            {/* Editor Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <EditorContent editor={editor} />
            </div>

            <style jsx global>{`
                .ProseMirror p.is-editor-empty:first-child::before {
                    color: #adb5bd;
                    content: attr(data-placeholder);
                    float: left;
                    height: 0;
                    pointer-events: none;
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.2);
                }
            `}</style>
        </div>
    )
}

function ToolbarButton({ onClick, isActive, disabled, icon, title }: any) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            title={title}
            className={`p-2 rounded hover:bg-white/10 transition-colors ${isActive ? 'text-purple-400 bg-white/10' : 'text-white/70'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
            {icon}
        </button>
    )
}
