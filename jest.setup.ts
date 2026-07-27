import '@testing-library/jest-dom'

// jsdom does not implement object URLs, which ImageUploadField uses for previews.
URL.createObjectURL ??= jest.fn(() => 'blob:preview')
URL.revokeObjectURL ??= jest.fn()

// jsdom does not implement <dialog> modal behavior.
if (typeof HTMLDialogElement !== 'undefined') {
  HTMLDialogElement.prototype.showModal = function showModal(
    this: HTMLDialogElement,
  ) {
    this.setAttribute('open', '')
  }
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    this.removeAttribute('open')
  }
}
