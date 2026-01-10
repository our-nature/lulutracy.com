import React from 'react'
import type { GatsbyBrowser } from 'gatsby'
import PageTransition from './src/components/PageTransition'

export const wrapPageElement: GatsbyBrowser['wrapPageElement'] = ({
  element,
  props,
}) => {
  return <PageTransition location={props.location}>{element}</PageTransition>
}
