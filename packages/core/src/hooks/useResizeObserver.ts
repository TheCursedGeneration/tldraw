import { useTLContext } from '+hooks'
import * as React from 'react'
import { Utils } from '+utils'

export function useResizeObserver<T extends HTMLElement | SVGElement>(ref: React.RefObject<T>) {
  const { inputs } = useTLContext()
  const rIsMounted = React.useRef(false)
  const forceUpdate = React.useReducer((x) => x + 1, 0)[1]

  const updateOffsets = React.useCallback(() => {
    if (rIsMounted.current) {
      const rect = ref.current?.getBoundingClientRect()
      if (rect) {
        inputs.offset = [rect.left, rect.top]
        inputs.size = [rect.width, rect.height]
        forceUpdate()
      }
    }
    rIsMounted.current = true
  }, [ref, forceUpdate])

  React.useEffect(() => {
    const debouncedUpdateOffsets = Utils.debounce(updateOffsets, 100)
    window.addEventListener('scroll', debouncedUpdateOffsets)
    window.addEventListener('resize', debouncedUpdateOffsets)
    return () => {
      window.removeEventListener('scroll', debouncedUpdateOffsets)
      window.removeEventListener('resize', debouncedUpdateOffsets)
    }
  }, [inputs])

  React.useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      if (inputs.isPinching) {
        return
      }

      if (entries[0].contentRect) {
        updateOffsets()
      }
    })

    if (ref.current) {
      resizeObserver.observe(ref.current)
    }

    return () => {
      resizeObserver.disconnect()
    }
  }, [ref, inputs])

  React.useEffect(() => {
    updateOffsets()
  }, [ref])
}