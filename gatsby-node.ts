import path from 'path'
import fs from 'fs'
import type { GatsbyNode } from 'gatsby'
import yaml from 'js-yaml'
import glob from 'glob'
import { generateSlug, generateImageFilename } from './src/utils/slug'

// eslint-disable-next-line @typescript-eslint/no-require-imports
const piexif = require('piexifjs')

interface SiteConfig {
  name: string
  author: string
}

interface RawPainting {
  title: string
  description: string
  dimensions: string
  substrate: string
  substrateSize: string
  medium: string
  year: string
  alt: string
  order: number
}

interface PaintingsQueryResult {
  allPaintingsYaml: {
    nodes: Array<{
      paintings: RawPainting[]
    }>
  }
}

export const createPages: GatsbyNode['createPages'] = async ({
  graphql,
  actions,
}) => {
  const { createPage } = actions
  const paintingTemplate = path.resolve('./src/templates/painting.tsx')

  // Query all paintings from YAML
  const result = await graphql<PaintingsQueryResult>(`
    query {
      allPaintingsYaml {
        nodes {
          paintings {
            title
            description
            dimensions
            substrate
            substrateSize
            medium
            year
            alt
            order
          }
        }
      }
    }
  `)

  if (result.errors) {
    console.error(result.errors)
    return
  }

  // Get paintings array from YAML data
  const paintingsData = result.data?.allPaintingsYaml.nodes[0]
  if (paintingsData && paintingsData.paintings) {
    paintingsData.paintings.forEach((painting) => {
      // Derive id and image filename from title
      const id = generateSlug(painting.title)
      const image = generateImageFilename(painting.title)
      const imageName = image.replace(/\.[^/.]+$/, '')

      // Create enriched painting object with derived fields
      const enrichedPainting = {
        ...painting,
        id,
        image,
      }

      createPage({
        path: `/painting/${id}`,
        component: paintingTemplate,
        context: {
          id: id,
          painting: enrichedPainting,
          imageName: imageName,
        },
      })
    })
  }
}

/**
 * Format painting metadata for EXIF UserComment field
 */
function formatUserComment(painting: RawPainting): string {
  return [
    painting.description,
    `Medium: ${painting.medium} on ${painting.substrate}`,
    `Size: ${painting.dimensions}`,
    `Substrate: ${painting.substrateSize}`,
    `Year: ${painting.year}`,
  ].join(' | ')
}

/**
 * Inject EXIF metadata into a JPEG file
 */
function injectMetadata(
  imagePath: string,
  painting: RawPainting,
  site: SiteConfig
): void {
  const buffer = fs.readFileSync(imagePath)
  const binary = buffer.toString('binary')

  const currentYear = new Date().getFullYear()

  const exifObj = {
    '0th': {
      [piexif.ImageIFD.Artist]: site.author,
      [piexif.ImageIFD.Copyright]:
        `© ${currentYear} ${site.name}. All rights reserved.`,
      [piexif.ImageIFD.ImageDescription]: painting.title,
      [piexif.ImageIFD.Software]: site.name,
    },
    Exif: {
      [piexif.ExifIFD.UserComment]: formatUserComment(painting),
      [piexif.ExifIFD.DateTimeOriginal]: `${painting.year}:01:01 00:00:00`,
    },
  }

  const exifBytes = piexif.dump(exifObj)
  const newData = piexif.insert(exifBytes, binary)

  fs.writeFileSync(imagePath, Buffer.from(newData, 'binary'))
}

/**
 * Post-build hook to inject EXIF metadata into processed JPEG images
 */
export const onPostBuild: GatsbyNode['onPostBuild'] = async ({ reporter }) => {
  const activity = reporter.activityTimer('Injecting metadata into images')
  activity.start()

  try {
    // Load site config
    const siteYamlPath = path.join(__dirname, 'content/site/index.yaml')
    const siteYamlContent = fs.readFileSync(siteYamlPath, 'utf8')
    const siteYaml = yaml.load(siteYamlContent) as { site: SiteConfig }
    const site = siteYaml.site

    // Load paintings metadata
    const paintingsYamlPath = path.join(
      __dirname,
      'content/paintings/index.yaml'
    )
    const paintingsYamlContent = fs.readFileSync(paintingsYamlPath, 'utf8')
    const paintingsYaml = yaml.load(paintingsYamlContent) as {
      paintings: RawPainting[]
    }
    const paintings = paintingsYaml.paintings

    // Create painting lookup by slug
    const paintingMap = new Map<string, RawPainting>()
    for (const painting of paintings) {
      const slug = generateSlug(painting.title)
      paintingMap.set(slug, painting)
    }

    // Find all JPEGs in public/static
    const publicPath = path.join(__dirname, 'public', 'static')
    const jpegFiles = glob.sync(`${publicPath}/**/*.jpg`)

    // Inject metadata into each JPEG
    let processed = 0
    let skipped = 0

    for (const jpegPath of jpegFiles) {
      const filename = path.basename(jpegPath, '.jpg')
      const painting = paintingMap.get(filename)

      if (painting) {
        try {
          injectMetadata(jpegPath, painting, site)
          processed++
        } catch (err) {
          reporter.warn(`Failed to inject metadata into ${jpegPath}: ${err}`)
          skipped++
        }
      }
    }

    activity.end()
    reporter.info(
      `Injected metadata into ${processed} images (${skipped} skipped)`
    )
  } catch (err) {
    activity.end()
    reporter.warn(`Failed to inject image metadata: ${err}`)
  }
}
