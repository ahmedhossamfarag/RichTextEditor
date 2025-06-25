import Alpine from 'alpinejs'

declare global {
  interface Window {
    Alpine: typeof Alpine
  }
}

window.Alpine = Alpine
Alpine.start()


function setStyle(style: string, value: string) {
    
}

function setLineStyle(style: string, value: string) {

}