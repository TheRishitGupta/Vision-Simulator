const dropZone = document.getElementById('dropZone')
const fileInput = document.getElementById('fileInput')
const humanImg = document.getElementById('humanImg')
const snakeCanvas = document.getElementById('snakeCanvas')
const comparison = document.getElementById('comparison')
const slider = document.getElementById('slider')
const humanLayer = document.querySelector('.human')
const ctx = snakeCanvas.getContext('2d')

document.addEventListener('dragover', e => e.preventDefault())
document.addEventListener('drop', e => e.preventDefault())

dropZone.addEventListener('click', () => fileInput.click())

fileInput.addEventListener('change', e => {
	const file = e.target.files[0]
	if (file) processFile(file)
})

dropZone.addEventListener('dragover', e => {
	e.preventDefault()
	dropZone.classList.add('dragover')
})

dropZone.addEventListener('dragleave', () => {
	dropZone.classList.remove('dragover')
})

dropZone.addEventListener('drop', e => {
	e.preventDefault()
	dropZone.classList.remove('dragover')

	const file = e.dataTransfer.files[0]
	if (file) processFile(file)
})

function processFile(file) {
	if (!file || !file.type.startsWith('image/')) {
		alert("Please upload a valid image!")
		return
	}

	const reader = new FileReader()
	reader.onload = e => {
		humanImg.src = e.target.result

		const img = new Image()
		img.onload = () => {
			snakeCanvas.width = img.width
			snakeCanvas.height = img.height

			ctx.clearRect(0, 0, snakeCanvas.width, snakeCanvas.height)
			ctx.drawImage(img, 0, 0)

			applySnakeVision()

			comparison.style.display = 'block'
			slider.value = 50
			updateSlider()
		}
		img.src = e.target.result
	}
	reader.readAsDataURL(file)
}

function applySnakeVision() {
	const imageData = ctx.getImageData(0, 0, snakeCanvas.width, snakeCanvas.height)
	const data = imageData.data

	for (let i = 0; i < data.length; i += 4) {
		let r = data[i]
		let g = data[i + 1]
		let b = data[i + 2]

		let brightness = (r + g + b) / 3

		let nr = brightness * 1.5
		let ng = brightness * 0.6
		let nb = brightness * 0.1

		data[i] = Math.min(255, nr)
		data[i + 1] = Math.min(255, ng)
		data[i + 2] = Math.min(255, nb)
	}

	ctx.putImageData(imageData, 0, 0)

	ctx.filter = 'blur(2.5px)'
	ctx.drawImage(snakeCanvas, 0, 0)
	ctx.filter = 'none'

	ctx.globalAlpha = 0.25
	ctx.fillStyle = 'rgba(255, 80, 0, 0.3)'
	ctx.fillRect(0, 0, snakeCanvas.width, snakeCanvas.height)
	ctx.globalAlpha = 1.0
}

function updateSlider() {
	if (!slider || !humanLayer) return
	const value = slider.value
	humanLayer.style.clipPath = `inset(0 ${100 - value}% 0 0)`
}

slider.addEventListener('input', updateSlider)
slider.addEventListener('change', updateSlider)