import { useState } from 'react'
import { Bot } from 'lucide-react'
import AIChatPanel from './AIChatPanel'

/**
 * Floating AI Assistant button that can be used in any view
 * Just drop this component anywhere in your page
 */
export default function AIFloatingButton() {
  const [showAIChat, setShowAIChat] = useState(false)

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setShowAIChat(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center z-40 group"
        title="AI Assistant"
      >
        <Bot size={24} className="group-hover:rotate-12 transition-transform" />
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping"></span>
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full"></span>
      </button>

      {/* AI Chat Panel */}
      <AIChatPanel isOpen={showAIChat} onClose={() => setShowAIChat(false)} />
    </>
  )
}
