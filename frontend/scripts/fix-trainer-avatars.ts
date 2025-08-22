import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'
import https from 'https'
import http from 'http'

const prisma = new PrismaClient()

// Directory to save avatars
const AVATAR_DIR = '/Users/soss/htdocs/fitq-vibes/frontend/public/images/avatars'

// Ensure directory exists
if (!fs.existsSync(AVATAR_DIR)) {
  fs.mkdirSync(AVATAR_DIR, { recursive: true })
}

async function downloadImage(url: string, filename: string): Promise<boolean> {
  return new Promise((resolve) => {
    const filePath = path.join(AVATAR_DIR, filename)
    const file = fs.createWriteStream(filePath)
    
    const protocol = url.startsWith('https') ? https : http
    
    protocol.get(url, (response) => {
      if (response.statusCode !== 200) {
        file.close()
        fs.unlinkSync(filePath)
        resolve(false)
        return
      }
      
      response.pipe(file)
      file.on('finish', () => {
        file.close()
        resolve(true)
      })
    }).on('error', (err) => {
      file.close()
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
      }
      resolve(false)
    })
  })
}

async function main() {
  console.log('Fixing trainer avatars...')

  // Get all trainers
  const trainers = await prisma.trainer.findMany({
    include: {
      programs: true
    }
  })

  for (const trainer of trainers) {
    // Get user data
    const user = await prisma.user.findUnique({
      where: { id: trainer.id },
      select: {
        avatar: true,
        externalAvatar: true,
        name: true
      }
    })

    let newAvatarPath = null
    const filename = `trainer-${trainer.id}.jpg`

    // Try different avatar sources
    if (user?.externalAvatar) {
      let avatarUrl = user.externalAvatar
      
      // Add protocol if missing
      if (!avatarUrl.startsWith('http')) {
        avatarUrl = `https://f5bef85cec4c638e3231-250b1cf964c3a77213444ba2f00d4811.ssl.cf3.rackcdn.com/${avatarUrl}`
      }

      // Try Stebby CDN for certain patterns
      if (avatarUrl.includes('stebby.eu') || avatarUrl.includes('cdn.stebby.eu')) {
        console.log(`Trying Stebby CDN for ${trainer.name}: ${avatarUrl}`)
        const downloaded = await downloadImage(avatarUrl, filename)
        if (downloaded) {
          newAvatarPath = `/images/avatars/${filename}`
          console.log(`✓ Downloaded avatar for ${trainer.name}`)
        }
      } else if (avatarUrl.includes('sportid.com')) {
        // SportID CDN
        console.log(`Trying SportID CDN for ${trainer.name}: ${avatarUrl}`)
        const downloaded = await downloadImage(avatarUrl, filename)
        if (downloaded) {
          newAvatarPath = `/images/avatars/${filename}`
          console.log(`✓ Downloaded avatar for ${trainer.name}`)
        }
      }
    }

    // If no avatar downloaded, check if we have a local one
    if (!newAvatarPath) {
      const localPaths = [
        `/images/trainers/${trainer.slug}.png`,
        `/images/trainers/${trainer.name.toLowerCase().replace(/\s+/g, '-')}.png`,
        `/images/trainers/avatar.png`
      ]

      for (const localPath of localPaths) {
        const fullPath = `/Users/soss/htdocs/fitq-vibes/frontend/public${localPath}`
        if (fs.existsSync(fullPath)) {
          newAvatarPath = localPath
          console.log(`✓ Using local avatar for ${trainer.name}: ${localPath}`)
          break
        }
      }
    }

    // Default avatar if nothing else works
    if (!newAvatarPath) {
      newAvatarPath = '/images/trainers/avatar.png'
      console.log(`⚠ Using default avatar for ${trainer.name}`)
    }

    // Update trainer avatar
    await prisma.trainer.update({
      where: { id: trainer.id },
      data: { avatar: newAvatarPath }
    })
  }

  console.log('Avatar fix completed!')
  await prisma.$disconnect()
}

main()
  .catch((e) => {
    console.error('Failed to fix avatars:', e)
    process.exit(1)
  })