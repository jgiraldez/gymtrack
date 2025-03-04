import fs from 'fs'
import path from 'path'

const UI_DIR = path.join(process.cwd(), 'components', 'ui')

function addUseClient(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf-8')
  if (!content.startsWith('"use client"')) {
    const newContent = '"use client"\n\n' + content
    fs.writeFileSync(filePath, newContent)
    console.log(`Added "use client" to ${filePath}`)
  }
}

function processDirectory(dir: string) {
  const files = fs.readdirSync(dir)
  for (const file of files) {
    const filePath = path.join(dir, file)
    if (fs.statSync(filePath).isDirectory()) {
      processDirectory(filePath)
    } else if (file.endsWith('.tsx')) {
      addUseClient(filePath)
    }
  }
}

processDirectory(UI_DIR) 