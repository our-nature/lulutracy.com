const React = require('react')

const GatsbyImage = jest
  .fn()
  .mockImplementation(({ alt, ...rest }) =>
    React.createElement('img', { src: 'test-image.jpg', alt, ...rest })
  )

const StaticImage = jest
  .fn()
  .mockImplementation(({ src, alt, ...rest }) =>
    React.createElement('img', { src, alt, ...rest })
  )

const getImage = jest.fn().mockImplementation((image) => image)

// getSrc extracts the fallback src from gatsbyImageData
const getSrc = jest
  .fn()
  .mockImplementation((imageData) => imageData?.images?.fallback?.src)

module.exports = {
  GatsbyImage,
  StaticImage,
  getImage,
  getSrc,
}
