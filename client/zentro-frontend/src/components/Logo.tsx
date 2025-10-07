import React from 'react'

interface LogoProps {
  width?: number
  notext?: boolean
}

export default function Logo({ width = 72, notext = false }: LogoProps) {
  return <img src={notext ? '/Icon-notext.svg' : '/TEXT.svg'} className='logo' width={width} />
}
