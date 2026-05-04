const dropZone = document.getElementById('dropZone')
const fileInput = document.getElementById('fileInput')
const humanImg = document.getElementById('humanImg')
const birdCanvas = document.getElementById('birdCanvas')
const comparison = document.getElementById('comparison')
const slider = document.getElementById('slider')
const humanLayer = document.querySelector('.human')
const ctx = birdCanvas.getContext('2d')

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
			birdCanvas.width = img.width
			birdCanvas.height = img.height
			ctx.drawImage(img, 0, 0)
			applyBirdVision()
			comparison.style.display = 'block'
			updateSlider()
			slider.value = 50
		}
		img.onerror = () => console.error('Image load failed')
		img.src = e.target.result
	}
	reader.readAsDataURL(file)
}

function applyBirdVision() {
	const imageData = ctx.getImageData(0, 0, birdCanvas.width, birdCanvas.height)
	const data = imageData.data

	for (let i = 0; i < data.length; i += 4) {
		let r = data[i]
		let g = data[i + 1]
		let b = data[i + 2]

		const gray = 0.299 * r + 0.587 * g + 0.114 * b
		const saturation = 1.6
		r = gray + (r - gray) * saturation
		g = gray + (g - gray) * saturation
		b = gray + (b - gray) * saturation

		r *= 1.2
		g *= 0.9
		b *= 1.5

		data[i] = Math.min(255, Math.max(0, r))
		data[i + 1] = Math.min(255, Math.max(0, g))
		data[i + 2] = Math.min(255, Math.max(0, b))
	}

	ctx.putImageData(imageData, 0, 0)

	ctx.filter = 'contrast(1.2) brightness(1.1) saturate(1.2)'
	ctx.drawImage(birdCanvas, 0, 0)
	ctx.filter = 'none'

	ctx.globalAlpha = 0.15
	ctx.fillStyle = 'rgba(255, 0, 255, 0.1)'
	ctx.fillRect(0, 0, birdCanvas.width, birdCanvas.height)
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
