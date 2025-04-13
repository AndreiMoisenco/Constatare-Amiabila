"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, ArrowRight } from "lucide-react"

// Define the questions in Romanian
const questions = [
  {
    id: 1,
    text: "Unde te aflai în momentul accidentului?",
    type: "radio",
    options: ["Eram parcat", "Nu eram în vehicul", "Tocmai porneam sau deschideam ușa", "Eram oprit"],
  },
  {
    id: 2,
    text: "Te aflai într-o zonă specială sau făceai o manevră?",
    type: "radio",
    options: [
      "Intrasem într-o parcare / drum privat",
      "Ieșeam dintr-o parcare / drum privat",
      "Intrasem într-un sens giratoriu",
      "Ieșeam dintr-un sens giratoriu",
      "Executam o manevră (viraj, preselectare bandă, întoarcere)",
      "Mergeam cu spatele",
      "Instruire auto (eram în timpul unei lecții de condus)",
    ],
  },
  {
    id: 3,
    text: "Ce se întâmpla pe drum?",
    type: "radio",
    options: [
      "Mă aflam pe aceeași bandă ca celălalt vehicul",
      "Mă aflam pe o bandă diferită, dar în același sens",
      "Schimbam banda de circulație",
      "Am trecut pe banda cu sens opus",
      "Depășeam un alt vehicul",
    ],
  },
  {
    id: 4,
    text: "Ai virat în momentul impactului?",
    type: "radio",
    options: ["Da, viram la dreapta", "Da, viram la stânga", "Nu"],
  },
  {
    id: 5,
    text: "Ce tip de intersecție era? Ai respectat semnele?",
    type: "radio",
    options: [
      "Nu am acordat prioritate",
      "Veneam din dreapta (într-o intersecție)",
      "Oprisem la semafor sau la semnalul polițistului",
      "Nu era o intersecție",
    ],
  },
  {
    id: 6,
    text: "Vrei să ne spui altceva relevant?",
    type: "textarea",
    placeholder: "Descrie situația...",
  },
  {
    id: 7,
    text: "Recunoști nevinovăția?",
    type: "radio",
    options: ["Da", "Nu"],
  },
]

export default function Questionnaire() {
  const [currentAnswer, setCurrentAnswer] = useState<string>("")
  const [answers, setAnswers] = useState<{ [key: number]: string }>({})
  const router = useRouter()
  const searchParams = useSearchParams()
  const [userRole, setUserRole] = useState<string>("")

  const currentStep = Number.parseInt(searchParams.get("step") || "1")
  const totalSteps = questions.length

  const currentQuestion = questions[currentStep - 1]
  const progress = (currentStep / totalSteps) * 100

  useEffect(() => {
    // Obținem rolul utilizatorului
    if (typeof window !== "undefined") {
      setUserRole(localStorage.getItem("userRole") || "")
    }

    // Încărcăm răspunsul salvat pentru întrebarea curentă, dacă există
    if (answers[currentStep]) {
      setCurrentAnswer(answers[currentStep])
    } else {
      setCurrentAnswer("")
    }
  }, [currentStep, answers])

  const handleNextQuestion = () => {
    // Salvăm răspunsul curent
    setAnswers((prev) => ({ ...prev, [currentStep]: currentAnswer }))

    if (currentStep < totalSteps) {
      // Go to next question
      router.push(`/questionnaire?step=${currentStep + 1}`)
    } else {
      // Completed all questions - navigăm în funcție de rol
      if (userRole === "victima") {
        router.push(`/completion`)
      } else if (userRole === "vinovat") {
        router.push(`/photo-review`)
      } else {
        router.push(`/completion`)
      }
    }
  }

  const handlePreviousQuestion = () => {
    if (currentStep > 1) {
      router.push(`/questionnaire?step=${currentStep - 1}`)
    }
  }

  const renderQuestionInput = () => {
    switch (currentQuestion.type) {
      case "radio":
        return (
          <div className="radio-group">
            {currentQuestion.options?.map((option) => (
              <label
                key={option}
                className={`radio-option ${currentAnswer === option ? "selected" : ""}`}
                onClick={() => setCurrentAnswer(option)}
              >
                <input
                  type="radio"
                  name="question"
                  value={option}
                  checked={currentAnswer === option}
                  onChange={() => {}}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        )

      case "textarea":
        return (
          <textarea
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            placeholder={currentQuestion.placeholder}
            className="textarea"
          />
        )

      default:
        return null
    }
  }

  return (
    <div className="flex h-full items-center justify-center">
      <div className="card">
        <div className="progress-bar">
          <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
        </div>

        <div className="text-center mb-2">
          <span className="text-sm font-medium text-gray">
            Întrebarea {currentStep} din {totalSteps}
          </span>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4">{currentQuestion.text}</h2>
          {renderQuestionInput()}
        </div>

        <div className="button-container">
          {currentStep > 1 && (
            <button
              className="btn btn-secondary flex-1 flex items-center justify-center gap-2"
              onClick={handlePreviousQuestion}
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Înapoi</span>
            </button>
          )}
          <button
            className="btn btn-primary flex-1 flex items-center justify-center gap-2"
            onClick={handleNextQuestion}
            disabled={currentQuestion.type !== "textarea" && currentAnswer === ""}
          >
            <span>{currentStep < totalSteps ? "Următoarea" : "Finalizare"}</span>
            {currentStep < totalSteps && <ArrowRight className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </div>
  )
}
