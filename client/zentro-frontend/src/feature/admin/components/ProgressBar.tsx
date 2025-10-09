import React from 'react'

export default function ProgressBar({ currentStep }: { currentStep: number }) {
  return (
    <div className='flex items-center justify-between mt-6 w-full'>
      {/* Step 1 */}
      <div className='flex items-center flex-1'>
        <div
          className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-semibold shadow-sm flex-shrink-0 transition-colors ${
            currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
          }`}
        >
          {currentStep > 1 ? '✓' : '1'}
        </div>
        <div
          className={`h-[4px] flex-1 rounded-full mx-6 transition-colors ${
            currentStep > 1 ? 'bg-blue-500' : 'bg-gray-200'
          }`}
        ></div>
      </div>

      {/* Step 2 */}
      <div className='flex items-center flex-1'>
        <div
          className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-semibold flex-shrink-0 transition-colors ${
            currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
          }`}
        >
          {currentStep > 2 ? '✓' : '2'}
        </div>
        <div
          className={`h-[4px] flex-1 rounded-full mx-6 transition-colors ${
            currentStep > 2 ? 'bg-blue-500' : 'bg-gray-200'
          }`}
        ></div>
      </div>

      {/* Step 3 */}
      <div
        className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-semibold flex-shrink-0 transition-colors ${
          currentStep === 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
        }`}
      >
        3
      </div>
    </div>
  )
}
