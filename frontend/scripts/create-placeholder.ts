import { createCanvas } from 'canvas'
import fs from 'fs'
import path from 'path'

// Create a simple placeholder image
const width = 640
const height = 360

const canvas = createCanvas(width, height)
const ctx = canvas.getContext('2d')

// Background
ctx.fillStyle = '#3e4551'
ctx.fillRect(0, 0, width, height)

// Text
ctx.fillStyle = '#60cc56'
ctx.font = 'bold 48px Arial'
ctx.textAlign = 'center'
ctx.textBaseline = 'middle'
ctx.fillText('VIDEO', width / 2, height / 2 - 20)

ctx.font = '24px Arial'
ctx.fillStyle = '#8b92a3'
ctx.fillText('Pilt puudub', width / 2, height / 2 + 30)

// Save
const buffer = canvas.toBuffer('image/png')
const outputPath = path.join(process.cwd(), 'public', 'images', 'video-placeholder.png')
fs.writeFileSync(outputPath, buffer)

console.log('Placeholder created:', outputPath)