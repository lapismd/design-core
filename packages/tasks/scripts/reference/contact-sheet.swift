#!/usr/bin/env swift
import AppKit

guard CommandLine.arguments.count >= 4 else {
  fputs("Usage: contact-sheet.swift <output> <input> <input> [input...]\n", stderr)
  exit(64)
}

let output = URL(fileURLWithPath: CommandLine.arguments[1])
let inputs = CommandLine.arguments.dropFirst(2).map { URL(fileURLWithPath: $0) }
let targetHeight: CGFloat = 240

let images = inputs.compactMap(NSImage.init(contentsOf:))
guard images.count == inputs.count else {
  fputs("Could not read every contact-sheet image.\n", stderr)
  exit(66)
}

let widths = images.map { max(1, ($0.size.width / $0.size.height * targetHeight).rounded()) }
let totalWidth = widths.reduce(0, +)
guard let bitmap = NSBitmapImageRep(
  bitmapDataPlanes: nil,
  pixelsWide: Int(totalWidth),
  pixelsHigh: Int(targetHeight),
  bitsPerSample: 8,
  samplesPerPixel: 4,
  hasAlpha: true,
  isPlanar: false,
  colorSpaceName: .deviceRGB,
  bytesPerRow: 0,
  bitsPerPixel: 0
) else {
  fputs("Could not create contact-sheet bitmap.\n", stderr)
  exit(70)
}

NSGraphicsContext.saveGraphicsState()
defer { NSGraphicsContext.restoreGraphicsState() }
NSGraphicsContext.current = NSGraphicsContext(bitmapImageRep: bitmap)
NSColor(calibratedWhite: 0.95, alpha: 1).setFill()
NSBezierPath(rect: NSRect(x: 0, y: 0, width: totalWidth, height: targetHeight)).fill()

var x: CGFloat = 0
for (index, image) in images.enumerated() {
  let width = widths[index]
  image.draw(in: NSRect(x: x, y: 0, width: width, height: targetHeight))
  x += width
}

guard let data = bitmap.representation(using: .jpeg, properties: [.compressionFactor: 0.92]) else {
  fputs("Could not encode contact sheet.\n", stderr)
  exit(70)
}
try FileManager.default.createDirectory(at: output.deletingLastPathComponent(), withIntermediateDirectories: true)
try data.write(to: output)
