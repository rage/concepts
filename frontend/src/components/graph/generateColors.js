#!/usr/bin/env node
/* eslint-env node */
const fs = require('fs')

const ColorContrastChecker = require('color-contrast-checker')
const colorsRaw = require('@material-ui/core/colors')

const includedColors = [
  'red', 'purple', 'indigo', 'lightBlue', 'green', 'lime', 'orange', 'brown', 'grey'
]

const colorLists = []
let foregroundColors
for (const [name, color] of Object.entries(colorsRaw)) {
  if (!Object.hasOwnProperty.call(color, '50')) {
    foregroundColors = Object.values(color)
    continue
  } else if (!includedColors.includes(name)) {
    continue
  }
  delete color['50']
  delete color['100']
  delete color['200']
  delete color['400']
  delete color['600']
  delete color['800']
  colorLists.push(Object.values(color))
}

const colors = []
for (const i of [0, 4, 2, 6, 3, 7, 5, 1]) {
  for (const colorList of colorLists) {
    colors.push(colorList[i])
  }
}
for (let i = 1; i < 8; i += 2) {
  for (const colorList of colorLists) {
    colors.push(colorList[i])
  }
}

const hexRegex = /^#([a-f\d]{1,2})([a-f\d]{1,2})([a-f\d]{1,2})$/

function hexToRGB(hex) {
  const result = hexRegex.exec(hex)
  return result ? [parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)] : null
}

const fontSize = 14
const ccc = new ColorContrastChecker()
const finalColors = colors.map(bg => {
  for (const fg of foregroundColors) {
    if (ccc.isLevelAA(fg, bg, fontSize)) {
      return {
        bg: hexToRGB(bg),
        fg: hexToRGB(fg)
      }
    }
  }
  return null
}).filter(color => color !== null)

fs.writeFile('colors.json', JSON.stringify(finalColors), err => err
  ? console.error(err)
  : console.log(`Wrote ${finalColors.length} colors to colors.json`))
