import { useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import DOMPurify from "dompurify"

// Register the hook with proper type annotations
DOMPurify.addHook("uponSanitizeAttribute", (node: Element, data: any) => {
  if (data.attrName === "style" && node.nodeName === "IMG") {
    let style = node.getAttribute("style") || ""
    if (!/max-width\s*:/i.test(style)) {
      style += " max-width: 400px;"
    } else {
      style = style.replace(/max-width\s*:\s*[^;]+;?/i, "max-width: 400px;")
    }
    node.setAttribute("style", style.trim())
  }
})

// Sanityzacja z wymuszeniem max-width: 400px dla IMG
const sanitizeWithMaxWidth = (dirtyHtml: string) => {
  return DOMPurify.sanitize(dirtyHtml, {
    ADD_ATTR: ["style"],
  })
}

export function SimpleEditor({
  value,
  onChange,
}: {
  value: string
  onChange: (val: string) => void
}) {
  const editorRef = useRef<HTMLDivElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value
    }
  }, [value])

  const execCommand = (command: string, val?: string) => {
    if (editorRef.current) {
      editorRef.current.focus()
    }
    document.execCommand(command, false, val)
    onChange(sanitizeWithMaxWidth(editorRef.current?.innerHTML || ""))
  }

  const handleInput = () => {
    onChange(sanitizeWithMaxWidth(editorRef.current?.innerHTML || ""))
  }

  const handleInsertImageClick = () => {
    imageInputRef.current?.click()
  }

  const handleInsertImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) {
      toast({
        title: "Nieprawidłowy plik",
        description: "Obraz musi mieć mniej niż 5MB",
        variant: "destructive",
      })
      return
    }

    const formData = new FormData()
    formData.append("file", file)

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!res.ok) throw new Error("Nie udało się przesłać obrazu")

      const data = await res.json()
      const imgHtml = `<img src="${data.url}" style="margin: 10px 0;" />`

      insertHtmlAtCursor(imgHtml)
      onChange(sanitizeWithMaxWidth(editorRef.current?.innerHTML || ""))
    } catch (err) {
      toast({
        title: "Błąd przesyłania",
        description: "Wystąpił problem z dodaniem zdjęcia",
        variant: "destructive",
      })
    } finally {
      e.target.value = ""
    }
  }

  const insertHtmlAtCursor = (html: string) => {
    const sel = window.getSelection()
    if (!sel || sel.rangeCount === 0) return

    const range = sel.getRangeAt(0)
    range.deleteContents()

    const fragment = range.createContextualFragment(html)
    range.insertNode(fragment)

    range.collapse(false)
    sel.removeAllRanges()
    sel.addRange(range)
  }

  return (
    <div className="space-y-2 border rounded-xl p-4">
      <div className="flex gap-2 flex-wrap">
        <button type="button" className="editor-button" onClick={() => execCommand("bold")}>B</button>
        <button type="button" className="editor-button" onClick={() => execCommand("italic")}>I</button>
        <button type="button" className="editor-button" onClick={() => execCommand("createLink", prompt("Podaj URL:") || "")}>🔗 Link</button>
        <button type="button" className="editor-button" onClick={() => execCommand("fontSize", "7")}>Nagłówek</button>
        <button type="button" className="editor-button" onClick={() => execCommand("fontSize", "5")}>Mały nagłówek</button>
        <button type="button" className="editor-button" onClick={() => execCommand("fontSize", "3")}>Tekst</button>
        <button type="button" className="editor-button" onClick={handleInsertImageClick}>🖼️ Obraz</button>
        <input
          type="file"
          accept="image/*"
          ref={imageInputRef}
          className="hidden"
          onChange={handleInsertImage}
        />
      </div>

      <div
        ref={editorRef}
        contentEditable
        dir="ltr"
        className="min-h-[150px] p-2 rounded-md border bg-background focus:outline-none prose max-w-full text-left"
        onInput={handleInput}
      />
    </div>
  )
}
