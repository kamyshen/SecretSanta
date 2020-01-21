
let isPriceCap = document.querySelector('#isPriceCap')
let priceCap = document.querySelector('#priceCap')
if (priceCap) {isPriceCap.addEventListener('change', function() {
    if (this.checked) {
        priceCap.removeAttribute('hidden')
    } else {
        priceCap.setAttribute('hidden', '')
    }
})}

