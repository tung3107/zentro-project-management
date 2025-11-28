import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { createEditor, Transforms, Editor, Range, Element as SlateElement } from 'slate'
import type { Descendant, BaseEditor } from 'slate'
import { Slate, Editable, withReact } from 'slate-react'
import type { ReactEditor, RenderElementProps, RenderLeafProps } from 'slate-react'
import { AtSign, Bookmark, Hash, Send, X, Loader2 } from 'lucide-react'
import api from '../../../../util/axiosClient'
import Avatar from '../../../../components/Avatar'
import { type } from '../../../../types/type'
import type { User } from '../../../../types/user'
import type { Task } from '../../../../types/task'
import { updateComment } from '../../service/comment.service'

type CustomElement = { type: 'paragraph'; children: CustomText[] } | MentionElement | TaskMentionElement
type CustomText = { text: string }
type MentionElement = { type: 'mention'; user_id: string; name: string; children: CustomText[] }
type TaskMentionElement = {
  type: 'taskMention'
  task_id: string | number
  title: string
  children: CustomText[]
  task_type: string
}

declare module 'slate' {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor
    Element: CustomElement
    Text: CustomText
  }
}

interface CommentEditorProps {
  placeholder?: string
  onSubmit?: (content: string) => void
  projectId: string
  initialContent?: string
  commentId?: number
  onCancel?: () => void
}

// Custom plugin to handle mentions
const withMentions = (editor: BaseEditor & ReactEditor) => {
  const { isInline, isVoid } = editor

  editor.isInline = (element) => {
    return element.type === 'mention' || element.type === 'taskMention' ? true : isInline(element)
  }

  editor.isVoid = (element) => {
    return element.type === 'mention' || element.type === 'taskMention' ? true : isVoid(element)
  }

  return editor
}

// Render custom elements
const Element = ({ attributes, children, element }: RenderElementProps) => {
  switch (element.type) {
    case 'mention':
      return (
        <span
          {...attributes}
          contentEditable={false}
          className='inline-flex items-center gap-1 px-1.5 py-0.5 mx-0.5 bg-blue-100 text-blue-700 rounded text-sm font-medium'
          data-user={element.user_id}
        >
          <AtSign size={12} />
          {element.name}
          {children}
        </span>
      )
    case 'taskMention': {
      const taskType = type.find((t) => t.value === (element as any).task_type)
      const icon = taskType?.icon || <Bookmark size={12} color='#888' />
      return (
        <span
          {...attributes}
          contentEditable={false}
          className='inline-block align-middle items-center gap-1 px-1.5 py-0.5 mx-[2px] bg-purple-100 text-purple-700 rounded text-sm font-medium'
          data-task-id={element.task_id}
        >
          {icon}
          {element.title}
          {children}
        </span>
      )
    }
    default:
      return (
        <p {...attributes} className='m-0 p-0'>
          {children}
        </p>
      )
  }
}

const Leaf = ({ attributes, children }: RenderLeafProps) => {
  return <span {...attributes}>{children}</span>
}

