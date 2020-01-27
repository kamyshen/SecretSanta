
let isPriceCap = document.querySelector('#isPriceCap')
let priceCap = document.querySelector('#priceCap')
if (priceCap) {isPriceCap.addEventListener('change', function() {
    if (this.checked) {
        priceCap.removeAttribute('hidden')
    } else {
        priceCap.setAttribute('hidden', '')
    }
})}

// let lang = document.querySelector('#lang')
// let ru = document.querySelector('#ru')
// let en = document.querySelector('#en')
// ru.addEventListener('click', () => {
//     lang.textContent = "RU"
// })
// en.addEventListener('click', () => {
//     lang.textContent = "EN"
// })
