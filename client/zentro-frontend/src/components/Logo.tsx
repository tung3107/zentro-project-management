import React from 'react'

export default function Logo({ width = 72 }: { width?: number }) {
  return <img src='/TEXT.svg' className='logo' width={width} />
}
