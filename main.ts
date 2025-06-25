import Alpine from 'alpinejs'

declare global {
    interface Window {
        Alpine: typeof Alpine
    }
}

window.Alpine = Alpine
Alpine.store('style', {
    decoration: 'none',
    italic: false,
    bold: false,
    list: 'none',
    fontSize: 16,
    textColor: 'black',
    align: 'left',
    fontFamily: 'Arial',
})
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
        if (start == end) {
            if (node.previousSibling && node.previousSibling.textContent?.length == 0) {
                return node.previousSibling as HTMLElement
            }
        }
        let clone = node.cloneNode(true) as HTMLElement
        clone.textContent = text.substring(start, end)
        node.textContent = text.substring(end)
        node.parentElement?.insertBefore(clone, node)
        return clone
    } else if (end == text.length) {
        if (start == end) {
            if (node.nextSibling && node.nextSibling.textContent?.length == 0) {
                return node.nextSibling as HTMLElement
            }
        }
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
    if (selection == null) return
    if (selection.rangeCount > 0) {
        for (let i = 0; i < selection.rangeCount; i++) {
            let range = selection.getRangeAt(i)
            let start = range.startContainer.parentElement as HTMLElement
            let end = range.endContainer.parentElement as HTMLElement
            if (start.tagName != 'SPAN' || end.tagName != 'SPAN') continue

            if (start == end) {
                let node = splitNode(start, range.startOffset, range.endOffset)
                node.style.setProperty(style, value)
                if (node.textContent?.length) {
                    range.setStart(node.childNodes[0], 0)
                    range.setEnd(node.childNodes[0], (node.childNodes[0] as Text).length)
                } else {
                    range.setStart(node, 0)
                    range.setEnd(node, 0)
                }
            } else {
                start = splitNode(start, range.startOffset, start.textContent?.length ?? 0)
                end = splitNode(end, 0, range.endOffset)

                let current = start
                while (current != end && current) {
                    current.style.setProperty(style, value)
                    if (current.nextSibling) {
                        current = current.nextSibling as HTMLElement
                    } else {
                        current = current.parentElement?.nextSibling?.firstChild as HTMLElement
                    }
                }
                end.style.setProperty(style, value)
                if (start.textContent?.length) {
                    range.setStart(start.childNodes[0], 0)
                } else {
                    range.setStart(start, 0)
                }
                if (end.textContent?.length) {
                    range.setEnd(end.childNodes[0], (end.childNodes[0] as Text).length)
                } else {
                    range.setEnd(end, 0)
                }
            }
        }
    }
}
(window as any).setStyle = setStyle

export function setLineStyle(style: string, value: string) {
    currentStyle[style] = value

    let selection = window.getSelection()
    if (selection == null) return
    if (selection.rangeCount > 0) {
        for (let i = 0; i < selection.rangeCount; i++) {
            let range = selection.getRangeAt(i)
            let start = range.startContainer.parentElement as HTMLElement
            let end = range.endContainer.parentElement as HTMLElement
            if (start.tagName == 'SPAN') start = start.parentElement as HTMLElement
            if (end.tagName == 'SPAN') end = end.parentElement as HTMLElement

            if (start.tagName != 'P' || end.tagName != 'P') continue

            let current = start
            while (current) {
                current.style.setProperty(style, value)
                if (style == 'list-style-type') {
                    current.setAttribute('data-list', value)
                }
                if (current == end) break
                current = current.nextSibling as HTMLElement
            }
        }
    }
}
(window as any).setLineStyle = setLineStyle

export function getCurrentStyle(currentNode: HTMLElement) {
    let selection = window.getSelection()
    if (selection == null) return null
    let node = selection.anchorNode as HTMLElement
    if (node == null) return null
    if (node instanceof Text) node = node.parentElement as HTMLElement
    if (node == currentNode) return null
    if (editor == null || !editor.contains(node)) return null

    if (node.tagName == 'SPAN') {
        let p = node.parentElement as HTMLElement
        if (p.tagName == 'P') {
            currentStyle['text-align'] = p.style.getPropertyValue('text-align')
            currentStyle['list-style-type'] = p.style.getPropertyValue('list-style-type')
            currentStyle['text-decoration'] = node.style.getPropertyValue('text-decoration')
            currentStyle['font-weight'] = node.style.getPropertyValue('font-weight')
            currentStyle['font-style'] = node.style.getPropertyValue('font-style')
            currentStyle['color'] = node.style.getPropertyValue('color')
            currentStyle['font-family'] = node.style.getPropertyValue('font-family')
            currentStyle['font-size'] = node.style.getPropertyValue('font-size')
            return [node, currentStyle]
        }
    }
    return null
}
(window as any).getCurrentStyle = getCurrentStyle

export function getEditorContent() {
    if (editor == null) return
    let content = []
    let paragraphs = editor.childNodes
    for (let i = 0; i < paragraphs.length; i++) {
        let p = paragraphs[i] as HTMLElement
        if (p.tagName == 'P') {
            let pContent = {
                style: {
                    'text-align': p.style.getPropertyValue('text-align'),
                    'list-style-type': p.style.getPropertyValue('list-style-type')
                },
                content: [] as any
            }
            let spans = p.childNodes
            let lastSpan: any = null
            for (let i = 0; i < spans.length; i++) {
                let s = spans[i] as HTMLElement
                if (s.tagName == 'SPAN') {
                    if (s.textContent) {
                        let currentSpan: any = {
                            text: s.textContent,
                            style: {
                                'text-decoration': s.style.getPropertyValue('text-decoration'),
                                'font-weight': s.style.getPropertyValue('font-weight'),
                                'font-style': s.style.getPropertyValue('font-style'),
                                'color': s.style.getPropertyValue('color'),
                                'font-family': s.style.getPropertyValue('font-family'),
                                'font-size': s.style.getPropertyValue('font-size'),
                            }
                        }
                        if (lastSpan && Object.keys(lastSpan.style).every(key => lastSpan.style[key] == currentSpan.style[key])) {
                            lastSpan.text += currentSpan.text
                        } else {
                            pContent.content.push(currentSpan)
                            lastSpan = currentSpan
                        }
                    }
                }
            }
            content.push(pContent)
        }
    }
    return content
}
(window as any).getEditorContent = getEditorContent

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
    if (editor == null) return

    editor.innerHTML = ''

    editor.addEventListener("keydown", (e) => {
        let selection = window.getSelection()
        if (selection == null) return
        let node = selection.anchorNode
        if (node == null) return
        const isPrintable = e.key.length === 1 && !e.ctrlKey && !e.metaKey;

        if (node == editor) {
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
        } else if ((node as HTMLElement).tagName == 'P') {
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
                return
            }
        } else if ((node as HTMLElement).tagName == 'SPAN') {
            if (isPrintable) {
                if (!node.textContent?.length) {
                    node.textContent = e.key
                    window.getSelection()?.setPosition(node, 1)
                    e.preventDefault()
                    e.stopPropagation()
                    return
                }
            }
        }
        // else if (node instanceof Text) {
        //     if (node.parentElement?.tagName == 'SPAN') {
        //         if (isPrintable) {
        //             let sibling = node.parentElement.nextSibling
        //             if (sibling && sibling.textContent?.length == 0) {
        //                 sibling.textContent = e.key
        //                 window.getSelection()?.setPosition(sibling, 1)
        //                 e.preventDefault()
        //                 e.stopPropagation()
        //                 return
        //             }
        //         }
        //     }
        // }
    })
}

const editor = document.getElementById("editor")

editorInit()