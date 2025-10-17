"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import CharacterCount from "@tiptap/extension-character-count"
import Image from "@tiptap/extension-image"
import Link from "@tiptap/extension-link"
import Placeholder from "@tiptap/extension-placeholder"
import { CodeBlockLowlight } from "@tiptap/extension-code-block-lowlight"
import { Table } from "@tiptap/extension-table"
import { TableRow } from "@tiptap/extension-table-row"
import { TableHeader } from "@tiptap/extension-table-header"
import { TableCell } from "@tiptap/extension-table-cell"
import { createLowlight, all } from "lowlight"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

// Create lowlight instance
const lowlight = createLowlight(all)
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Link as LinkIcon,
  Image as ImageIcon,
  Type,
  Heading1,
  Heading2,
  Heading3,
  Code,
  Table as TableIcon,
  Table2,
  Plus,
  Minus,
} from "lucide-react"
import { useState } from "react"

interface RichTextEditorProps {
  content?: string
  onChange?: (content: string) => void
  placeholder?: string
  maxLength?: number
  className?: string
}

export function RichTextEditor({
  content = "",
  onChange,
  placeholder = "Start writing...",
  maxLength = 50000,
  className = "",
}: RichTextEditorProps) {
  const [linkUrl, setLinkUrl] = useState("")

  const editor = useEditor({
    extensions: [
      StarterKit,
      CharacterCount.configure({
        limit: maxLength,
      }),
      Image.configure({
        HTMLAttributes: {
          class: "max-w-full h-auto rounded-lg",
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-600 underline cursor-pointer",
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[200px] p-4",
      },
    },
    immediatelyRender: false,
  })

  if (!editor) {
    return null
  }

  const addImage = () => {
    const url = window.prompt("Enter image URL:")
    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }

  const setLink = () => {
    const url = window.prompt("Enter URL:")
    if (url) {
      editor.chain().focus().setLink({ href: url }).run()
    }
  }

  const ToolbarButton = ({ 
    onClick, 
    isActive = false, 
    disabled = false, 
    children 
  }: {
    onClick: () => void
    isActive?: boolean
    disabled?: boolean
    children: React.ReactNode
  }) => (
    <Button
      type="button"
      variant={isActive ? "default" : "ghost"}
      size="sm"
      onClick={onClick}
      disabled={disabled}
      className="h-8 w-8 p-0"
    >
      {children}
    </Button>
  )

  return (
    <div className={`border rounded-lg ${className}`}>
      {/* Toolbar */}
      <div className="border-b p-2 flex flex-wrap items-center gap-1">
        <div className="flex items-center gap-1">
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
          >
            <Undo className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
          >
            <Redo className="w-4 h-4" />
          </ToolbarButton>
        </div>

        <Separator orientation="vertical" className="h-6" />

        <div className="flex items-center gap-1">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive("bold")}
          >
            <Bold className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive("italic")}
          >
            <Italic className="w-4 h-4" />
          </ToolbarButton>
        </div>

        <Separator orientation="vertical" className="h-6" />

        <div className="flex items-center gap-1">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            isActive={editor.isActive("heading", { level: 1 })}
          >
            <Heading1 className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            isActive={editor.isActive("heading", { level: 2 })}
          >
            <Heading2 className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            isActive={editor.isActive("heading", { level: 3 })}
          >
            <Heading3 className="w-4 h-4" />
          </ToolbarButton>
        </div>

        <Separator orientation="vertical" className="h-6" />

        <div className="flex items-center gap-1">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive("bulletList")}
          >
            <List className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive("orderedList")}
          >
            <ListOrdered className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive("blockquote")}
          >
            <Quote className="w-4 h-4" />
          </ToolbarButton>
        </div>

        <Separator orientation="vertical" className="h-6" />

        <div className="flex items-center gap-1">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            isActive={editor.isActive("codeBlock")}
          >
            <Code className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton onClick={setLink}>
            <LinkIcon className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton onClick={addImage}>
            <ImageIcon className="w-4 h-4" />
          </ToolbarButton>
        </div>

        <Separator orientation="vertical" className="h-6" />

        <div className="flex items-center gap-1">
          <ToolbarButton
            onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
          >
            <TableIcon className="w-4 h-4" />
          </ToolbarButton>
          {editor.isActive("table") && (
            <>
              <ToolbarButton
                onClick={() => editor.chain().focus().addColumnBefore().run()}
                disabled={!editor.can().addColumnBefore()}
              >
                <Plus className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().deleteColumn().run()}
                disabled={!editor.can().deleteColumn()}
              >
                <Minus className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().addRowBefore().run()}
                disabled={!editor.can().addRowBefore()}
              >
                <Plus className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().deleteRow().run()}
                disabled={!editor.can().deleteRow()}
              >
                <Minus className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().deleteTable().run()}
                disabled={!editor.can().deleteTable()}
              >
                <Table2 className="w-4 h-4" />
              </ToolbarButton>
            </>
          )}
        </div>
      </div>

      {/* Editor Content */}
      <div className="min-h-[300px]">
        <EditorContent editor={editor} />
      </div>

      {/* Footer */}
      <div className="border-t p-2 flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>
            {editor.storage.characterCount.characters()}/{maxLength} characters
          </span>
          <span>
            {editor.storage.characterCount.words()} words
          </span>
        </div>
        <div>
          {editor.storage.characterCount.characters() > maxLength * 0.9 && (
            <span className="text-orange-500">
              Approaching character limit
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
