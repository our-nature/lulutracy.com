import React, { useState } from 'react'
import { graphql, PageProps, HeadFC } from 'gatsby'
import {
  GatsbyImage,
  getImage,
  getSrc,
  IGatsbyImageData,
} from 'gatsby-plugin-image'
import Layout from '../components/Layout'
import GlassMagnifier from '../components/GlassMagnifier'
import type { Painting } from '../types'
import * as styles from './painting.module.css'

interface PaintingPageContext {
  id: string
  painting: Painting
  imageName: string
}

interface PaintingPageData {
  file: {
    childImageSharp: {
      gatsbyImageData: IGatsbyImageData
    }
  } | null
  zoomFile: {
    childImageSharp: {
      gatsbyImageData: IGatsbyImageData
    }
  } | null
}

const PaintingTemplate: React.FC<
  PageProps<PaintingPageData, PaintingPageContext>
> = ({ data, pageContext }) => {
  const { painting } = pageContext
  const [magnifierError, setMagnifierError] = useState(false)

  const imageData = data.file?.childImageSharp
    ? getImage(data.file.childImageSharp.gatsbyImageData)
    : null
  const zoomImageData = data.zoomFile?.childImageSharp?.gatsbyImageData

  // Get URLs for the magnifier using Gatsby's official getSrc helper
  const displayImageData = data.file?.childImageSharp?.gatsbyImageData
  const displayUrl = displayImageData ? getSrc(displayImageData) : undefined
  const zoomUrl = zoomImageData ? getSrc(zoomImageData) : displayUrl

  // Check if we have valid URLs for the magnifier (and no previous error)
  const canUseMagnifier = displayUrl && zoomUrl && !magnifierError

  const handleMagnifierError = () => {
    setMagnifierError(true)
  }

  return (
    <Layout>
      <article className={styles.paintingDetail}>
        <div className={styles.imageContainer}>
          {canUseMagnifier ? (
            <GlassMagnifier
              src={displayUrl}
              zoomSrc={zoomUrl}
              alt={painting.alt}
              className={styles.magnifierContainer}
              zoomFactor={2.5}
              enableTouch={true}
              onError={handleMagnifierError}
            />
          ) : imageData ? (
            <GatsbyImage
              image={imageData}
              alt={painting.alt}
              className={styles.image}
            />
          ) : (
            <div className={styles.placeholder}>
              <span>Image not available</span>
            </div>
          )}
        </div>

        <div className={styles.metadata}>
          <span className={styles.category}>PAINTING</span>
          <h1 className={styles.title}>{painting.title}</h1>
          <p className={styles.info}>
            Size: {painting.dimensions} | Canvas Size: {painting.canvasSize} |{' '}
            Medium: {painting.medium}
          </p>
          <p className={styles.year}>{painting.year}</p>
        </div>
      </article>
    </Layout>
  )
}

export default PaintingTemplate

export const Head: HeadFC<PaintingPageData, PaintingPageContext> = ({
  pageContext,
}) => {
  const { painting } = pageContext
  return (
    <>
      <title>{painting.title} | Lulu Tracy</title>
      <meta name="description" content={painting.description} />
    </>
  )
}

export const query = graphql`
  query PaintingPage($imageName: String!) {
    file(
      sourceInstanceName: { eq: "paintingImages" }
      name: { eq: $imageName }
    ) {
      childImageSharp {
        gatsbyImageData(
          width: 1200
          placeholder: DOMINANT_COLOR
          formats: [AUTO, WEBP, AVIF]
          quality: 85
        )
      }
    }
    zoomFile: file(
      sourceInstanceName: { eq: "paintingImages" }
      name: { eq: $imageName }
    ) {
      childImageSharp {
        gatsbyImageData(
          width: 2400
          placeholder: NONE
          formats: [AUTO, WEBP]
          quality: 95
        )
      }
    }
  }
`
