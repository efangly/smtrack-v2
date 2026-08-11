async function captureCanvas(element: HTMLElement): Promise<HTMLCanvasElement> {
  // html2canvas (1.4.x, unmaintained for this) can't parse the color-mix()/oklch()
  // CSS functions Tailwind 4 and `.viz-root` chart variables use — html2canvas-pro
  // is the maintained fork that added Color 4 support, drop-in API-compatible.
  const { default: html2canvas } = await import('html2canvas-pro')
  // ภาพ export ต้องพื้นหลังขาวเสมอไม่ว่า app จะอยู่ theme ไหน (ผู้เรียกทับ --chart-* เป็นค่า
  // light theme ไว้ก่อนหน้านี้แล้วเช่นกัน ดู TelemetryChartModal.LIGHT_CHART_VARS)
  return html2canvas(element, {
    backgroundColor: '#ffffff',
    scale: 2,
  })
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export async function exportChartAsPng(element: HTMLElement, filename: string) {
  const canvas = await captureCanvas(element)
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/png'),
  )
  if (blob) downloadBlob(blob, `${filename}.png`)
}

export async function exportChartAsJpg(element: HTMLElement, filename: string) {
  const canvas = await captureCanvas(element)
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/jpeg', 0.92),
  )
  if (blob) downloadBlob(blob, `${filename}.jpg`)
}

export async function exportChartAsPdf(element: HTMLElement, filename: string) {
  const canvas = await captureCanvas(element)
  const { jsPDF } = await import('jspdf')

  const orientation = canvas.width > canvas.height ? 'l' : 'p'
  const pdf = new jsPDF({ orientation, unit: 'px', format: [canvas.width, canvas.height] })
  pdf.addImage(
    canvas.toDataURL('image/png'),
    'PNG',
    0,
    0,
    canvas.width,
    canvas.height,
  )
  pdf.save(`${filename}.pdf`)
}
