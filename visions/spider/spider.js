const dropZone = document.getElementById('dropZone')
const fileInput = document.getElementById('fileInput')
const humanImg = document.getElementById('humanImg')
const spiderCanvas = document.getElementById('spiderCanvas')
const comparison = document.getElementById('comparison')
const slider = document.getElementById('slider')
const humanLayer = document.querySelector('.human')

const ctx = spiderCanvas.getContext('2d')

// CLICK TO UPLOAD
dropZone.addEventListener('click', () => {
    fileInput.click()
})

// FILE SELECT
fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0]

    if (file) {
        processFile(file)
    }
})

// DRAG OVER
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault()
    dropZone.classList.add('dragover')
})

// DRAG LEAVE
dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover')
})

// DROP IMAGE
dropZone.addEventListener('drop', (e) => {
    e.preventDefault()

    dropZone.classList.remove('dragover')

    const file = e.dataTransfer.files[0]

    if (file) {
        processFile(file)
    }
})

// PROCESS IMAGE
function processFile(file) {

    if (!file.type.startsWith('image/')) {
        return
    }

    const reader = new FileReader()

    reader.onload = (e) => {

        humanImg.src = e.target.result

        const img = new Image()

        img.onload = () => {

            spiderCanvas.width = img.width
            spiderCanvas.height = img.height

            ctx.clearRect(0, 0, spiderCanvas.width, spiderCanvas.height)

            ctx.drawImage(img, 0, 0)

            applySpiderVision()

            comparison.style.display = 'block'

            slider.value = 50
            updateSlider()
        }

        img.src = e.target.result
    }

    reader.readAsDataURL(file)
}

// SPIDER VISION EFFECT
function applySpiderVision() {

    const imageData = ctx.getImageData(
        0,
        0,
        spiderCanvas.width,
        spiderCanvas.height
    )

    const data = imageData.data

    for (let i = 0; i < data.length; i += 4) {

        let r = data[i]
        let g = data[i + 1]
        let b = data[i + 2]

        const avg = (r + g + b) / 3

        // UV purple tint
        r = avg * 1.2
        g = avg * 0.7
        b = avg * 1.5

        // Contrast boost
        const contrast = 1.4

        r = ((r - 128) * contrast) + 128
        g = ((g - 128) * contrast) + 128
        b = ((b - 128) * contrast) + 128

        data[i] = Math.max(0, Math.min(255, r))
        data[i + 1] = Math.max(0, Math.min(255, g))
        data[i + 2] = Math.max(0, Math.min(255, b))
    }

    ctx.putImageData(imageData, 0, 0)

    // HEXAGON OVERLAY
    ctx.strokeStyle = 'rgba(255,255,255,0.08)'
    ctx.lineWidth = 1

    const size = 35
    const h = Math.sqrt(3) * size

    for (let y = 0; y < spiderCanvas.height + h; y += h) {

        for (let x = 0; x < spiderCanvas.width + size * 1.5; x += size * 1.5) {

            const offsetX =
                (Math.floor(y / h) % 2) * size * 0.75

            drawHexagon(
                x + offsetX,
                y,
                size
            )
        }
    }
}

// DRAW HEXAGON
function drawHexagon(x, y, size) {

    ctx.beginPath()

    for (let i = 0; i < 6; i++) {

        const angle = Math.PI / 3 * i

        const px = x + size * Math.cos(angle)
        const py = y + size * Math.sin(angle)

        if (i === 0) {
            ctx.moveTo(px, py)
        } else {
            ctx.lineTo(px, py)
        }
    }

    ctx.closePath()
    ctx.stroke()
}

// SLIDER
function updateSlider() {

    const value = slider.value

    humanLayer.style.clipPath =
        `inset(0 ${100 - value}% 0 0)`
}

slider.addEventListener('input', updateSlider)