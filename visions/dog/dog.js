const dropZone = document.getElementById('dropZone')
const fileInput = document.getElementById('fileInput')
const humanImg = document.getElementById('humanImg')
const dogCanvas = document.getElementById('dogCanvas')
const comparison = document.getElementById('comparison')
const slider = document.getElementById('slider')
const humanLayer = document.querySelector('.human')
const ctx = dogCanvas.getContext('2d')

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
			dogCanvas.width = img.width
			dogCanvas.height = img.height
			ctx.drawImage(img, 0, 0)
			applyDogVision()
			comparison.style.display = 'block'
			updateSlider()
			slider.value = 50
		}
		img.onerror = () => console.error('Image load failed')
		img.src = e.target.result
	}
	reader.readAsDataURL(file)
}

function applyDogVision() {
	const imageData = ctx.getImageData(0, 0, dogCanvas.width, dogCanvas.height)
	const data = imageData.data

	for (let i = 0; i < data.length; i += 4) {
		let r = data[i] / 255
		let g = data[i + 1] / 255
		let b = data[i + 2] / 255

		r = (r <= 0.04045) ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4)
		g = (g <= 0.04045) ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4)
		b = (b <= 0.04045) ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4)

		const y = 0.299 * r + 0.587 * g + 0.114 * b
		const blueYellow = 1.8 * b - 0.5 * r - 0.3 * g

		let nr = y + 0.35 * blueYellow
		let ng = y + 0.30 * blueYellow
		let nb = y + 1.1 * blueYellow

		const desat = 0.45
		nr = y * (1 - desat) + nr * desat
		ng = y * (1 - desat) + ng * desat
		nb = y * (1 - desat) + nb * desat

		nr *= 1.22
		ng *= 1.25
		nb *= 0.90

		nr = (nr <= 0.0031308) ? nr * 12.92 : 1.055 * Math.pow(nr, 1 / 2.4) - 0.055
		ng = (ng <= 0.0031308) ? ng * 12.92 : 1.055 * Math.pow(ng, 1 / 2.4) - 0.055
		nb = (nb <= 0.0031308) ? nb * 12.92 : 1.055 * Math.pow(nb, 1 / 2.4) - 0.055

		data[i]		 = Math.min(255, Math.max(0, nr * 255))
		data[i + 1] = Math.min(255, Math.max(0, ng * 255))
		data[i + 2] = Math.min(255, Math.max(0, nb * 255))
	}

	ctx.putImageData(imageData, 0, 0)

	ctx.filter = 'blur(1.9px)'
	ctx.drawImage(dogCanvas, 0, 0)
	ctx.filter = 'none'

	ctx.globalAlpha = 0.80
	ctx.fillStyle = 'rgba(70, 60, 25, 0.10)'
	ctx.fillRect(0, 0, dogCanvas.width, dogCanvas.height)
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
