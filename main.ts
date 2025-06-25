import Alpine from 'alpinejs'

declare global {
    interface Window {
        Alpine: typeof Alpine
    }
}

window.Alpine = Alpine
Alpine.start()



const currentStyle: { [key: string]: any } = {
    'text-decoration': 'none',
    'font-weight': "normal",
    'font-style': "normal",
    'list-style-type': 'none',
    'font-size': "16px",
    'color': 'black',
    'text-align': 'left',
    'font-family': 'Arial'
}

function splitNode(node: HTMLElement, start: number, end: number) {
    let text = node.textContent ?? ""
    if (start == 0 && end == text.length) {
        return node
    }
    if (start == 0) {
        let clone = node.cloneNode(true) as HTMLElement
        clone.textContent = text.substring(start, end)
        node.textContent = text.substring(end)
        node.parentElement?.insertBefore(clone, node)
        return clone
    } else if (end == text.length) {
        let clone = node.cloneNode(true) as HTMLElement
        clone.textContent = text.substring(start)
        node.textContent = text.substring(0, start)
        node.parentElement?.insertBefore(clone, node.nextSibling)
        return clone
    } else {
        let clone1 = node.cloneNode(true)
        let clone2 = node.cloneNode(true)
        clone1.textContent = text.substring(0, start)
        node.textContent = text.substring(start, end)
        clone2.textContent = text.substring(end)
        node.parentElement?.insertBefore(clone1, node)
        node.parentElement?.insertBefore(clone2, node.nextSibling)
        return node
    }
}

export function setStyle(style: string, value: string) {
    currentStyle[style] = value

    let selection = window.getSelection()
    if (selection == null || selection.rangeCount == 0) return
    let range = selection.getRangeAt(0)
    let start = range.startContainer.parentElement as HTMLElement
    let end = range.endContainer.parentElement as HTMLElement
    if (start.tagName != 'SPAN' || end.tagName != 'SPAN') return

    if (start == end) {
        splitNode(start, range.startOffset, range.endOffset).style.setProperty(style, value)
        return
    }
    start = splitNode(start, range.startOffset, start.textContent?.length ?? 0)
    end = splitNode(end, 0, range.endOffset)

    while (start != end && start) {
        start.style.setProperty(style, value)
        if (start.nextSibling) {
            start = start.nextSibling as HTMLElement
        }else{
            start = start.parentElement?.nextSibling?.firstChild as HTMLElement
        }
    }
    end.style.setProperty(style, value)
}
(window as any).setStyle = setStyle

export function setLineStyle(style: string, value: string) {
    currentStyle[style] = value

    let selection = window.getSelection()
    if (selection == null) return
    let node = selection?.anchorNode?.parentElement as HTMLElement
    if (node == null) return

    if (node.tagName == 'SPAN') {
        node = node.parentElement as HTMLElement
    }

    if (node.tagName == 'P') {
        node.style.setProperty(style, value)
        if(style == 'list-style-type'){
            node.setAttribute('data-list', value)
        }
    }
}
(window as any).setLineStyle = setLineStyle

function createParagraph(editor: HTMLElement, text: string = "") {
    let p = document.createElement("p")
    p.style.setProperty("text-align", currentStyle['text-align'])
    p.style.setProperty("list-style-type", currentStyle['list-style-type'])
    p.setAttribute("data-list", currentStyle['list-style-type'])
    let span = document.createElement("span")
    span.style.setProperty("color", currentStyle['color'])
    span.style.setProperty("font-family", currentStyle['font-family'])
    span.style.setProperty("font-size", currentStyle['font-size'])
    span.style.setProperty("font-style", currentStyle['font-style'])
    span.style.setProperty("font-weight", currentStyle['font-weight'])
    span.style.setProperty("text-decoration", currentStyle['text-decoration'])
    span.textContent = text
    p.appendChild(span)
    editor.appendChild(p)
    return p
}

function editorInit() {
    let editor = document.getElementById("editor");
    if (editor == null) return

    editor.innerHTML = ''

    editor.addEventListener("keydown", (e) => {
        let selection = window.getSelection()
        if (selection == null) return
        let node = selection.anchorNode
        if (node == null) return

        if (node == editor) {
            const isPrintable = e.key.length === 1 && !e.ctrlKey && !e.metaKey;
            if (isPrintable) {
                node = createParagraph(editor, e.key)
                selection.setPosition(node.childNodes[0], 1)
            }
            else if (e.key == 'Enter') {
                node = createParagraph(editor)
            }
            e.preventDefault()
            e.stopPropagation()
            return
        } else if ((node as HTMLElement).tagName == 'p') {
            const isPrintable = e.key.length === 1 && !e.ctrlKey && !e.metaKey;
            if (isPrintable) {
                if (selection.anchorOffset == 0) {
                    node = node.childNodes[0]
                    node.textContent = e.key + node.textContent
                } else {
                    node = node.childNodes[node.childNodes.length - 1]
                    node.textContent += e.key
                }
                e.preventDefault()
                e.stopPropagation()
            }
            return
        }
    })
}

editorInit()