export default function CommentEditor({
  placeholder,
  onSubmit,
  projectId,
  initialContent,
  commentId,
  onCancel
}: CommentEditorProps) {
  const [editor] = useState(() => withMentions(withReact(createEditor())))
  const [suggestType, setSuggestType] = useState<'user' | 'task' | null>(null)
  const [filteredList, setFilteredList] = useState<User[] | Task[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number } | null>(null)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const editorRef = useRef<HTMLDivElement>(null)
  const [isReady, setIsReady] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEditMode = !!commentId

  const initialValue: Descendant[] = useMemo(() => {
    return [{ type: 'paragraph', children: [{ text: initialContent ? initialContent.replace(/<[^>]*>/g, '') : '' }] }]
  }, [])

  // Initialize editor safely
  useEffect(() => {
    // Reset editor content
    Transforms.select(editor, Editor.start(editor, []))
    setIsReady(true)
  }, [editor, initialValue])

  // Search functions
  const searchUsers = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        setFilteredList([])
        return
      }
      try {
        setIsLoading(true)
        const res = await api.get(`/members/search/${projectId}?q=${encodeURIComponent(query)}`)
        setFilteredList(res.data.data.map((m: any) => m.user))
      } catch {
        setFilteredList([])
      } finally {
        setIsLoading(false)
      }
    },
    [projectId]
  )

  const searchTasks = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        setFilteredList([])
        return
      }
      try {
        setIsLoading(true)
        const res = await api.get(`/tasks/search/mention/${projectId}?q=${encodeURIComponent(query)}`)
        setFilteredList(res.data.data)
      } catch {
        setFilteredList([])
      } finally {
        setIsLoading(false)
      }
    },
    [projectId]
  )

  // Handle onChange - detect @ or # for mentions
  const handleChange = useCallback(
    (value: Descendant[]) => {
      if (!isReady) return // tránh lỗi khi editor chưa sẵn sàng

      const { selection } = editor
      if (!selection || !Range.isCollapsed(selection)) {
        setSuggestType(null)
        setFilteredList([])
        return
      }

      const [start] = Range.edges(selection)
      const wordBefore = Editor.before(editor, start, { unit: 'word' })
      const before = wordBefore && Editor.before(editor, wordBefore)
      const beforeRange = before && Editor.range(editor, before, start)
      const beforeText = beforeRange && Editor.string(editor, beforeRange)

      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)

      const userMatch = beforeText?.match(/@([A-Za-z0-9_\s]*)$/)
      const taskMatch = beforeText?.match(/#([A-Za-z0-9_\-\s]*)$/)

      // Calculate dropdown position
      if (editorRef.current && (userMatch || taskMatch)) {
        const domSelection = window.getSelection()
        if (domSelection && domSelection.rangeCount > 0) {
          const domRange = domSelection.getRangeAt(0)
          const rect = domRange.getBoundingClientRect()
          const editorRect = editorRef.current.getBoundingClientRect()
          setDropdownPosition({
            top: rect.bottom - editorRect.top + 5,
            left: rect.left - editorRect.left
          })
        }
      }

      if (userMatch) {
        const keyword = userMatch[1]
        setSuggestType('user')
        setSelectedIndex(0)
        searchTimeoutRef.current = setTimeout(() => searchUsers(keyword), 300)
      } else if (taskMatch) {
        const keyword = taskMatch[1]
        setSuggestType('task')
        setSelectedIndex(0)
        searchTimeoutRef.current = setTimeout(() => searchTasks(keyword), 300)
      } else {
        setSuggestType(null)
        setFilteredList([])
        setDropdownPosition(null)
      }
    },
    [editor, searchUsers, searchTasks, isReady]
  )

  // Insert mention
  const insertMention = useCallback(
    (item: User | Task) => {
      if (!suggestType) return

      const { selection } = editor
      if (!selection) return

      // 1. Xác định word trước cursor
      const [start] = Range.edges(selection)
      const wordBefore = Editor.before(editor, start, { unit: 'word' })
      const before = wordBefore && Editor.before(editor, wordBefore)
      const beforeRange = before ? Editor.range(editor, before, start) : undefined
      const beforeText = beforeRange ? Editor.string(editor, beforeRange) : ''

      // 2. Tìm vị trí trigger
      let triggerRange
      if (suggestType === 'user') {
        const match = beforeText.match(/@[\w\s]*$/)
        if (match) {
          const offset = match[0].length
          triggerRange = Editor.range(editor, Editor.before(editor, start, { distance: offset })!, start)
        }
      } else if (suggestType === 'task') {
        const match = beforeText.match(/#[\w\s\-]*$/)
        if (match) {
          const offset = match[0].length
          triggerRange = Editor.range(editor, Editor.before(editor, start, { distance: offset })!, start)
        }
      }

      // 3. Xóa trigger text
      if (triggerRange) {
        Transforms.delete(editor, { at: triggerRange })
      }

      // 4. Insert mention node
      if (suggestType === 'user') {
        const user = item as User
        const mention: MentionElement = {
          type: 'mention',
          user_id: user.user_id,
          name: `${user.first_name} ${user.last_name}`,
          children: [{ text: '' }]
        }
        Transforms.insertNodes(editor, mention)
        Transforms.move(editor)
      } else if (suggestType === 'task') {
        const task = item as Task
        const taskMention: TaskMentionElement = {
          type: 'taskMention',
          task_id: task.task_id,
          title: task.title,
          task_type: task.type,
          children: [{ text: '' }]
        }
        Transforms.insertNodes(editor, taskMention as any)
        Transforms.move(editor)
      }

      setSuggestType(null)
      setFilteredList([])
      setDropdownPosition(null)
      setSelectedIndex(0)
    },
    [editor, suggestType]
  )

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (!suggestType || filteredList.length === 0) return

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault()
          setSelectedIndex((prev) => (prev < filteredList.length - 1 ? prev + 1 : prev))
          break
        case 'ArrowUp':
          event.preventDefault()
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0))
          break
        case 'Enter':
          event.preventDefault()
          if (filteredList[selectedIndex]) {
            insertMention(filteredList[selectedIndex])
          }
          break
        case 'Escape':
          event.preventDefault()
          setSuggestType(null)
          setFilteredList([])
          setDropdownPosition(null)
          break
      }
    },
    [suggestType, filteredList, selectedIndex, insertMention]
  )

  // Serialize to HTML for submission
  const serializeToHTML = (nodes: Descendant[]): string => {
    return nodes
      .map((node) => {
        if (SlateElement.isElement(node)) {
          if (node.type === 'mention') {
            return `<span class="mention user-mention" data-user="${node.user_id}">@${node.name}</span>`
          }
          if (node.type === 'taskMention') {
            return `<span class="mention task-mention" data-task-id="${node.task_id}">#${node.title}</span>`
          }
          return serializeToHTML(node.children)
        }
        return node.text
      })
      .join('')
  }

  const handleSubmit = async () => {
    const html = serializeToHTML(editor.children)
    if (!html.trim()) return

    try {
      setIsSubmitting(true)

      if (isEditMode && commentId) {
        await updateComment(commentId, html)
        onSubmit?.(html)
      } else {
        onSubmit?.(html)
      }

      if (!isEditMode) {
        Transforms.delete(editor, { at: [] })
        Transforms.insertNodes(editor, [{ type: 'paragraph', children: [{ text: '' }] }])
        Transforms.select(editor, Editor.start(editor, []))
      }
    } catch (error) {
      console.error('Error submitting comment:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Check if editor has content (including mentions)
  const hasContent = useMemo(() => {
    if (!isReady || !editor.children || editor.children.length === 0) return false

    // Check first node
    const firstNode = editor.children[0] as any
    if (!firstNode || !firstNode.children || firstNode.children.length === 0) return false

    // Has content if there's any mention or any non-empty text
    return firstNode.children.some((child: any) => {
      return child.type === 'mention' || child.type === 'taskMention' || (child.text && child.text.trim())
    })
  }, [editor.children, isReady])

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
    }
  }, [])

  return (
    <div className='relative' style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
      <div
        ref={editorRef}
        className='border border-gray-300 rounded-lg hover:border-gray-400 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all bg-white'
      >
        <Slate editor={editor} initialValue={initialValue} onChange={handleChange}>
          <div className='relative'>
            <Editable
              renderElement={Element}
              renderLeaf={Leaf}
              onKeyDown={handleKeyDown}
              className='w-full min-h-[42px] max-h-[300px] p-3 text-sm text-gray-900 focus:outline-none transition-all duration-150'
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                resize: 'none',
                overflowY: 'auto'
              }}
            />

            {/* Custom placeholder */}
            {!hasContent && (
              <div
                className='absolute left-3 top-3 text-gray-400 pointer-events-none select-none text-sm'
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {placeholder || 'Viết bình luận... Sử dụng @ để tag người hoặc # để tag task'}
              </div>
            )}
          </div>
        </Slate>
      </div>

      {/* Mention Dropdown */}
      {suggestType && dropdownPosition && (
        <div
          className='absolute z-[9999] bg-white border border-gray-200 rounded-lg shadow-xl w-80 max-h-64 overflow-y-auto'
          style={{ top: dropdownPosition.top, left: dropdownPosition.left }}
        >
          {isLoading ? (
            <div className='p-4 text-center text-gray-400 text-sm'>Đang tìm kiếm...</div>
          ) : filteredList.length > 0 ? (
            <div className='py-1'>
              {filteredList.map((item, i) => {
                const isSelected = i === selectedIndex
                return (
                  <div
                    key={suggestType === 'user' ? (item as User).user_id : (item as Task).task_id}
                    className={`px-3 py-2 cursor-pointer transition-colors ${
                      isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                    onMouseEnter={() => setSelectedIndex(i)}
                    onClick={() => insertMention(item)}
                  >
                    {suggestType === 'user' ? (
                      <div className='flex items-center gap-3'>
                        <Avatar
                          name={`${(item as User).first_name} ${(item as User).last_name}`}
                          size={36}
                          avatarUrl={(item as User).avatar}
                        />
                        <div className='flex-1 min-w-0'>
                          <div className='text-sm font-medium text-gray-900 truncate'>
                            {(item as User).first_name} {(item as User).last_name}
                          </div>
                          <div className='text-xs text-gray-500 truncate'>
                            {(item as User).user_id} • {(item as User).email}
                          </div>
                        </div>
                        <AtSign size={14} className='text-gray-400 flex-shrink-0' />
                      </div>
                    ) : (
                      <div className='flex items-center gap-2'>
                        {(() => {
                          const taskItem = item as Task
                          const taskType = type.find((t) => t.value === taskItem.type)
                          return (
                            <>
                              <div className='flex items-center gap-2 flex-shrink-0'>
                                {taskType?.icon || <Hash size={14} className='text-purple-600' />}
                                {taskItem.status?.color && (
                                  <div
                                    className='w-2.5 h-2.5 rounded-full'
                                    style={{ backgroundColor: taskItem.status.color }}
                                  />
                                )}
                              </div>
                              <div className='flex-1 min-w-0'>
                                <div className='flex items-center gap-2'>
                                  <span className='text-sm font-medium text-gray-900'>{taskItem.task_id}</span>
                                  <span className='text-sm text-gray-600 truncate'>{taskItem.title}</span>
                                </div>
                              </div>
                            </>
                          )
                        })()}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className='p-4 text-center text-gray-400 text-sm'>
              Không tìm thấy {suggestType === 'user' ? 'người dùng' : 'task'}
            </div>
          )}
        </div>
      )}

      {/* Submit Button */}
      <div className='flex justify-end gap-2 mt-3'>
        {isEditMode && onCancel && (
          <button
            onClick={onCancel}
            disabled={isSubmitting}
            className='flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm font-medium transition-colors shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed'
          >
            <X size={16} />
            Hủy
          </button>
        )}
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className='flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed'
        >
          {isSubmitting ? (
            <>
              <Loader2 size={16} className='animate-spin' />
              Đang gửi...
            </>
          ) : (
            <>
              <Send size={16} />
              {isEditMode ? 'Cập nhật' : 'Gửi'}
            </>
          )}
        </button>
      </div>
    </div>
  )
}
