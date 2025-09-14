import { useState } from 'react'
import axios from 'axios'
import './App.css'

function App() {
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [chatMessages, setChatMessages] = useState([])
  const [flashcards, setFlashcards] = useState([])
  const [currentMessage, setCurrentMessage] = useState('')

  const courses = [
    { name: 'Introduction to Python Programming', code: 'ENGR1330' },
    { name: 'Introduction to Texas Government', code: 'POLS2306' }
  ]

  // Flashcard component
  const Flashcard = ({ front, back }) => {
    const [flipped, setFlipped] = useState(false)
    return (
      <div className={`flashcard ${flipped ? 'flipped' : ''}`} onClick={() => setFlipped(!flipped)}>
        {flipped ? <div className="back">{back}</div> : <div className="front">{front}</div>}
      </div>
    )
  }

  const handleCourseSelect = (course) => {
    setSelectedCourse(course)
    setChatMessages([{
      id: 1,
      text: `Great! I can help you with ${course.name} concepts. What would you like to learn about?`,
      isBot: true
    }])
    setFlashcards([])
  }

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || !selectedCourse) return

    const messageToSend = currentMessage
    setChatMessages([...chatMessages, { id: chatMessages.length + 1, text: currentMessage, isBot: false }])
    setCurrentMessage('')

    try {
      const res = await axios.post(
        `http://127.0.0.1:5000/course/${encodeURIComponent(selectedCourse.code)}/chat`,
        { message: messageToSend }
      )

      setChatMessages(prev => [
        ...prev,
        { id: prev.length + 1, text: res.data.chat_response || "No response", isBot: true }
      ])

      // Append the new flashcard returned by backend
      if (res.data.flashcards) {
        setFlashcards(prev => [...prev, ...res.data.flashcards])
      }

    } catch (err) {
      console.error(err)
      setChatMessages(prev => [
        ...prev,
        { id: prev.length + 1, text: "⚠️ Error contacting AI backend", isBot: true }
      ])
    }
  }

  return (
    <div className="app">
      <header className="header">
        <h1>TTU AI Learning Bot</h1>
        <p>Choose a course to get started</p>
      </header>

      {!selectedCourse ? (
        <div className="course-selection">
          <h2>Which course can I help you with?</h2>
          <div className="course-grid">
            {courses.map((course, idx) => (
              <button key={idx} className="course-card" onClick={() => handleCourseSelect(course)}>
                <h3>{course.code}</h3>
                <p>{course.name}</p>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="chat-container">
          <div className="chat-header">
            <h2>{selectedCourse.name} Learning Assistant</h2>
            <button className="back-button" onClick={() => {
              setSelectedCourse(null)
              setChatMessages([])
              setFlashcards([])
            }}>Back to Courses</button>
          </div>

          <div className="chat-messages">
            {chatMessages.map(msg => (
              <div key={msg.id} className={`message ${msg.isBot ? 'bot' : 'user'}`}>
                {msg.text}
              </div>
            ))}
          </div>

          <div className="chat-input">
            <input
              type="text"
              placeholder="Type your question here..."
              value={currentMessage}
              onChange={e => setCurrentMessage(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
            />
            <button onClick={handleSendMessage}>Send</button>
          </div>

          {flashcards.length > 0 && (
            <div className="flashcards-container">
              <h3>Flashcards</h3>
              <div className="flashcard-grid">
                {flashcards.map((fc, idx) => (
                  <Flashcard key={idx} front={fc.front} back={fc.back} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default App
