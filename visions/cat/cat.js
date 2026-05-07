const dropZone = document.getElementById('dropZone')
const fileInput = document.getElementById('fileInput')
const humanImg = document.getElementById('humanImg')
const catCanvas = document.getElementById('catCanvas')
const comparison = document.getElementById('comparison')
const slider = document.getElementById('slider')
const humanLayer = document.querySelector('.human')
const ctx = catCanvas.getContext('2d')

dropZone.addEventListener('click', () => fileInput.click())

fileInput.addEventListener('change', e => {
	const file = e.target.files[0]
	if (file) processFile(file)
})

dropZone.addEventListener('dragover', e => {
	e.preventDefault()
	dropZone.classList.add('dragover')
})

dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'))

dropZone.addEventListener('drop', e => {
	e.preventDefault()
	dropZone.classList.remove('dragover')
	const file = e.dataTransfer.files[0]
	if (file) processFile(file)
})

function processFile(file) {
	if (!file || !file.type.startsWith('image/')) return

	const reader = new FileReader()
	reader.onload = e => {
		humanImg.src = e.target.result
		const img = new Image()
		img.onload = () => {
			catCanvas.width = img.width
			catCanvas.height = img.height
			ctx.drawImage(img, 0, 0)
			applyCatVision()
			comparison.style.display = 'block'
			updateSlider()
			slider.value = 50
		}
		img.onerror = () => console.error('Image load failed')
		img.src = e.target.result
	}
	reader.readAsDataURL(file)
}

function applyCatVision() {
	const imageData = ctx.getImageData(0, 0, catCanvas.width, catCanvas.height)
	const data = imageData.data

	for (let i = 0; i < data.length; i += 4) {
		let r = data[i]
		let g = data[i + 1]
		let b = data[i + 2]

		// Slight blue-green tint
		const avg = (r + g + b) / 3

		r = avg * 0.9
		g = avg * 1.05
		b = avg * 1.15

		// Increase night-like brightness
		r *= 1.1
		g *= 1.15
		b *= 1.2

		data[i] = Math.min(255, r)
		data[i + 1] = Math.min(255, g)
		data[i + 2] = Math.min(255, b)
	}

	ctx.putImageData(imageData, 0, 0)

	// Slight blur for softer feline vision
	ctx.filter = 'blur(1.2px) brightness(1.1)'
	ctx.drawImage(catCanvas, 0, 0)
	ctx.filter = 'none'

	// Dark vignette effect
	ctx.globalAlpha = 0.18
	ctx.fillStyle = 'rgba(20, 40, 60, 0.25)'
	ctx.fillRect(0, 0, catCanvas.width, catCanvas.height)
	ctx.globalAlpha = 1.0
}

function updateSlider() {
	if (!slider || !humanLayer) return
	const value = slider.value
	humanLayer.style.clipPath = `inset(0 ${100 - value}% 0 0)`
}

if (slider) {
	slider.addEventListener('input', updateSlider)
	slider.addEventListener('change', updateSlider)
}
